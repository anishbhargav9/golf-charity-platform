const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');

dotenv.config();

console.log('Starting server...');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGO_URI exists:', !!process.env.MONGO_URI);

// Preload all models
require('./models/User');
require('./models/Score');
require('./models/Draw');
require('./models/Prize');
require('./models/Charity');
require('./models/Winner');
require('./models/Subscription');

const app = express();

app.use(cors({
  origin: "https://golf-charity-platformm-git-main-anishbhargav9s-projects.vercel.app",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/', (req, res) => res.json({ message: 'Golf Charity API running' }));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/scores',       require('./routes/score.routes'));
app.use('/api/draws',        require('./routes/draw.routes'));
app.use('/api/charities',    require('./routes/charity.routes'));
app.use('/api/subscription', require('./routes/subscription.routes'));
app.use('/api/winners',      require('./routes/winner.routes'));
app.use('/api/admin',        require('./routes/admin.routes'));

const PORT = process.env.PORT || 5000;

// Start server first, then connect to MongoDB
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

  })
  .catch(err => {
    console.error('DB connection error:', err.message);
    process.exit(1);
  });