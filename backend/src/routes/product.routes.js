const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { productSchema } = require('../schemas');

router.use(auth);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', validate(productSchema), ctrl.create);
router.put('/:id', validate(productSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
