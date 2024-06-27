const fs = require('fs');
const path = require('path');

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