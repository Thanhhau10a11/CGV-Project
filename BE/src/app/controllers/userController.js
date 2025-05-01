const { User } = require('../models');
const { Op } = require('sequelize');

// Lấy danh sách nhân viên với phân trang và tìm kiếm
exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    // Xây dựng điều kiện tìm kiếm
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { username: { [Op.like]: `%${search}%` } },
        { full_name: { [Op.like]: `%${search}%` } }
      ];
    }

    // Lấy danh sách nhân viên
    const { count, rows } = await User.findAndCountAll({
      where: whereClause,
      attributes: { exclude: ['password'] }, // Không trả về mật khẩu
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    // Tính toán thông tin phân trang
    const totalPages = Math.ceil(count / limit);

    res.json({
      total: count,
      totalPages,
      currentPage: page,
      users: rows
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Lấy thông tin một nhân viên
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] } // Không trả về mật khẩu
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Thêm nhân viên mới
exports.createUser = async (req, res) => {
  try {
    const { username, password, full_name, role } = req.body;
    
    // Kiểm tra xem tên đăng nhập đã tồn tại chưa
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
    }
    
    // Tạo nhân viên mới
    const user = await User.create({
      username,
      password,
      full_name,
      role: role || 'staff'
    });
    
    // Trả về thông tin nhân viên (không bao gồm mật khẩu)
    const { password: _, ...userWithoutPassword } = user.toJSON();
    
    res.status(201).json({
      message: 'Tạo nhân viên thành công',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Lỗi khi tạo nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Cập nhật thông tin nhân viên
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, password, full_name, role } = req.body;
    
    // Kiểm tra xem nhân viên có tồn tại không
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    // Kiểm tra xem tên đăng nhập đã tồn tại chưa (nếu có thay đổi)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
      }
    }
    
    // Cập nhật thông tin nhân viên
    const updateData = {};
    if (username) updateData.username = username;
    if (full_name) updateData.full_name = full_name;
    if (role) updateData.role = role;
    if (password) updateData.password = password;
    
    await user.update(updateData);
    
    // Lấy thông tin nhân viên đã cập nhật (không bao gồm mật khẩu)
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });
    
    res.json({
      message: 'Cập nhật nhân viên thành công',
      user: updatedUser
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// Xóa nhân viên
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Kiểm tra xem nhân viên có tồn tại không
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy nhân viên' });
    }
    
    // Không cho phép xóa tài khoản admin
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Không thể xóa tài khoản admin' });
    }
    
    // Xóa nhân viên
    await user.destroy();
    
    res.json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa nhân viên:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 