const path = require('path')

const fileImageFilter = (req, file, cb) => {
  const allowedFileTypes = /\.(jpg|jpeg|png)$/; // Allow only PNG and JPG files
  const extname = allowedFileTypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    const errorResponse = {
      status: false,
      message: 'Only JPEG, JPG, and PNG files are allowed!',
    };
    return cb(errorResponse, false);
  }
};

module.exports = {
  fileImageFilter,
}
