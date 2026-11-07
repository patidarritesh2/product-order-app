const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const { orderSchema } = require('../schemas');

router.use(auth);
router.get('/', ctrl.list);
router.get('/:id', ctrl.get);
router.post('/', validate(orderSchema), ctrl.create);
router.put('/:id', validate(orderSchema), ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
