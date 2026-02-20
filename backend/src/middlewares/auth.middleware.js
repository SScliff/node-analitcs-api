const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { jwt: jwtConfig } = require('../config');

/**
 * Auth Middleware (Route Protector)
 * 
 * Flow:
 * 1. Extract token from "Authorization: Bearer <token>" header
 * 2. Verify signature with jwt.verify()
 * 3. Inject decoded payload into req.user
 * 
 * If the token is missing, invalid, or expired → 401 Unauthorized
 */
const authMiddleware = (req, res, next) => {
    // 1. Get the Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new AppError('Token não fornecido', 401));
    }

    // 2. Extract the token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    try {
        // 3. Verify the signature and decode the payload
        const decoded = jwt.verify(token, jwtConfig.secret);

        // 4. Inject user data into the request object
        //    Now any controller can access req.user.id, req.user.email, req.user.role
        req.user = decoded;

        next();
    } catch (error) {
        // jwt.verify() throws specific error types:
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token expirado. Faça login novamente', 401));
        }
        return next(new AppError('Token inválido', 401));
    }
};

module.exports = authMiddleware;
