import doctorModel from '../models/doctorModel.js'

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

export {changeAvailablity, doctorList}