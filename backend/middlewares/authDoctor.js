import jwt from 'jsonwebtoken'


//doctor authentication middleware
const authDoctor = async (req,res,next) => {
    try {
        // const atoken = req.headers.authorization.split(' ')[1] //getting token from headers
        const {dtoken} = req.headers;
        // console.log(token)
        if(!dtoken){
            return res.json({success:false, message: "Not authorized Login again"})
        }
        const token_decode = jwt.verify(dtoken,process.env.JWT_SECRET) //verifying token
        req.body.docId = token_decode.id
        
        next()
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}
export default authDoctor;