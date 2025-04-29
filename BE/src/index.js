const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./app/routes');
const sequelize = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Có lỗi xảy ra!' });
});

const PORT = process.env.PORT || 3000;

// Sync database và khởi động server
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Lỗi kết nối database:', err);
}); 