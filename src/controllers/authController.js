const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const User = require('../models/User');

// ─── Generate JWT Token ─────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// ─── REGISTER ────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { phone_number, full_name, email, password, password2, role } = req.body;

    // Validation
    if (!phone_number || !full_name || !password || !password2) {
      return res.status(400).json({ detail: ['Phone number, full name, and password are required.'] });
    }

    if (password !== password2) {
      return res.status(400).json({ password: ['Passwords do not match.'] });
    }

    if (password.length < 6) {
      return res.status(400).json({ password: ['Password must be at least 6 characters.'] });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ where: { phone_number } });
    if (existingPhone) {
      return res.status(400).json({ phone_number: ['This phone number is already registered.'] });
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ email: ['This email is already registered.'] });
      }
    }

    // Validate role
    const validRoles = ['end_user', 'mediator', 'field_person', 'customer_care'];
    const userRole = validRoles.includes(role) ? role : 'end_user';

    // Create user
    const user = await User.create({
      phone_number,
      full_name,
      email: email || null,
      password,
      role: userRole,
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Register error:', error);

    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
      const errors = {};
      error.errors.forEach((err) => {
        const field = err.path || 'detail';
        if (!errors[field]) errors[field] = [];
        errors[field].push(err.message);
      });
      return res.status(400).json(errors);
    }

    return res.status(500).json({ detail: ['Server error. Please try again later.'] });
  }
};

// ─── LOGIN ───────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ detail: ['Phone number/email and password are required.'] });
    }

    // Find user by phone or email
    const user = await User.findOne({
      where: {
        [Op.or]: [
          { phone_number: identifier },
          { email: identifier },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ detail: ['Invalid credentials. No account found.'] });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ detail: ['Invalid credentials. Wrong password.'] });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({ detail: ['Your account has been deactivated. Contact support.'] });
    }

    // Check role if specified
    if (role && user.role !== role) {
      return res.status(403).json({ detail: [`This account is registered as "${user.role}", not "${role}".`] });
    }

    // Generate token
    const token = generateToken(user.id);

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: user.toSafeObject(),
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ detail: ['Server error. Please try again later.'] });
  }
};

// ─── LOGOUT ──────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });

    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ detail: ['Server error. Please try again later.'] });
  }
};

// ─── FORGOT PASSWORD ─────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { phone_number } = req.body;

    if (!phone_number) {
      return res.status(400).json({ detail: ['Phone number is required.'] });
    }

    const user = await User.findOne({ where: { phone_number } });
    if (!user) {
      return res.status(404).json({ detail: ['No account found with this phone number.'] });
    }

    // TODO: Implement actual OTP sending logic (SMS gateway)
    // For now, return a success message
    return res.status(200).json({
      message: 'OTP has been sent to your phone number. (Demo mode — OTP: 123456)',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ detail: ['Server error. Please try again later.'] });
  }
};

// ─── GET CURRENT USER (ME) ──────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ detail: ['User not found.'] });
    }
    return res.status(200).json({ user: user.toSafeObject() });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({ detail: ['Server error. Please try again later.'] });
  }
};
