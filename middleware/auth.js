const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  
    let token = req.cookies && req.cookies.mi_api_token;
  
    if (token === undefined){
        token = req.body.headers && req.body.headers.Cookie;
    }

    if (!token) {
        return res.status(403).json({ status: false ,message:"A token is required for authentication"});
    }
    try {
        const decoded = jwt.verify(token, process.env.MY_API_JWT_SECRET_KEY);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ status: false, message:"Invalid token, Please try logging in again"});
    }
    return next();
};

module.exports = { verifyToken };