var productModel = require('../../models/data/schema.js').Product;
var categoryModel = require('../../models/data/schema.js').Category;

function ProductController () {
  this.get = function (req, res) {
    function renderPage (err, products) {
      res.render('admin/pages/product', {"products" : products});
      
    }; 

    var query = {};

    if (req.param('search')) {
      query = { 'name' : new RegExp('' + req.param('search') + '', "i") };
      
    }

    console.log(query);

    productModel.find(query, renderPage); 
  };

  this.getAdd = function(req, res) {
    categoryModel.find(function(err, categories) { 

    res.render('admin/pages/product/form', {"product" : {}, "categories" : categories});
    });
  };

  this.post = function (req, res) {
    var product = req.body;

    product.images = req.files['images'].map(function (obj) {
      return obj.filename;
    }); //SANTO MAP

    product.mainImage = req.files['mainImage'][0].filename;

    productModel.create(product, function (err, prod) {
      if (err) {
        res.status(500).send(err);
        return;
      } 

      res.status(200).send("OK");

    });

  };

  this.put = function (req, res) {
    var product = req.body;
    product.images = [];

    if (req.files['images']) {

    product.images = req.files['images'].map(function (obj) {
      return obj.filename;
    });

    }

    if (req.files['mainImage']) {
      product.mainImage = req.files['mainImage'][0].filename;
    }

    product.old_images = JSON.parse(product.old_images);
    product.images = product.images.concat(product.old_images);

    productModel.update({"_id" : req.params.id}, product, function (err, prod) {
      if (err) 
        return console.error(err);

      res.status(200).send("OK");

    });

  };

  this.getOne = function (req, res) {
    productModel.findOne({"_id" : req.params.id}, function (err, product) {
      console.log(product);
      categoryModel.find(function(err, categories) {
        res.render('admin/pages/product/form',
          { "product" : product,
            "categories" : categories
          }
        );
      });
      
    });
  };
}

module.exports = new ProductController();
