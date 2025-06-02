const db = require('../config/firebase');
const { sendSMS } = require('../services/sms');
const { sendEmail } = require('../services/email');
const jwt = require('jsonwebtoken');

const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// const generateJWT = (payload) => {
//   if (!process.env.JWT_KEY) {
//     throw new Error('JWT is not defined');
//   }
//   return jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '1h' });
// };

const createAccessCode = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) return res.status(400).json({ error: 'Phone number is required' });

  const formattedPhoneNumber = phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber;


  const accessCode = generateAccessCode();
  try {
    const userQuery = await db.collection('Users').where('phoneNumber', '==', formattedPhoneNumber).get();
    if (userQuery.empty) {
      console.log(`No user found with phoneNumber: ${formattedPhoneNumber}`);
      return res.status(404).json({ error: 'Phone number not registered' });
    }

    const user = userQuery.docs[0].data();
    if (user.role !== 'Manager') {
      console.log(`User with phoneNumber ${formattedPhoneNumber} is not a Manager`);
      return res.status(403).json({ error: 'Access denied: Not a Manager' });
    }

    await db.collection('AccessCodes').doc(formattedPhoneNumber).set({
      accessCode,
      createdAt: new Date(),
    });
    console.log(`Access code ${accessCode} saved for ${formattedPhoneNumber}`);

    try {
      await sendSMS(formattedPhoneNumber, `Your access code is: ${accessCode}`);
      console.log(`SMS sent successfully to ${formattedPhoneNumber}`);
    } catch (smsError) {
      console.error(`SMS sending failed for ${formattedPhoneNumber}: ${smsError.message}`);
    }

    res.json({ accessCode });
  } catch (error) {
    console.error('Error in createAccessCode:', error.message);
    res.status(500).json({ error: 'Failed to create access code: ' + error.message });
  }
};

const validateAccessCode = async (req, res) => {
 const { accessCode, phoneNumber, email } = req.body;
 const identifier = phoneNumber || email;
 if (!accessCode || !identifier) {
   return res.status(400).json({ error: 'Access code and identifier (phoneNumber or email) are required' });
 }

 const formattedIdentifier = phoneNumber ? (phoneNumber.startsWith('+') ? phoneNumber.slice(1) : phoneNumber) : email;
 console.log(`Validating access code for identifier: ${formattedIdentifier}`);

 try {
   let role, userId;
   if (phoneNumber) {
     const userQuery = await db.collection('Users').where('phoneNumber', '==', formattedIdentifier).get();
     if (userQuery.empty) {
       return res.status(404).json({ error: 'Phone number not registered' });
     }
     const userDoc = userQuery.docs[0];
     const user = userDoc.data();
     role = user.role;
     userId = userDoc.id;
   } else {
     const userQuery = await db.collection('Users').where('email', '==', email).get();
     if (userQuery.empty) {
       return res.status(404).json({ error: 'Email not registered' });
     }
     const userDoc = userQuery.docs[0];
     const user = userDoc.data();
     role = user.role;
     userId = userDoc.id;
   }

   const doc = await db.collection('AccessCodes').doc(formattedIdentifier).get();
   if (!doc.exists) {
     return res.status(400).json({ error: 'Invalid access code or identifier' });
   }

   const storedCode = doc.data().accessCode;
   if (storedCode !== accessCode) {
     return res.status(400).json({ error: 'Invalid access code' });
   }

   await db.collection('AccessCodes').doc(formattedIdentifier).set({ accessCode: '' });

   const payload = phoneNumber 
     ? { id: userId, phoneNumber: formattedIdentifier, role } 
     : { id: userId, email, role };
   console.log('Token payload:', payload);
   const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: '3h' });

   res.json({ success: true, token, userId });
 } catch (error) {
   console.error('Error in validateAccessCode:', error.message);
   res.status(500).json({ error: 'Failed to validate access code: ' + error.message });
 }
};

const loginEmail = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const accessCode = generateAccessCode();
  try {
    const userQuery = await db.collection('Users').where('email', '==', email).get();
    if (userQuery.empty) {
      console.log(`No user found with email: ${email}`);
      return res.status(404).json({ error: 'Email not registered' });
    }

    const user = userQuery.docs[0].data();
    if (user.role !== 'Employee') {
      console.log(`User with email ${email} is not an Staff`);
      return res.status(403).json({ error: 'Access denied: Not an Staff' });
    }

    await db.collection('AccessCodes').doc(email).set({
      accessCode,
      createdAt: new Date(),
    });
    console.log(`Access code ${accessCode} saved for ${email}`);
    await sendEmail(email, 'Your Access Code', `Your access code is: ${accessCode}`);
    console.log(`Email sent successfully to ${email}`);
    res.json({ accessCode });
  } catch (error) {
    console.error('Error in loginEmail:', error.message);
    res.status(500).json({ error: 'Failed to send access code: ' + error.message });
  }
};

const verifyAccount = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const { id, email } = decoded;

    const userDoc = await db.collection('Users').doc(id).get();
    if (!userDoc.exists) {
      console.log(`User not found: ${id}`);
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userDoc.data();
    if (userData.email !== email) {
      console.log(`Email mismatch: ${email}`);
      return res.status(400).json({ error: 'Invalid verification token' });
    }

    if (userData.status === 'Active') {
      console.log(`User already verified: ${id}`);
      return res.status(400).json({ error: 'Account already active' });
    }

    await db.collection('Users').doc(id).update({ status: 'Active' });
    console.log(`Account activated: ${id}`);

    res.json({ success: true, message: 'Account activated successfully' });
  } catch (error) {
    console.error('Error in verifyAccount:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    res.status(500).json({ error: 'Failed to activate account: ' + error.message });
  }
};

module.exports = {
  createAccessCode,
  validateAccessCode,
  loginEmail,
  verifyAccount,
};