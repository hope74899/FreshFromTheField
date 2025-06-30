const multer = require('multer');
const path = require('path');
const crypto = require('crypto'); // Import the crypto module

const publicDir = path.resolve(__dirname, '../public');
const allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, publicDir);
    },
    filename: (req, file, cb) => {
        const fileExtension = path.extname(file.originalname);
        const randomName = crypto.randomBytes(8).toString("hex"); // Shorter random name
        const originalName = path.basename(file.originalname, fileExtension); // Get the original filename without extension

        const safeFilename = `${originalName}-${randomName}${fileExtension}`;
        cb(null, safeFilename);
    }
});
const fileFilter = (req, file, cb) => {
    if (!allowedFileTypes.includes(file.mimetype)) {
        return cb(new Error("Invalid file type! Only JPG, PNG, GIF, and WEBP are allowed."), false);
    }
    cb(null, true);
};

const upload = multer({
    storage,
    limits: { fileSize: 1024 * 1024 * 5 },
    fileFilter
});

const uploadFiles = upload.fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 },
    { name: 'image4', maxCount: 1 },
    { name: 'profileImage', maxCount: 1 }
]);

module.exports = uploadFiles;