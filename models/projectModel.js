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
    saved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'myapi_user',
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    project_url: {
      type: String,
    },
    github_url: {
      type: String,
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