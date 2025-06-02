module.exports = (req, res, next) => {
  if (!req.user || req.user.role !== 'Manager') {
    return res.status(403).json({ error: 'Access denied for this API: Manager role required' });
  }
  next();
};