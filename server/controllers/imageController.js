const fs = require('fs');
const path = require('path');
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

const imagesDir = path.join(__dirname, '..', 'img');

const getImages = (req, res) => {
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.status(500).send('Error reading directory');
        }
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));
        res.json(imageFiles);
    });
};

module.exports = {
    getImages
};