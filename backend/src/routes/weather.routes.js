const router = require('express').Router();
const ctrl = require('../controllers/weather.controller');
const auth = require('../middleware/auth');

router.get('/', auth, ctrl.current);

module.exports = router;
