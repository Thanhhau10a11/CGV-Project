const { Order, OrderDetail, Product, User } = require('../models');
const sequelize = require('../../config/database');

exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { products, ...orderData } = req.body;
    orderData.user_id = req.user.id;
    let total_amount = 0;

    // Kiểm tra tồn kho và tính tổng tiền
    for (const item of products) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        throw new Error(`Sản phẩm với ID ${item.product_id} không tồn tại`);
      }
      if (product.stock_quantity < item.quantity) {
        throw new Error(`Sản phẩm ${product.name} không đủ số lượng trong kho`);
      }
      total_amount += product.price * item.quantity;
    }

    orderData.total_amount = total_amount;

    // Tạo đơn hàng
    const order = await Order.create(orderData, { transaction: t });

    // Tạo chi tiết đơn hàng và cập nhật tồn kho
    const orderDetails = await Promise.all(
      products.map(async (item) => {
        const product = await Product.findByPk(item.product_id);
        
        // Cập nhật tồn kho
        await product.update({
          stock_quantity: product.stock_quantity - item.quantity
        }, { transaction: t });

        // Tạo chi tiết đơn hàng
        return OrderDetail.create({
          order_id: order.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: product.price,
          subtotal: product.price * item.quantity
        }, { transaction: t });
      })
    );

    await t.commit();

    const orderWithDetails = await Order.findByPk(order.id, {
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails',
          include: [{ model: Product, as: 'product' }]
        },
        { model: User, as: 'user' }
      ]
    });

    res.status(201).json(orderWithDetails);
  } catch (error) {
    await t.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ message: error.message || 'Lỗi server' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const where = {};
    
    if (status) {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails',
          include: [{ model: Product, as: 'product' }]
        },
        { model: User, as: 'user' }
      ],
      limit: parseInt(limit),
      offset: (page - 1) * limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      orders: rows
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails',
          include: [{ model: Product, as: 'product' }]
        },
        { model: User, as: 'user' }
      ]
    });

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const [updated] = await Order.update(
      { status },
      { where: { id: req.params.id } }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    const updatedOrder = await Order.findByPk(req.params.id, {
      include: [
        {
          model: OrderDetail,
          as: 'orderDetails',
          include: [{ model: Product, as: 'product' }]
        },
        { model: User, as: 'user' }
      ]
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 