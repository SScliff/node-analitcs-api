const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/db.service');
const AppError = require('../../utils/AppError');
const { jwt: jwtConfig } = require('../../config');

const SALT_ROUNDS = 10; // Cost factor for bcrypt hashing

/**
 * Register a new user
 * 
 * Flow: password → bcrypt.hash() → save hash to DB → return user (without hash)
 */
const register = async (name, email, password) => {
    // 1. Check if email already exists
    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
        throw new AppError('Email já cadastrado', 409); // 409 = Conflict
    }

    // 2. Hash the password (NEVER save the raw password!)
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Insert into database
    const result = await db.query(
        'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, role, created_at',
        [name, email, passwordHash]
    );

    // Notice: The RETURNING clause does NOT include password_hash (security!)
    return result.rows[0];
};

/**
 * Login a user
 * 
 * Flow: find user → bcrypt.compare() → generate JWT → return token
 */
const login = async (email, password) => {
    // 1. Find user by email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // 2. Generic error message (same for "user not found" AND "wrong password")
    //    This prevents attackers from discovering which emails exist in the system
    if (!user) {
        throw new AppError('Credenciais inválidas', 401);
    }

    // 3. Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        throw new AppError('Credenciais inválidas', 401);
    }

    // 4. Generate JWT
    const token = generateToken(user);

    return { token };
};

/**
 * Generate a JWT token
 * 
 * The payload contains ONLY non-sensitive data.
 * Anyone can decode the payload (it's just base64), so NEVER put passwords here.
 */
const generateToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn
    });
};

module.exports = { register, login };
