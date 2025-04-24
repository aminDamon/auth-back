const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendVerificationEmail } = require('../utils/emailService');



exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body; 

        
        const userExists = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        
        const newUser = await pool.query(
            `INSERT INTO users (username, email, password, is_verified) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, username, email`,
            [username, email, hashedPassword, false]
        );

        res.status(201).json({
            success: true,
            user: newUser.rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Server error' });
    }
};


exports.verify = async (req, res) => {
    try {
        const { email, code } = req.body;

        
        const user = await pool.query(
            `SELECT * FROM users 
       WHERE email = $1 AND verification_code = $2 
       AND verification_expires > NOW()`,
            [email, code]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid or expired code' });
        }

        
        await pool.query(
            `UPDATE users 
       SET is_verified = true, 
           verification_code = NULL, 
           verification_expires = NULL 
       WHERE email = $1`,
            [email]
        );

        
        const token = jwt.sign(
            { id: user.rows[0].id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.rows[0].id,
                email: user.rows[0].email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};



require('dotenv').config(); 

exports.loginWithPassword = async (req, res) => {
    try {
        const { username, password } = req.body;

        
        const userResult = await pool.query(
            'SELECT id, username, email, password FROM users WHERE username = $1',
            [username]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = userResult.rows[0];

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }


        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );


        
        res.status(200)
            .cookie('token', token, { httpOnly: true, secure: false }) 
            .json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Database error' });
    }
};



exports.loginWithEmail = async (req, res) => {
    try {
        const { username } = req.body; 

        
        const user = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );

        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Username not found' });
        }

        const userEmail = user.rows[0].email;

        
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); 

        
        await pool.query(
            `UPDATE users 
         SET verification_code = $1, 
             verification_expires = $2 
         WHERE username = $3`,
            [verificationCode, expiresAt, username]
        );

        
        console.log(`\n=== ایمیل تستی ===`);
        console.log(`به: ${userEmail}`);
        console.log(`کد تأیید: ${verificationCode}`);
        console.log(`================\n`);

        res.json({
            success: true,
            message: 'Verification code sent to registered email',
            email: userEmail 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};