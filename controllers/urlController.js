const fs = require('fs');
const path = require('path');
const generateShortcode = require('../utils/generateShortcode');
const dataPath = path.join(__dirname, '../data.json');

const readData = () => JSON.parse(fs.readFileSync(dataPath));
const writeData = (data) => fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

exports.createShortURL = (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  const data = readData();
  let finalCode = shortcode || generateShortcode();

  if (shortcode && data.find(d => d.shortcode === shortcode)) {
    return res.status(409).json({ error: 'Shortcode already exists' });
  }

  const expiry = new Date(Date.now() + validity * 60000).toISOString();

  const newLink = {
    shortcode: finalCode,
    url,
    expiry,
    createdAt: new Date().toISOString(),
    clicks: [],
  };

  data.push(newLink);
  writeData(data);

  return res.status(201).json({
    shortLink: `https://hostname:port/${finalCode}`,
    expiry
  });
};

exports.redirectToOriginal = (req, res) => {
  const { shortcode } = req.params;
  const data = readData();

  const entry = data.find(d => d.shortcode === shortcode);
  if (!entry) return res.status(404).json({ error: 'Shortcode not found' });

  if (new Date(entry.expiry) < new Date()) {
    return res.status(410).json({ error: 'Short link expired' });
  }

  entry.clicks.push({
    timestamp: new Date().toISOString(),
    referrer: req.get('Referer') || 'direct',
    userAgent: req.get('User-Agent') || 'unknown'
  });

  writeData(data);
  res.redirect(entry.url);
};

exports.getStats = (req, res) => {
  const { shortcode } = req.params;
  const data = readData();

  const entry = data.find(d => d.shortcode === shortcode);
  if (!entry) return res.status(404).json({ error: 'Shortcode not found' });

  const { url, createdAt, expiry, clicks } = entry;
  return res.json({
    totalClicks: clicks.length,
    url,
    createdAt,
    expiry,
    clicks
  });
};
