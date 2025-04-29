const { Category, Product } = require('../models');

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id']
      }]
    });

    // Thêm số lượng sản phẩm vào mỗi danh mục
    const categoriesWithCount = categories.map(category => ({
      ...category.toJSON(),
      productCount: category.products.length
    }));

    res.json(categoriesWithCount);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id, {
      include: [{
        model: Product,
        as: 'products'
      }]
    });

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const [updated] = await Category.update(req.body, {
      where: { id: req.params.id }
    });

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    const updatedCategory = await Category.findByPk(req.params.id);
    res.json(updatedCategory);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    // Kiểm tra xem danh mục có sản phẩm không
    const category = await Category.findByPk(req.params.id, {
      include: [{
        model: Product,
        as: 'products',
        attributes: ['id']
      }]
    });

    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục' });
    }

    if (category.products.length > 0) {
      return res.status(400).json({
        message: 'Không thể xóa danh mục này vì có sản phẩm đang sử dụng'
      });
    }

    await category.destroy();
    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 