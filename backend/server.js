require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());

// Import Routes
const aiRoutes = require('./routes/ai');
const phcRoutes = require('./routes/phc');
const insightsRoutes = require('./routes/insights');
const inventoryRoutes = require('./routes/inventory');
const medicinesRoutes = require('./routes/medicines');
const alertsRoutes = require('./routes/alerts');

app.use('/api/ai', aiRoutes);
app.use('/api/phc', phcRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/medicines', medicinesRoutes);
app.use('/api/alerts', alertsRoutes);

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({ status: "PHC Pulse API running ✅", backend: "SQLite" });
});

const PORT = process.env.PORT || 5000;

// Initialize Database then start server
initDB().then(() => {
  console.log("SQLite Database initialized");
  app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
}).catch(err => {
  console.error("Failed to initialize database:", err);
});
