import express from 'express';
import axios from 'axios';

const router = express.Router();

// This route proxies search requests to OpenStreetMap to avoid CORS issues.
router.get('/search', async (req, res) => {
  const { q } = req.query; // Get the search query from the request

  if (!q) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q,
        format: 'json',
      },
      headers: {
        // OpenStreetMap requires a User-Agent header for API calls.
        'User-Agent': 'YourECommerceApp/1.0 (you@example.com)', 
      },
    });
    // Send the data from OpenStreetMap back to your frontend.
    res.json(response.data);
  } catch (error) {
    console.error('Nominatim API error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from OpenStreetMap' });
  }
});

export default router;