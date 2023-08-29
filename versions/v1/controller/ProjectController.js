const Joi = require("joi");
const ProjectModel = require("../../../models/projectModel");

const getAllProjects = async (req, res) => {
  try {
    const projects = await ProjectModel.find();

    return res
      .status(200)
      .json({ status: true, projects, message: "Fetched all projects." });
  } catch (e) {
    console.log(e);
    return res
      .status(500)
      .json({ status: false, message: "Something went wrong in server" });
  }
};

module.exports = {
  getAllProjects,
};
