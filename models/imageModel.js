const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    file_path: {
      type: String,
      min: 3,
      required: true,
    },
    saved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'myapi_user',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    tags: {
      type: [{ type: String}],
      default: ["basic"],
    },
    description: {
      type: String,
      min: 10,
      max: 50,
      required: true,
    },
    status: {
      type: String,
      default: 'pending', // pending, approved, rejected
    }
  },
  { timestamps: true }
);


const ImageModel = mongoose.model("myapi_image", ImageSchema);

module.exports = ImageModel;