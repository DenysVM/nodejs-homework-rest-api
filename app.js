const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const connectDB = require('./db/db');
const contactsRouter = require('./routes/api/contactsRoutes');
const userRouter = require('./routes/api/userRoutes');
const path = require('path');

const app = express();

connectDB();

const fs = require('fs');

const tmpDir = path.join(__dirname, 'tmp');

fs.mkdir(tmpDir, { recursive: true }, (err) => {
  if (err) {
    console.error('Error creating tmp directory:', err);
  } else {
    console.log('tmp directory created or already exists');
  }
});

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short';

app.use(logger(formatsLogger));
app.use(cors());
app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/contacts', contactsRouter);

app.use('/avatars', express.static(path.join(__dirname, 'public', 'avatars')));

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});

module.exports = app;
