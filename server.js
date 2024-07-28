const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure the uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Connect to MongoDB
mongoose.connect('mongodb://localhost/smart_city', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Create a schema for reports
const reportSchema = new mongoose.Schema({
  type: String,
  description: String,
  location: String,
  contact: String,
  email:String,
  date: { type: Date, default: Date.now },
  imageUrl: String  // Add imageUrl field to schema
});

// Create a schema for emergency reports
const emergencyReportSchema = new mongoose.Schema({
  type: String,
  description: String,
  location: String,
  urgency: String,
  date: { type: Date, default: Date.now }
});

const Report = mongoose.model('Report', reportSchema);
const EmergencyReport = mongoose.model('EmergencyReport', emergencyReportSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file with current timestamp
  }
});

const upload = multer({ storage });

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to handle report submission
app.post('/api/report', upload.single('photo'), async (req, res) => {
  try {
    const newReport = new Report({
      type: req.body.type,
      description: req.body.description,
      location: req.body.location,
      contact:req.body.contact,
      email:req.body.email,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    await newReport.save();
    res.status(201).json({ message: 'Report submitted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit report' });
  }
});

// Route to handle emergency report submission
// app.post('/api/emergency', async (req, res) => {
//   try {
//     const newEmergencyReport = new EmergencyReport(req.body);
//     await newEmergencyReport.save();
//     res.status(201).json({ message: 'Emergency report submitted successfully' });
//   } catch (error) {
//     res.status(400).json({ error: 'Failed to submit emergency report' });
//   }
// });

app.post('/api/emergency', upload.single('photo'), async (req, res) => {
  try {
    const newReport = new Report({
      type: req.body.type,
      description: req.body.description,
      location: req.body.location,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : null
    });
    await newReport.save();
    res.status(201).json({ message: 'Emergency report submitted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to submit emergency report' });
  }
});

// Route to get all reports
app.get('/api/reports', async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Route to get all emergency reports
app.get('/api/emergency-reports', async (req, res) => {
  try {
    const emergencyReports = await EmergencyReport.find();
    res.json(emergencyReports);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch emergency reports' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
