angular.module('GoReSale.app.services', [])

.service('AuthService', function (){

  this.saveUser = function(user){
    window.localStorage.GoReSale_user = JSON.stringify(user);
  };

  this.getLoggedUser = function(){

    return (window.localStorage.GoReSale_user) ?
      JSON.parse(window.localStorage.GoReSale_user) : null;
  };

})

.service('PostService', function ($http, $q){

  this.getUserDetails = function(userId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {
      //find the user
      var user = _.find(database.users, function(user){ return user._id == userId; });
      dfd.resolve(user);
    });

    return dfd.promise;
  };

  this.getUserPosts = function(userId){
    var dfd = $q.defer();

    $http.get('database.json').success(function(database) {

      //get user posts
      var userPosts =  _.filter(database.posts, function(post){ return post.userId == userId; });
      //sort posts by published date
      var sorted_posts = _.sortBy(userPosts, function(post){ return new Date(post.date); });

      //find the user
      var user = _.find(database.users, function(user){ return user._id == userId; });

      //add user data to posts
      var posts = _.each(sorted_posts.reverse(), function(post){
        post.user = user;
        return post;
      });

      dfd.resolve(posts);
    });

    return dfd.promise;
  };


  this.getFeed = function(page){

    var pageSize = 5, // set your page size, which is number of records per page
        skip = pageSize * (page-1),
        totalPosts = 1,
        totalPages = 1,
        dfd = $q.defer();

    $http.get('database.json').success(function(database) {

      totalPosts = database.posts.length;
      totalPages = totalPosts/pageSize;

      var sortedPosts =  _.sortBy(database.posts, function(post){ return new Date(post.date); }),
          postsToShow = sortedPosts.slice(skip, skip + pageSize);

      //add user data to posts
      var posts = _.each(postsToShow.reverse(), function(post){
        post.user = _.find(database.users, function(user){ return user._id == post.userId; });
        return post;
      });

      dfd.resolve({
        posts: posts,
        totalPages: totalPages
      });
    });

    return dfd.promise;
  };
})



.service('ShopService', function ($http, $q, _){

  this.getProducts = function(){
    var dfd = $q.defer();
    $http.get('database.json').success(function(database) {
      dfd.resolve(database.products);
    });
    return dfd.promise;
  };

  this.getProduct = function(productId){
    var dfd = $q.defer();
    $http.get('database.json').success(function(database) {
      var product = _.find(database.products, function(product){ return product._id == productId; });

      dfd.resolve(product);
    });
    return dfd.promise;
  };

  this.addProductToCart = function(productToAdd){
    var cart_products = !_.isUndefined(window.localStorage.goresale_cart) ? JSON.parse(window.localStorage.goresale_cart) : [];

    //check if this product is already saved
    var existing_product = _.find(cart_products, function(product){ return product._id == productToAdd._id; });

    if(!existing_product){
      cart_products.push(productToAdd);
    }

    window.localStorage.goresale_cart = JSON.stringify(cart_products);
  };

  this.getCartProducts = function(){
    return JSON.parse(window.localStorage.goresale_cart || '[]');
  };

  this.removeProductFromCart = function(productToRemove){
    var cart_products = JSON.parse(window.localStorage.goresale_cart);

    var new_cart_products = _.reject(cart_products, function(product){ return product._id == productToRemove._id; });

    window.localStorage.goresale_cart = JSON.stringify(new_cart_products);
  };

})

.service('FileService', function() {
  var images;
  var IMAGE_STORAGE_KEY = 'images';
 
  function getImages() {
    var img = window.localStorage.getItem(IMAGE_STORAGE_KEY);
    if (img) {
      images = JSON.parse(img);
    } else {
      images = [];
    }
    return images;
  };
 
  function addImage(img) {
    images.push(img);
    window.localStorage.setItem(IMAGE_STORAGE_KEY, JSON.stringify(images));
  };
 
  return {
    storeImage: addImage,
    images: getImages
  }
})

.service('ImageService', function($cordovaCamera, FileService, $q, $cordovaFile) {
 
  function makeid() {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
 
    for (var i = 0; i < 5; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };
 
  function optionsForType(type) {
    var source;
    switch (type) {
      case 0:
        source = Camera.PictureSourceType.CAMERA;
        break;
      case 1:
        source = Camera.PictureSourceType.PHOTOLIBRARY;
        break;
    }
    return {
      destinationType: Camera.DestinationType.FILE_URI,
      sourceType: source,
      allowEdit: false,
      encodingType: Camera.EncodingType.JPEG,
      popoverOptions: CameraPopoverOptions,
      saveToPhotoAlbum: false
    };
  }
 
  function saveMedia(type) {
    return $q(function(resolve, reject) {
      var options = optionsForType(type);
 
      $cordovaCamera.getPicture(options).then(function(imageUrl) {
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        var newName = makeid() + name;
        $cordovaFile.copyFile(namePath, name, cordova.file.dataDirectory, newName)
          .then(function(info) {
            FileService.storeImage(newName);
            resolve();
          }, function(e) {
            reject();
          });
      });
    })
  }
  return {
    handleMediaDialog: saveMedia
  }
});