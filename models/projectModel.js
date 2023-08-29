const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      min: 3,
      required: true,
    },
    project_img_url: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    project_url: {
      type: Boolean,
      default: true,
    },
    tags: {
      type: [{ type: String}],
      default: ["basic"],
    },
    images: {
      type: [{ type: String}],
      default: [],
    },
    decription: {
      type: String,
      min: 10,
      max: 50,
      required: true,
    },
  },
  { timestamps: true }
);


const ProjectModel = mongoose.model("myapi_project", ProjectSchema);

module.exports = ProjectModel;