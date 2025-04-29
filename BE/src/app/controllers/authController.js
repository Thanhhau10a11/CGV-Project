const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: 'Tài khoản không tồn tại' });
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    const user = await User.create({
      username,
      password,
      full_name,
      role: role || 'staff'
    });

    res.status(201).json({
      message: 'Tạo tài khoản thành công',
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    const isValidPassword = await user.validatePassword(currentPassword);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    await user.update({ password: newPassword });
    res.json({ message: 'Đổi mật khẩu thành công' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 
exports.registerAdmin = async (req, res) => {
  try {
    const { username, password, full_name } = req.body;

    // Kiểm tra xem đã tồn tại admin nào chưa (tùy chọn)
    // const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    // if (existingAdmin) {
    //   return res.status(409).json({ message: 'Đã tồn tại tài khoản admin' });
    // }

    // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }

    // Tạo tài khoản admin
    const admin = await User.create({
      username,
      password, // Mật khẩu sẽ được mã hóa bởi hook beforeCreate trong model User
      full_name,
      role: 'admin'
    });

    res.status(201).json({
      message: 'Tạo tài khoản admin thành công',
      admin: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Register admin error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};