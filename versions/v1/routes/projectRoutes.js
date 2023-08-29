const express = require('express');

const ProjectController = require('../controller/ProjectController');
const { authenticated, isAdmin } = require('../../../middleware/auth');

const router = express.Router();

router.get('/get-all-projects', ProjectController.getAllProjects);
router.get('/get-project/:project_id', ProjectController.getProjectDetails);

module.exports = router;