import jwt from 'jsonwebtoken'


//user authentication middleware
const authUser = async (req,res,next) => {
    try {
        // const atoken = req.headers.authorization.split(' ')[1] //getting token from headers
        const {token} = req.headers;
        // console.log(token)
        if(!token){
            return res.json({success:false, message: "Not authorized Login again"})
        }
        const token_decode = jwt.verify(token,process.env.JWT_SECRET) //verifying token
        req.body.userId = token_decode.id
        
        next()
        
    } catch (error) {
        console.log(error)
        res.json({success:false, message: error.message})
    }
}
export default authUser;