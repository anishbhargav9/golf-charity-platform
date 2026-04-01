const express    = require('express');
const mongoose   = require('mongoose');
const cors       = require('cors');
const dotenv     = require('dotenv');
const path       = require('path');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Preload all models first to prevent circular require issues
require('./models/User');
require('./models/Score');
require('./models/Draw');
require('./models/Prize');
require('./models/Charity');
require('./models/Winner');
require('./models/Subscription');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth',         require('./routes/auth.routes'));
app.use('/api/scores',       require('./routes/score.routes'));
app.use('/api/draws',        require('./routes/draw.routes'));
app.use('/api/charities',    require('./routes/charity.routes'));
app.use('/api/subscription', require('./routes/subscription.routes'));
app.use('/api/winners',      require('./routes/winner.routes'));
app.use('/api/admin',        require('./routes/admin.routes'));

app.get('/', (req, res) => res.json({ message: 'Golf Charity API running' }));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT, () =>
      console.log(`Server running on port ${process.env.PORT}`)
    );
  })
  .catch(err => console.error('DB connection error:', err));