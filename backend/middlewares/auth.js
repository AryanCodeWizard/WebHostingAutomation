const jwt = require("jsonwebtoken");

exports.auth = async (req, res, next) => {
    try {
        //Extract token from headers only Industry standard
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Token is missing or malformed",
            });
        }
        
        const token = authHeader.split(" ")[1]; // Extract actual token
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authentication failed while verifying token",
            error: error.message
        });
    }
}
exports.isAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admins only"
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authorization failed while verifying admin role",
            error: error.message
        });
    }
}

exports.isClient = async (req, res, next) => {
    try {
        if (req.user.role !== 'client') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Clients only"
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authorization failed while verifying client role",
            error: error.message
        });
    }
}

exports.isStaff = async (req, res, next) => {
    try {
        if (req.user.role !== 'staff') {
            return res.status(403).json({
                success: false,
                message: "Access denied. Staff only"
            });
        }
        next();
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Authorization failed while verifying staff role",
            error: error.message
        });
    }
}

