const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'cinema_db',
  process.env.DB_USER || 'root',
  process.env.DB_PASS || '',
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    logging: false,
    timezone: '+07:00',
    define: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Kết nối database thành công.');
  } catch (error) {
    console.error('Lỗi kết nối database:', error);
  }
};

testConnection();

module.exports = sequelize; 