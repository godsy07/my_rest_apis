const express = require('express');

const ProjectController = require('../controller/ProjectController');
const { authenticated, isAdmin } = require('../../../middleware/auth');

const router = express.Router();

router.get('/get-all-projects', ProjectController.getAllProjects);
router.get('/get-project/:project_id', ProjectController.getProjectDetails);
router.post('/add-project', authenticated, isAdmin, ProjectController.addProject);
router.post('/delete-project', authenticated, isAdmin, ProjectController.deleteProject);
router.post('/update-project', authenticated, isAdmin, ProjectController.updateProjectDetails);

module.exports = router;