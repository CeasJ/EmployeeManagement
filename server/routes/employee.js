const express = require('express');
const router = express.Router();
const { createEmployee, getEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const auth = require('../utils/auth');
const managerChecking = require('../utils/managerChecking');

router.post('/createEmployee', auth, managerChecking, createEmployee);
router.get('/getEmployee', auth, managerChecking, getEmployee);
router.put('/updateEmployee/:id', auth,managerChecking, updateEmployee);
router.delete('/deleteEmployee/:id', auth, managerChecking, deleteEmployee);

module.exports = router;