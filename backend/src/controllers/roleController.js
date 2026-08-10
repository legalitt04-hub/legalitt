// src/controllers/roleController.js
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');
const bcrypt = require('bcryptjs');

// Default permissions per role
const ROLE_PERMISSIONS = {
  super_admin:           ['dashboard','users','advocates','cases','consultations','ads','roles','earnings','withdrawals','settings','support','reviews','reports','audit','notifications'],
  admin:                 ['dashboard','users','advocates','cases','consultations','earnings','withdrawals','support','reviews','reports','notifications'],
  support_executive:     ['dashboard','consultations','support','notifications'],
  accounts:              ['dashboard','earnings','withdrawals','reports'],
  forensic_expert:       ['dashboard','cases','documents'],
  property_verification: ['dashboard','cases','documents'],
};

const ROLE_DISPLAY = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  support_executive: 'Support Executive',
  accounts: 'Accounts',
  forensic_expert: 'Forensic Expert',
  property_verification: 'Property Verification',
};

// GET /api/v1/admin/roles/accounts — list all admin accounts
exports.getAdminAccounts = async (req, res, next) => {
  try {
    const { role, status } = req.query;
    // Include legacy roles so existing accounts aren't hidden
    const validRoles = [...Object.keys(ROLE_PERMISSIONS), 'superadmin', 'support'];
    const filter = { role: { $in: validRoles } };
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;

    const users = await User.find(filter)
      .select('name email phone role isActive lastSeen createdAt avatar')
      .sort({ createdAt: -1 });

    const data = users.map(u => {
      const displayRoleKey = u.role === 'superadmin' ? 'super_admin' : (u.role === 'support' ? 'support_executive' : u.role);
      return {
        ...u.toJSON(),
        displayRole: ROLE_DISPLAY[displayRoleKey] || u.role,
        permissions: ROLE_PERMISSIONS[displayRoleKey] || [],
      };
    });

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

// POST /api/v1/admin/roles/accounts — create new admin account
exports.createAdminAccount = async (req, res, next) => {
  try {
    let targetRole = role === 'superadmin' ? 'super_admin' : (role === 'support' ? 'support_executive' : role);
    if (!ROLE_PERMISSIONS[targetRole]) {
      return next(new AppError('Invalid role.', 400));
    }
    let user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      // Update existing user role and details to grant admin access
      user.role = targetRole;
      user.isActive = true;
      if (name) user.name = name.trim();
      if (phone) user.phone = phone;
      if (password) user.password = password; // mongoose pre-save will hash password
      await user.save();
    } else {
      user = await User.create({
        name: name.trim(),
        email: email.toLowerCase(),
        phone,
        password,
        role,
        isVerified: true,
        isActive: true,
      });
    }

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        displayRole: ROLE_DISPLAY[role],
        permissions: permissions || ROLE_PERMISSIONS[role],
      },
    });
  } catch (err) { next(err); }
};

// PATCH /api/v1/admin/roles/accounts/:id — update role/permissions/status
exports.updateAdminAccount = async (req, res, next) => {
  try {
    const { role, isActive, name, phone } = req.body;
    const update = {};
    if (role && ROLE_PERMISSIONS[role]) update.role = role;
    if (typeof isActive === 'boolean') update.isActive = isActive;
    if (name) update.name = name;
    if (phone) update.phone = phone;

    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true })
      .select('name email phone role isActive lastSeen createdAt');
    if (!user) return next(new AppError('Account not found.', 404));

    res.json({
      success: true,
      data: { ...user.toJSON(), displayRole: ROLE_DISPLAY[user.role], permissions: ROLE_PERMISSIONS[user.role] || [] },
    });
  } catch (err) { next(err); }
};

// PATCH /api/v1/admin/roles/accounts/:id/reset-password
exports.resetAdminPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 8) return next(new AppError('Password must be at least 8 characters.', 400));
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.findByIdAndUpdate(req.params.id, { password: hashed });
    if (!user) return next(new AppError('Account not found.', 404));
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) { next(err); }
};

// DELETE /api/v1/admin/roles/accounts/:id — revoke admin role
exports.deleteAdminAccount = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('Account not found.', 404));

    // Revoke admin role back to client
    user.role = 'client';
    await user.save();

    res.json({ success: true, message: 'Admin role revoked successfully.' });
  } catch (err) { next(err); }
};

// GET /api/v1/admin/roles/permissions — return all permission keys + role defaults
exports.getRolePermissions = async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: {
        roles: Object.keys(ROLE_PERMISSIONS).map(r => ({ key: r, display: ROLE_DISPLAY[r], permissions: ROLE_PERMISSIONS[r] })),
        allPermissions: Object.keys(ROLE_PERMISSIONS).flatMap(r => ROLE_PERMISSIONS[r]).filter((v, i, a) => a.indexOf(v) === i),
      },
    });
  } catch (err) { next(err); }
};
