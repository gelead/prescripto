import jwt from 'jsonwebtoken'

// admin authentication middleware

const authAdmin = async(req, res, next) => {
    try{
        const token = req.headers.authorization
        if(!token){
            return res.status(401).json({message: "Unauthorized"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if(decoded === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD){
            next()
        }else{
            return res.status(401).json({message: "Unauthorized"})
        }
    }catch(error){
        console.error(error)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export default authAdmin