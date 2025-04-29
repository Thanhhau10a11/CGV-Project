const { Product, Category } = require('../models');
const { Op } = require('sequelize');

exports.getAllProducts = async (req, res) => {
  try {
    const {
      name,
      category_id,
      status,
      min_stock,
      max_stock,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};
    if (name) {
      where.name = { [Op.like]: `%${name}%` };
    }
    if (category_id) {
      where.category_id = category_id;
    }
    if (status) {
      where.status = status;
    }
    if (min_stock || max_stock) {
      where.stock_quantity = {};
      if (min_stock) where.stock_quantity[Op.gte] = min_stock;
      if (max_stock) where.stock_quantity[Op.lte] = max_stock;
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [{ model: Category, as: 'category' }],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      products: rows
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    const productWithCategory = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category' }]
    });
    res.status(201).json(productWithCategory);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const [updated] = await Product.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category' }]
    });
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 