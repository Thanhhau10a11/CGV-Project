const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  code: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  description: DataTypes.TEXT,
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0
  },
  stock_quantity: {
    type: DataTypes.INTEGER.UNSIGNED,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('selling', 'out_of_stock', 'discontinued'),
    defaultValue: 'selling'
  },
  image: DataTypes.STRING(255)
}, {
  timestamps: true
});

module.exports = Product; 