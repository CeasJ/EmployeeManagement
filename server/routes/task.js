    const express = require('express');
    const router = express.Router();
    const { createTask, getTasks } = require('../controllers/taskController');
    const auth = require('../utils/auth');
    const managerChecking = require('../utils/managerChecking');

    router.post('/', auth, managerChecking, createTask);
    router.get('/', auth, getTasks);

    module.exports = router;