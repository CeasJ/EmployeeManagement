const db = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

const createTask = async (req, res) => {
    const { userId, taskName, deadline, description } = req.body;
    if (!userId || !taskName || !deadline) {
        return res.status(400).json({ error: 'userId, taskName, and deadline are required' });
    }

    try {
        const employeeDoc = await db.collection('Users').doc(userId).get();
        if (!employeeDoc.exists) {
            return res.status(404).json({ error: 'Employee not found' });
        }

        const employeeData = employeeDoc.data();
        if (employeeData.status !== 'Active') {
            return res.status(400).json({ error: 'Employee is not active' });
        }

        if (!req.user || !req.user.phoneNumber) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const managerQuery = await db.collection('Users').where('phoneNumber', '==', req.user.phoneNumber).get();
        if (managerQuery.empty) {
            return res.status(404).json({ error: 'Manager not found' });
        }

        const managerDoc = managerQuery.docs[0];
        const managerId = managerDoc.id;
        const managerData = managerDoc.data();
        
        if (managerData.role !== 'Manager') {
            console.log(`Invalid manager: ${req.user.phoneNumber}`);
            return res.status(403).json({ error: 'Only Managers can assign tasks' });
        }

        const taskId = uuidv4();
        const taskData = {
            taskId,
            userId,
            taskName,
            deadline: new Date(deadline).toISOString(),
            description: description || '',
            status: 'Pending',
            createdAt: new Date().toISOString(),
            assignedBy: managerId
        };

        await db.collection('Tasks').doc(taskId).set(taskData);
        console.log(`Task created: ${taskId}`);

        res.json({ success: true, taskId });
    } catch (error) {
        console.error('Error in createTask:', error.message);
        res.status(500).json({ error: 'Failed to create task: ' + error.message });
    }
};

const getTasks = async (req, res) => {
  const { userId } = req.query;

  try {
    let query = db.collection('Tasks');
    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();
    const tasks = snapshot.docs.map(doc => doc.data());

    res.json(tasks);
  } catch (error) {
    console.error('Error in getTasks:', error.message);
    res.status(500).json({ error: 'Failed to get tasks: ' + error.message });
  }
};

module.exports = { createTask, getTasks };