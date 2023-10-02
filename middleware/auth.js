const jwt = require("jsonwebtoken");

const authenticated = (req, res, next) => {
    let token = req.cookies && req.cookies.my_api_token;
  
    if (token === undefined){
        token = req.body.headers && req.body.headers.Cookie;
    }

    if (!token) {
        return res.status(403).json({ status: false ,message:"A token is required for authentication"});
    }
    try {
        const decoded = verifyToken(token);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ status: false, message:"Invalid token, Please try logging in again"});
    }
    return next();
};


const isAdmin = (req, res, next) => {
    if (req.user.user_type !== "admin") {
        return res.status(401).json({ status: false, message: "You ar not authorized." })
    }
    return next()
}

const verifyToken = (token) => {
    return jwt.verify(token, process.env.MY_API_JWT_SECRET_KEY)
}

const generateToken = (payload, remember_me) => {
    const expireTime = remember_me ? `${process.env.MY_API_JWT_EXPIRE_DAYS}d` : '1d';
    
    return jwt.sign(payload, process.env.MY_API_JWT_SECRET_KEY, { expiresIn: expireTime });;
}

module.exports = {
    authenticated,
    isAdmin,
    verifyToken,
    generateToken,
};
