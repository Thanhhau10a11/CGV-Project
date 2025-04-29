const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderDetail = require('./OrderDetail');

// Định nghĩa các mối quan hệ
Category.hasMany(Product, {
  foreignKey: 'category_id',
  as: 'products'
});
Product.belongsTo(Category, {
  foreignKey: 'category_id',
  as: 'category'
});

User.hasMany(Order, {
  foreignKey: 'user_id',
  as: 'orders'
});
Order.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

Order.hasMany(OrderDetail, {
  foreignKey: 'order_id',
  as: 'orderDetails'
});
OrderDetail.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order'
});

Product.hasMany(OrderDetail, {
  foreignKey: 'product_id',
  as: 'orderDetails'
});
OrderDetail.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

module.exports = {
  User,
  Category,
  Product,
  Order,
  OrderDetail
}; 