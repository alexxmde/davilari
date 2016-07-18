var mysql = require("./connection");
var utils = require("../../../utils");

function productDAO() {

  var lastInsertId = function (cb) {
    mysql.query("SELECT LAST_INSERT_ID() AS a", function(err, rows) {
      cb(rows[0].a);
    });
    
  }

  var insertImages = function (images, IdProduct, cb) {

    for(var i = 0; i < images.length; i++) {
      query = "";
      query += "INSERT INTO Tb_Image (IdProduct, path) VALUES ( ";
      query += IdProduct + ", '" + images[i] +"'); \n";
      mysql.query(query, function(err) {
        if (err) { 
          return cb(err);
        }


      });
    }

    return cb();


  };

  var bindCategories = function (categories, IdProduct, cb) {
    var error;
    
    for(var i = 0; i < categories.length; i++) {

      if (!error) {
        query = "";
        query += "INSERT INTO Tb_Product_Category(IdCategory, IdProduct) ";
        query += "VALUES (" + categories[i] + ", " + IdProduct +  ") ";

        mysql.query(query, function(err) {
          console.log(err);
          error = err;

        });
      }
    }

    if (error) {
      cb(error);
    } else {
      cb();
    }


  };

  this.update = function (product, success, failure) {
    console.log("Updating product " + product.IdProduct);

    
    console.log(product);
    product.ambiente = utils.parseBin(product.ambiente);
    var query = "UPDATE Tb_Product SET ";
    query += "name = '" + product.name + "', ";
    query += "description = '" + product.description + "', ";
    if (product.mainImage) 
    query += "mainImage = '" + product.mainImage + "', ";

    query += "ambiente = " + product.ambiente + ", ";
    query += "price = " + product.price;
    query += " WHERE IdProduct = " + product.IdProduct;

    mysql.query(query, function (err) {
      if (err) 
       return  failure(err);
    });

    console.log("Deleting product images");
    query = "DELETE FROM Tb_Image WHERE IdProduct = " + product.IdProduct;
    mysql.query(query, function(err) {
      if (err) {
        console.error(err);
        return failure(err);
      }

      console.log("Inserting updated images");
      if (product.images) {
      insertImages(product.images, product.IdProduct, function (err) {
        if (err) {
          console.error(err);
          return failure (err);
        }
      });
      }
      

        console.log("Unbinding old categories");
        query = "DELETE FROM Tb_Product_Category WHERE IdProduct = " + product.IdProduct;
        mysql.query(query, function (err) {

          if (err) {
            console.log("Error unbinding old categories");
            console.log(err);
            return failure(err);

          }

          console.log("Binding new categories");
          console.log(product.categories);
          bindCategories(product.categories, product.IdProduct, function (err) {
            
            if (err) {
              console.log("Error binding new categories");
              console.log(err);
              return failure(err);
            }

          return success();
          });

        });


    });
  };

  this.insert = function(product, cb) {
    product.ambiente = utils.parseBin(product.ambiente);

    console.log(product);
    
    var query = "INSERT INTO Tb_Product (name, description, price, ambiente, mainImage) ";
    query += "VALUES ('" + product.name + "', ";
    query += "'" + product.description + "', ";
    query += product.price + ", ";
    query += product.ambiente + ", ";
    query += "'" + product.mainImage + "'";
    query += "); \n";
    console.log(query);

    mysql.query(query, function (err, rows) {
      if (err) { 
        console.error(err);
        return cb(err);
      }


      lastInsertId(function(ProductId) {
        bindCategories(product.categories, ProductId, function (err) {
          if (err)
            return cb (err);

          insertImages(product.images, ProductId,  function(err) {
            if (err) {
              console.log("Error inserting image");
              return cb(err);
            } else {

              return cb();
            }
          });
        });
      });


    });



  };

  this.findAll = function (cb) {
    var query = "SELECT * FROM Tb_Product";

    mysql.query(query, function (err, rows) {
      if (err) return cb(err); 

      return cb(null, rows);

    });
  };

  this.findByName = function (name, cb) {
    var query = "SELECT * FROM Tb_Product ";
    query += "WHERE name LIKE '%" + name + "%'";

    mysql.query (query, function (err, rows) {
      if (err) return cb(err);

      return cb(null, rows);

    });
  };

  this.findOne = function (id, cb) {
    console.log("Selecting Product " + id);
    var query = "SELECT * FROM Tb_Product ";
    query += "LEFT JOIN Tb_Image USING (IdProduct) ";
    query += "JOIN Tb_Product_Category USING (IdProduct) ";
    query += "WHERE IdProduct = " + id  +" ";

    console.log(query);
    var product = {};
    product.categories = [];
    product.images = [];

    mysql.query (query, function (err, rows) {
      if (err) return cb(err);

      rows.map(function (row) {
        product.IdProduct = row.IdProduct;
        product.categories.push(row.IdCategory);
        product.name = row.name;
        product.description = row.description;
        product.price = row.price;
        product.mainImage = row.mainImage;
        product.ambiente = row.ambiente;

        if (row.path)
        product.images.push(row.path);


      });

      return cb(null, product);

    });

  }

}

module.exports = new productDAO();