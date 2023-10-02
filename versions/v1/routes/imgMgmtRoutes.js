const express = require('express');
const multer = require('multer');
const path = require('path');

const ImgMgmtController = require('../controller/ImgMgmtController');
const { authenticated, isAdmin } = require('../../../middleware/auth');
const { fileImageFilter } = require('../../../middleware/uploads');

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const fullPath = path.join(__dirname, '..', '..', '..', `uploads/public/images/`); // Specify the full path here
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const extname = path.extname(file.originalname);
      const new_file_name= `${req.user.id}_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`
      cb(null, `${new_file_name}${extname}`);
    },
});

const privateStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      const fullPath = path.join(__dirname, '..', '..', '..', `uploads/users/${req.user.id}/images/`); // Specify the full path here
      cb(null, fullPath);
    },
    filename: (req, file, cb) => {
      const extname = path.extname(file.originalname);
      const new_file_name= `${req.user.id}_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`
      cb(null, `${new_file_name}${extname}`);
    },
});

const uploadImage = multer({
    storage,
    fileFilter: fileImageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB in bytes
    },
});

const uploadPrivateImage = multer({
    storage: privateStorage,
    fileFilter: fileImageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB in bytes
    },
});

const uploadSingleImageMiddleware = (req, res, next) => {
    uploadImage.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(500).json(err);
        }
        next();
    });
};

const uploadSinglePrivateImageMiddleware = (req, res, next) => {
    uploadPrivateImage.single('image')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        } else if (err) {
            return res.status(500).json(err);
        }
        next();
    });
};

const router = express.Router();

router.get('/get-all-images', ImgMgmtController.getAllImages);
router.get('/get-paginated-images', ImgMgmtController.getPaginatedImages);
router.post('/upload-a-public-images', authenticated, uploadSingleImageMiddleware, ImgMgmtController.uploadAPublicImage);
router.post('/upload-a-private-images', authenticated, uploadSinglePrivateImageMiddleware, ImgMgmtController.uploadAPrivateImage);

module.exports = router;