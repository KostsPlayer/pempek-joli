const Users = require("../models/users.js");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const Token = require('../models/Token.js');
const express = require("express");
const cors = require("cors");
const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://pempek-joli-client.vercel.app"],
    methods: ["GET", "POST", "PUT", "OPTIONS", "DELETE"],
    credentials: true,
    optionsSuccessStatus: 200,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

exports.register = async (req, res) => {
  const {
    fullName,
    nickname,
    email,
    phoneNumber,
    password,
    role = "user",
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 8);

    const newUser = new Users({
      fullName,
      nickname,
      email,
      phoneNumber,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({
      status: 201,
      message: "Registration successful",
      data: {
        fullName: newUser.fullName,
        nickname: newUser.nickname,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: newUser.role,
      },
    });
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      const message = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } already exists. Please use a different ${field}.`;
      res.status(409).json({
        status: 409,
        message: message,
        field: field,
      });
    } else {
      res.status(500).json({
        status: 500,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const User = await Users.findOne({ email });

    if (!User || !(await bcrypt.compare(password, User.password))) {
      return res.status(401).json({
        status: 401,
        message: "Invalid email or password",
      });
    }

    if (User.isActive == false) {
      return res.status(403).json({
        status: 403,
        message: "Account is not active, please contact administrator",
      });
    }

    const token = jwt.sign(
      {
        _id: User._id,
        role: User.role,
        fullName: User.fullName,
        nickname: User.nickname,
        email: User.email,
        phoneNumber: User.phoneNumber,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    let tokenRecord = await Token.findOne({ userId: User._id });
    if (tokenRecord) {
        tokenRecord.accessCount += 1;
        tokenRecord.token = token;  
      } else {
        tokenRecord = new Token({ userId: User._id, token: token, accessCount: 1 });
      }
      await tokenRecord.save();
  
      res.json({
        status: 200,
        message: 'Login successful',
        data: {
          token: `${tokenRecord.accessCount}|${token}`,
          role: User.role
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message
      });
    }
  };