const url = require('url');
const Joi = require("joi");
const ProjectModel = require("../../../models/projectModel");

const getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.find();

    return res
      .status(200)
      .json({ status: true, projects, message: "Fetched all projects." });
  } catch (e) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong in server" });
  }
};

const getProjectDetails = async (req, res) => {
  try {
    const url_data = url.parse(req.url, true);

    const project = await ProjectModel.findById(url_data.project_id);

    if (!project) {
      return res.status(404).json({ status: false, message: "Could'nt find the project." });
    }

    return res
      .status(200)
      .json({ status: true, project, message: "Fetched all projects." });
  } catch (e) {
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong in server" });
  }
};

module.exports = {
  getAllProjects,
  getProjectDetails,
};
