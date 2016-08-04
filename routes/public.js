var express = require('express'),
  router = express.Router(),
  multer = require('multer');

var indexController = require('../controllers/public/indexController');
var productController = require('../controllers/public/productController');
var cartController = require('../controllers/public/cartController');
var locationController = require('../controllers/public/locationController');
var enterpriseController = require('../controllers/public/enterpriseController');
var contactController = require('../controllers/public/contactController');

router.get('/', indexController.get);
router.get('/produtos', productController.get);
router.get('/ambientes', productController.getAmbientes);
router.get('/produto/:id', productController.getProduct);
router.get('/localizacao', locationController.getIndex);
router.get('/empresa', enterpriseController.getIndex);
router.get('/contato', contactController.getIndex);

router.post('/cart/item', cartController.postItem);
router.post('/cart', cartController.postCart);
router.delete('/cart/item/:id', cartController.deleteItem);
router.get('/orcamento', cartController.getCart);


module.exports = router;
