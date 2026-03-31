const express = require('express');
const router = express.Router();
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const { searchValidators } = require('../utils/validators');
const searchController = require('../controllers/searchController');

router.get('/', searchValidators.search, validate, searchController.search);
router.post('/image', upload.single('image'), searchController.imageSearch);
router.get('/suggestions', searchController.getSuggestions);

module.exports = router;
