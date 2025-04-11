import doctorModel from '../models/doctorModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js'

const changeAvailablity = async (req, res) => {
    try {
        const {docId} = req.body
        console.log(docId)
        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId, {availability: !docData.availability})
        res.json({success:true, message: "Availability changed"})

        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

const doctorList = async (req, res) => {
    try {
        const doctors = await doctorModel.find({}).select("-email -password");
        res.json({success:true, doctors})
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

// API for doctor login
const loginDoctor = async (req, res) => {
    try {
        const {email, password} = req.body
        const doctor = await doctorModel.findOne({email})
        // console.log(doctor)
        if (!doctor) {
            return res.json({success: false, message: "Invalid credentials"})
        }
        const isMatch = await bcrypt.compare(password, doctor.password)
        // console.log(isMatch)
        if(isMatch) {
            const token = jwt.sign({id: doctor._id}, process.env.JWT_SECRET)
            // console.log(token)
            res.json({success:true, message: "Login successful", token})
        } else {
            res.json({success:false, message: "Invalid credentials"})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async (req, res) => {
    try {
        const {docId} = req.body
        const appointments = await appointmentModel.find({docId})

        res.json({success:true, appointments})
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
        
    }
}

// API to mark appointment as completed for doctor panel
const appointmentCompleted = async (req, res) => {
    try {
        const {docId, appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        if(appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {isCompleted: true})
            return res.json({success:true, message:'apppointment completed'})
        } else {
            return res.json({success:false, message:'Marked failed'})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
        
    }
}

// API to cancel appointment  for doctor panel
const appointmentCancel = async (req, res) => {
    try {
        const {docId, appointmentId} = req.body
        const appointmentData = await appointmentModel.findById(appointmentId)
        if(appointmentData && appointmentData.docId === docId) {
            await appointmentModel.findByIdAndUpdate(appointmentId, {cancelled: true})
            return res.json({success:true, message:'apppointment cancelled'})
        } else {
            return res.json({success:false, message:'Cancellation failed'})
        }
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
        
    }
}

//API to get dashboard data for doctor panel
const doctorDashboard = async (req, res) => {
    try {
        const {docId} = req.body
        const appointments =  await appointmentModel.find({docId})

        let earnings = 0;

        appointments.map((item) => {
            if(item.isCompleted || item.payment) {
                earnings += item.amount
            }
        })

        let patients = []
        appointments.map((item) => {
            if(!patients.includes(item.userId)) {
                patients.push(item.userId)
            }
        })

        const dashData = {
            earnings,
            appointments: appointments.length,
            patients: patients.length,
            latestAppointments: appointments.reverse().slice(0, 5)
        }
        res.json({success:true, dashData})

        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
        
    }
}

export {changeAvailablity, doctorList, loginDoctor, appointmentsDoctor, appointmentCompleted, appointmentCancel, doctorDashboard}