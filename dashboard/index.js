const express = require('express');
const path = require('path');
const cors = require('cors');
const OutageEvent = require('./model/outageEvent');
const app = express();

// Use CORS middleware
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Function to convert date from YYYY-MM-DD to DD-MM-YYYY
function formatDate(dateStr) {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateStr; // return as-is if format doesn't match
}

// Route to get outage events by feeder name and date
app.get('/api/outage-events', (req, res) => {
  const { feederName, date } = req.query;

  console.log("Feeder name is", feederName);
  console.log("Date is", date);

  // Convert date format if needed
  const formattedDate = formatDate(date);

  OutageEvent.getOutagesByFeederNameAndDate(feederName, formattedDate, (err, results) => {
    if (err) {
      console.error('Error retrieving outage events:', err);
      return res.status(500).json({ error: 'Error retrieving outage events' });
    }

    console.log('Retrieved outage events:', results);

    const outageDuration = OutageEvent.calculateOutageDuration(results);

    res.json({
      outageEvents: results,
      outageDuration,
      totalOutages: results.length/2 // Total number of outages for that date
    });
  });
});

const PORT = process.env.PORT || 3000; // Ensure PORT is properly initialized
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
