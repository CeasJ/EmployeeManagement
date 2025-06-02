const db = require('../config/firebase');
const { sendEmail } = require('../services/email');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const createEmployee = async (req, res) => {
  const { email, name, phoneNumber, userId } = req.body;
  if (!email || !name || !userId) {
    return res.status(400).json({ error: 'Email, name, and userId are required' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  let formattedPhoneNumber = null;
  if (phoneNumber) {
    formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;
    
  }

  try {
    const emailQuery = await db.collection('Users').where('email', '==', email).get();
    if (!emailQuery.empty) {
      console.log(`Email already exists: ${email}`);
      return res.status(400).json({ error: 'Email already registered' });
    }

    const userIdQuery = await db.collection('Users').where('userId', '==', userId).get();
    if (!userIdQuery.empty) {
      console.log(`userId already exists: ${userId}`);
      return res.status(400).json({ error: 'userId already registered' });
    }

    const id = uuidv4();
    const employeeData = {
      id,
      userId,
      email,
      name,
      phoneNumber: formattedPhoneNumber,
      role: 'Employee',
      workSchedule: {},
      address: null,
      status: 'Inactive'
    };

    await db.collection('Users').doc(id).set(employeeData);
    console.log(`Employee created: ${id}`);

    const verificationToken = jwt.sign({ id, email }, process.env.JWT_KEY, { expiresIn: '24h' });
    const verificationLink = `http://localhost:5000/api/auth/verify/${verificationToken}`;

    try {
      await sendEmail(email, 'Verify Your Account', `Click this link to verify your account: ${verificationLink}`);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error(`Failed to send verification email to ${email}: ${emailError.message}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error in createEmployee:', error.message);
    res.status(500).json({ error: 'Failed to create employee: ' + error.message });
  }
};

const getEmployee = async (req, res) => {
  const { id } = req.query;

  try {
    if (id) {
      const doc = await db.collection('Users').doc(id).get();
      if (!doc.exists) {
        console.log(`Employee not found: ${id}`);
        return res.status(404).json({ error: 'Employee not found' });
      }
      res.json(doc.data());
    } else {
      const snapshot = await db.collection('Users').where('role', '==', 'Employee').get();
      const employees = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      res.json(employees);
    }
  } catch (error) {
    console.error('Error in getEmployee:', error.message);
    res.status(500).json({ error: 'Failed to get employee: ' + error.message });
  }
};

const updateEmployee = async (req, res) => {
  const { id, userId, email, name, phoneNumber, workSchedule, address } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  try {
    const doc = await db.collection('Users').doc(id).get();
    if (!doc.exists) {
      console.log(`Employee not found: ${id}`);
      return res.status(404).json({ error: 'Employee not found' });
    }

    const updateData = {};
    if (userId) {
      const userIdQuery = await db.collection('Users').where('userId', '==', userId).get();
      if (!userIdQuery.empty && userIdQuery.docs[0].id !== id) {
        return res.status(400).json({ error: 'userId already registered' });
      }
      updateData.userId = userId;
    }
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      const emailQuery = await db.collection('Users').where('email', '==', email).get();
      if (!emailQuery.empty && emailQuery.docs[0].id !== id) {
        return res.status(400).json({ error: 'Email already registered' });
      }
      updateData.email = email;
    }
    if (name) updateData.name = name;
    if (phoneNumber) {
      const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;
      
      updateData.phoneNumber = formattedPhoneNumber;
    }
    if (workSchedule) updateData.workSchedule = workSchedule;
    if (address) updateData.address = address;

    await db.collection('Users').doc(id).update(updateData);
    console.log(`Employee updated: ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error in updateEmployee:', error.message);
    res.status(500).json({ error: 'Failed to update employee: ' + error.message });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'id is required' });
  }

  try {
    const doc = await db.collection('Users').doc(id).get();
    if (!doc.exists) {
      console.log(`Employee not found: ${id}`);
      return res.status(404).json({ error: 'Employee not found' });
    }

    await db.collection('Users').doc(id).delete();
    console.log(`Employee deleted: ${id}`);

    res.json({ success: true });
  } catch (error) {
    console.error('Error in deleteEmployee:', error.message);
    res.status(500).json({ error: 'Failed to delete employee: ' + error.message });
  }
};

module.exports = {
  createEmployee,
  getEmployee,
  updateEmployee,
  deleteEmployee,
};