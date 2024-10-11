const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

app.get('/gasprices', async (req, res) => {
  try {
    const response = await axios.get('https://scrollscan.com/gastracker');
    res.send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching gas prices');
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
});

