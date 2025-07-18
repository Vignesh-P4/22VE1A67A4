const express = require('express');
const router = express.Router();
const {
  createShortURL,
  redirectToOriginal,
  getStats
} = require('../controllers/urlController');

router.post('/shorturls', createShortURL);
router.get('/shorturls/:shortcode', getStats);
router.get('/:shortcode', redirectToOriginal);

router.get('/shorturls', (req, res) => {
  const data = require('../data/data.json');
  res.json(data);
});


module.exports = router;




