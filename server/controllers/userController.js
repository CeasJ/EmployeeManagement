const db = require('../config/firebase');

const getUserProfile = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
  }

  const { phoneNumber, email } = req.user;
  const identifier = phoneNumber || email;

  if (!identifier) {
    return res.status(400).json({ error: 'Invalid user data: phoneNumber or email required' });
  }

  try {
    const userQuery = await db
      .collection('Users')
      .where(phoneNumber ? 'phoneNumber' : 'email', '==', identifier)
      .get();

    if (userQuery.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userQuery.docs[0].data();
    res.json({
      userId: user.userId,
      name: user.name,
      phoneNumber: user.phoneNumber,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error in getUserProfile:', error.message);
    res.status(500).json({ error: 'Failed to fetch user profile: ' + error.message });
  }
};

module.exports = { getUserProfile };