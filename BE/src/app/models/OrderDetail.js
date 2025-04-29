const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const OrderDetail = sequelize.define('OrderDetail', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Orders',
      key: 'id'
    }
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER.UNSIGNED,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'orderdetails',
  timestamps: true,
  hooks: {
    beforeCreate: (orderDetail) => {
      orderDetail.subtotal = orderDetail.quantity * orderDetail.unit_price;
    },
    beforeUpdate: (orderDetail) => {
      if (orderDetail.changed('quantity') || orderDetail.changed('unit_price')) {
        orderDetail.subtotal = orderDetail.quantity * orderDetail.unit_price;
      }
    }
  }
});

module.exports = OrderDetail; 