import validator from 'validator';
import bcrypt from 'bcrypt';
import userModel from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import {v2 as cloudinary} from 'cloudinary';
import doctorModel from '../models/doctorModel.js';
import appointmentModel from '../models/appointmentModel.js';
import razorpay from 'razorpay';
import { isValidSlot, claimSlot, releaseSlot, cancelAndReleaseSlot } from '../utils/slots.js';



// API to register user
const registerUser = async (req, res) => {
    try {
        const {name, email, password} = req.body;
        //CHECKING FOR ALL DATA TO ADD DOCTOR
        if(!name || !email || !password){
            return res.json({sucess:false, message:"Missing details"})
        }
        //validating email format
        if(!validator.isEmail(email)){
            return res.json({success:false, message:"Enter a valid Email"})
        }
        //validating strong password
        if(password.length < 8){
            return res.json({success:false, message:"Password must be atleast 8 characters"})
        }
        //hashing user password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,
            email,
            password: hashedPassword
        }
        const newUser = new userModel(userData)
        const user = await newUser.save()

        //create user token using _id
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
        res.json({success:true, token})

        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

// API for user login
const loginUser = async (req, res) => {
    try {
        const {email, password} = req.body;
        const user = await userModel.findOne({
            email
        })
        if(!user){
            return res.json({success:false, message: "User does not exist"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(isMatch){
            //create user token using _id
            const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
            res.json({success:true, token})
        } else {
            res.json({success:false, message: "Invalid Credentials"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const {userId} = req.body;
        const userData = await userModel.findById(userId).select('-password')
        res.json({success:true, userData})
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

// API to update user profile data
const updateProfile = async (req, res) => {
    try {
        const {userId, name, phone, address, dob, gender} = req.body;
        const imageFile = req.file;
        console.log(req.body)
        if(!name || !phone || !dob || !gender){
            return res.json({success:false, message:"Data Missing"})
        }
        await userModel.findByIdAndUpdate(userId, {name, phone, address: JSON.parse(address), dob, gender})

        if(imageFile){
            //upload image to cloudinary
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                resource_type: 'image'
            })
            const imageURL = imageUpload.secure_url;
            await userModel.findByIdAndUpdate
            (userId, {image:imageURL})
        }
        res.json({success:true, message:"Profile Updated"})

        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
        
    }
}

// API to book appointment
const bookAppointment = async (req, res) => {
    try {
        const {userId, docId, slotDate, slotTime} = req.body;
        const symptoms = typeof req.body.symptoms === 'string' ? req.body.symptoms.trim().slice(0, 500) : ''
        if (!isValidSlot(slotDate, slotTime)) {
            return res.json({success:false, message:"Invalid slot"})
        }

        // claim the slot in one atomic update, so two requests can't both get it
        const doctor = await claimSlot(docId, slotDate, slotTime)
        if (!doctor) {
            const existing = await doctorModel.findById(docId).select('availability')
            if (!existing) return res.json({success:false, message:"Doctor not found"})
            if (!existing.availability) return res.json({success:false, message:"Doctor is not available"})
            return res.json({success:false, message:"Slot not available"})
        }

        const userData = await userModel.findById(userId).select('-password')

        const docData = doctor.toObject()
        delete docData.slots_booked

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount:docData.fees,
            slotTime,
            slotDate,
            symptoms,
            date: Date.now()
        }
        try {
            await appointmentModel.create(appointmentData)
        } catch (error) {
            // don't leave the slot blocked if the appointment couldn't be saved
            await releaseSlot(docId, slotDate, slotTime)
            if (error.code === 11000) {
                return res.json({success:false, message:"Slot not available"})
            }
            throw error
        }

        res.json({success:true, message:"Appointment Booked"})





        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
        
    }
}

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {
        const {userId} = req.body;
        const appointments = await appointmentModel.find({userId})
        res.json({success:true, appointments})
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

//API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const {userId, appointmentId} = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId)
        //verify appointment user
        if(!appointmentData || appointmentData.userId !== userId){
            return res.json({success:false, message:"Unauthorized action"})
        }
        if (!(await cancelAndReleaseSlot(appointmentId))) {
            return res.json({success:false, message:"Appointment already cancelled"})
        }
        res.json({success:true, message:"Appointment Cancelled"})


        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
        
    }
}
// create razorpay instance
const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
})

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {

    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId)
    
        if(!appointmentData || appointmentData.cancelled){
            return res.json({success:false, message:"Appointment Cancelled or not found"})
        }
    
        // Creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100, // amount in paise
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        }
    
        // Creating order in razorpay
        const order = await razorpayInstance.orders.create(options)
        res.json({success:true, order})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message}) 
    }
}
// API to verify payment of razorpay
const verifyRazorpay  = async (req, res) => {
    try {
        const {razorpay_order_id} = req.body
        console.log("Body received:", req.body);
        if (!razorpay_order_id) {
            return res.status(400).json({ success: false, message: "`razorpay_order_id` is required" });
        }
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id)
        
    
        console.log(orderInfo)
        if(orderInfo.status === 'paid'){
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, {payment:true})
            console.log("Receipt ID:", orderInfo.receipt)
            res.json({success:true, message:"Payment Successful"})
        }
        
        else {
            res.json({success:false, message:"Payment Failed"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message:error.message})
        
    }

}


export {registerUser, getProfile, loginUser, updateProfile, bookAppointment, listAppointment, cancelAppointment, paymentRazorpay, verifyRazorpay}