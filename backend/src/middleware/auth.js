const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, clinic_id, name, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireSuperAdmin(req, res, next) {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Superadmin access required' });
  }
  next();
}

function requireClinicAccess(req, res, next) {
  // Superadmin can access any clinic
  if (req.user.role === 'superadmin') return next();

  // Clinic staff can only access their own clinic
  const clinicId = req.params.clinicId || req.query.clinic_id;
  if (clinicId && clinicId !== req.user.clinic_id) {
    return res.status(403).json({ error: 'Access denied to this clinic' });
  }
  next();
}

module.exports = { authenticate, requireSuperAdmin, requireClinicAccess };
