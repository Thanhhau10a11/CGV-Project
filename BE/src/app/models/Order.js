const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled'),
    defaultValue: 'pending'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'cash'
  },
  note: DataTypes.TEXT
}, {
  timestamps: true
});

module.exports = Order; 