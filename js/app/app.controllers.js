/* global objectId */
angular.module('GoReSale.app.controllers', [])


.controller('AppCtrl', function($scope,$state, AuthService, $rootScope,$ionicHistory, $stateParams) {
  
 if ($stateParams.clear) {
        $ionicHistory.clearHistory();
        $ionicHistory.clearCache();
    }
        
        $scope.logout = function() {
        Parse.User.logOut();
        $rootScope.user = 'anonymous';
        $rootScope.isLoggedIn = false;
        $state.go('facebook-sign-in');
    };
      
    
})


.controller('ProfileCtrl', function($scope, $stateParams, PostService, $ionicHistory, $state, $ionicScrollDelegate) {

  $scope.$on('$ionicView.afterEnter', function() {
    $ionicScrollDelegate.$getByHandle('profile-scroll').resize();
  });
  
  var userId = Parse.User.current().id;

  $scope.myProfile = userId;
  $scope.posts = {};
  $scope.user = {};

  PostService.getUserPosts(userId).then(function(data){
    $scope.posts = data;
  });

  PostService.getUserDetails(userId).then(function(data){
    $scope.user = data;
  });

  
  $scope.getUserPosts = function(userId){
    //we need to do this in order to prevent the back to change
    $ionicHistory.currentView($ionicHistory.backView());
    $ionicHistory.nextViewOptions({ disableAnimate: true });
    $state.go('app.feed', {userId: userId});
  };

})


.controller('ProductCtrl', function($scope, $stateParams, ShopService, $ionicPopup, $ionicLoading) {
  var productId = $stateParams.productId;

  ShopService.getProduct(productId).then(function(product){
    $scope.product = product;
  });

  // show add to cart popup on button click
  $scope.showAddToCartPopup = function(product) {
    $scope.data = {};
    $scope.data.product = product;
    $scope.data.productOption = 1;
    $scope.data.productQuantity = 1;

    var myPopup = $ionicPopup.show({
      cssClass: 'add-to-cart-popup',
      templateUrl: 'views/app/shop/partials/add-to-cart-popup.html',
      title: 'Add to Cart',
      scope: $scope,
      buttons: [
        { text: '', type: 'close-popup ion-ios-close-outline' },
        {
          text: 'Add to cart',
          onTap: function(e) {
            return $scope.data;
          }
        }
      ]
    });
    myPopup.then(function(res) {
      if(res)
      {
        $ionicLoading.show({ template: '<ion-spinner icon="ios"></ion-spinner><p style="margin: 5px 0 0 0;">Adding to cart</p>', duration: 1000 });
        ShopService.addProductToCart(res.product);
        console.log('Item added to cart!', res);
      }
      else {
        console.log('Popup closed');
      }
    });
  };
})


.controller('FeedCtrl', function($scope, PostService) {
  $scope.posts = [];
  $scope.page = 1;
  $scope.totalPages = 1;

  $scope.doRefresh = function() {
    PostService.getFeed(1)
    .then(function(data){
      $scope.totalPages = data.totalPages;
      $scope.posts = data.posts;

      $scope.$broadcast('scroll.refreshComplete');
    });
  };

  $scope.getNewData = function() {
    //do something to load your new data here
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.loadMoreData = function(){
    $scope.page += 1;

    PostService.getFeed($scope.page)
    .then(function(data){
      //We will update this value in every request because new posts can be created
      $scope.totalPages = data.totalPages;
      $scope.posts = $scope.posts.concat(data.posts);

      $scope.$broadcast('scroll.infiniteScrollComplete');
    });
  };

  $scope.moreDataCanBeLoaded = function(){
    return $scope.totalPages > $scope.page;
  };

  $scope.doRefresh();

 
})


.controller('ShopCtrl', function($scope, ShopService) {
  $scope.products = [];
  $scope.popular_products = [];

  ShopService.getProducts().then(function(products){
    $scope.products = products;
  });



  ShopService.getProducts().then(function(products){
    $scope.popular_products = products.slice(0, 2);
  });
})


.controller('ShoppingCartCtrl', function($scope, ShopService, $ionicActionSheet, _) {
  $scope.products = ShopService.getCartProducts();

  $scope.removeProductFromCart = function(product) {
    $ionicActionSheet.show({
      destructiveText: 'Remove from cart',
      cancelText: 'Cancel',
      cancel: function() {
        return true;
      },
      destructiveButtonClicked: function() {
        ShopService.removeProductFromCart(product);
        $scope.products = ShopService.getCartProducts();
        return true;
      }
    });
  };

  $scope.getSubtotal = function() {
    return _.reduce($scope.products, function(memo, product){ return memo + product.price; }, 0);
  };

$scope.data = {
    selectWrapper: null,
    
    option1: 'Shiny Black Gold',
   };

$scope.data2 = {selectQuantity:null,
option1: '1',};
})


.controller('CheckoutCtrl', function($scope,$state, $rootScope, $stateParams, $ionicHistory, $ionicModal,ShopService,_) {
   $scope.data = {};
   
   $scope.shippingAddress = function(){
     
     //create user shipping address in parse
     var user = new Parse.Object("Address");
     user.set("fullName",$scope.data.fullName);
     user.set("address1",$scope.data.address1);
     user.set("address2",$scope.data.address2);
     user.set("city",$scope.data.city);
     user.set("state",$scope.data.state);
     user.set("country",$scope.data.country);
     user.set("postalCode",$scope.data.postalCode);
     user.set("phoneNumber",$scope.data.phoneNumber);
     user.set("email",$scope.data.email);
     user.set( "userId", { "__type": "Pointer", "className": "_User", "objectId": Parse.User.current().id } );
    
      // create ACL
      var acl = new Parse.ACL();
      // public cannot read data
      acl.setPublicReadAccess(false);
      // user can read data
      acl.setReadAccess( Parse.User.current(), true );
      // save ACL to object
      user.setACL( acl );
    
     user.save({
     success: function(){
       alert("success!Shipping address save.");
     
       console.log("Submit shipping address");
       $state.go('app.checkout');
       if (user) {
            $rootScope.user = user;
            $rootScope.isLoggedIn = true;
        }
        else if(!user){
           $rootScope.user = user;
            $rootScope.isLoggedIn = false;
        }
     },
     error: function(error) {
      // Show the error message somewhere and let the user try again.
      alert("Error: " + error.code + " " + error.message);
    }
    });
     
     
   };
   
  $scope.data = {
    selectWrapper: null,
    
    option1: 'Shiny Black Gold',
   };

$scope.data2 = {selectQuantity:null,
option1: '1',};

  
  $scope.getSubtotal = function() {
    $scope.products = ShopService.getCartProducts();
    return _.reduce($scope.products, function(memo, product){ return memo + product.price; }, 0);
  };
   
  $scope.getTotal= function(product,data2){
    $scope.products = ShopService.getCartProducts();
    var total = 0;
     return total += product.price*data2.selectQuantity;
  };
  
  $ionicModal.fromTemplateUrl('views/app/shop/wire-transfer.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.wire_transfer_modal = modal;
  });
  
  $ionicModal.fromTemplateUrl('views/app/shop/orderSummary.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.order_summary_modal = modal;
  });
  
  $ionicModal.fromTemplateUrl('views/app/shop/order.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal){
    $scope.order_modal = modal;
  });
  
  $scope.showTransfer = function(){
    $scope.wire_transfer_modal.show();
  }
  
   $scope.showSummary = function(){
    $scope.order_summary_modal.show();
  }
  
  $scope.order = function(){
    $scope.order_modal.show();
  }
  
})


.controller('SettingsCtrl', function($scope,$state,$rootScope, $ionicModal,$cordovaDevice, $cordovaFile, $ionicPlatform, $cordovaEmailComposer, $ionicActionSheet, ImageService, FileService) {
  
 $ionicModal.fromTemplateUrl('views/app/profile/product-upload.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.product_upload_modal = modal;
  });
  
  $ionicModal.fromTemplateUrl('views/app/profile/resit-upload.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.resit_upload_modal = modal;
  });
  
  $ionicModal.fromTemplateUrl('views/app/profile/post-topic.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.post_topic_modal = modal;
  });
 
  $ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.terms_of_service_modal = modal;
  });

  $ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.privacy_policy_modal = modal;
  });

  $ionicModal.fromTemplateUrl('views/app/profile/about-us.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.about_us_modal = modal;
  });

  $scope.uploadProduct = function() {
    $scope.product_upload_modal.show();
  };
  
  $scope.uploadResit = function() {
    $scope.resit_upload_modal.show();
  };
  
  $scope.postForum = function() {
    $scope.post_topic_modal.show();
  };

  $scope.showTerms = function() {
    $scope.terms_of_service_modal.show();
  };

  $scope.showPrivacyPolicy = function() {
    $scope.privacy_policy_modal.show();
  };
  
  $scope.showAboutUs = function() {
    $scope.about_us_modal.show();
  };
  
  $scope.posts={};
      
      $scope.postTopic = function(){
      
     
      var user = Parse.User.current();
      var Post = new Parse.Object("Forum");
     
      Post.set("title",$scope.posts.title);
      Post.set("content",$scope.posts.content);
      Post.set( "userId", { "__type": "Pointer", "className": "_User", "objectId": Parse.User.current().id } );
      
      // create ACL
      var postACL = new Parse.ACL(Parse.User.current());
      postACL.setPublicReadAccess(true);
      // user can read data
      postACL.setReadAccess( Parse.User.current(), true );
      // save ACL to object
      Post.setACL( postACL );
      
      Post.save(null,{
       success: function(Post){
       alert("Forum post created with objectId: " + Post.id);
      console.log("Submit post in forum");
       $state.go('app.feed');
      
          if(user){
           $rootScope.Post = Post;
           $rootScope.isLoggedIn = true;
          }
          else if(!user){
            $rootScope.title = $scope.posts.title;
            $rootScope.content = $scope.posts.content;
            $rootScope.isLoggedIn = false;
          }
 
     },
     error:function(Post, error) {
      // Show the error message somewhere and let the user try again.
      alert("Failed to created new post: " + error.code + " " + error.message);
    }
    });
         };
         
  $scope.product={};
  
   $scope.uploadItem = function() {
       
       var product = new Parse.Object("Product")
      

       product.set("title", $scope.product.title);
       product.set("description",$scope.product.description);
       product.set("price", $scope.product.price);
       
       product.set( "userId", { "__type": "Pointer", "className": "_User", "objectId": Parse.User.current().id } );
      // create ACL
      var acl = new Parse.ACL();
      // public cannot read data
      acl.setPublicReadAccess(false);
      // user can read data
      acl.setReadAccess( Parse.User.current(), true );
      // save ACL to object
      product.setACL( acl );
       product.save(null,{
        success: function(){
            alert("Product uploaded with productId: " + product.id);
            $rootScope.product = product;
            
            console.log("upload product");
            

    },
    error: function(error){
        alert("Failed to upload product: " + error.code + " " + error.message);
        
    }
       });
   };  
     
  $ionicPlatform.ready(function() {
    $scope.images = FileService.images();
    $scope.$apply();
  });
 
  $scope.urlForImage = function(imageName) {
    var trueOrigin = cordova.file.dataDirectory + imageName;
    return trueOrigin;
  };
 
  $scope.addMedia = function() {
    $scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Take photo' },
        { text: 'Photo from library' }
      ],
      titleText: 'Add images',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        $scope.addImage(index);
      }
    });
  };
 
  $scope.addImage = function(type) {
    $scope.hideSheet();
    ImageService.handleMediaDialog(type).then(function() {
      $scope.$apply();
    });
  };
  
  $scope.sendEmail = function() {
    if ($scope.images != null && $scope.images.length > 0) {
      var mailImages = [];
      var savedImages = $scope.images;
      if ($cordovaDevice.getPlatform() == 'Android') {
        // Currently only working for one image..
        var imageUrl = $scope.urlForImage(savedImages[0]);
        var name = imageUrl.substr(imageUrl.lastIndexOf('/') + 1);
        var namePath = imageUrl.substr(0, imageUrl.lastIndexOf('/') + 1);
        $cordovaFile.copyFile(namePath, name, cordova.file.externalRootDirectory, name)
        .then(function(info) {
          mailImages.push('' + cordova.file.externalRootDirectory + name);
          $scope.openMailComposer(mailImages);
        }, function(e) {
          reject();
        });
      } else {
        for (var i = 0; i < savedImages.length; i++) {
          mailImages.push('' + $scope.urlForImage(savedImages[i]));
        }
        $scope.openMailComposer(mailImages);
      }
    }
  };
 
  $scope.openMailComposer = function(attachments) {
    var bodyText = '<html><h2>My Images</h2></html>';
    var email = {
        to: 'some@email.com',
        attachments: attachments,
        subject: 'Devdactic Images',
        body: bodyText,
        isHtml: true
      };
 
    $cordovaEmailComposer.open(email).then(null, function() {
      for (var i = 0; i < attachments.length; i++) {
        var name = attachments[i].substr(attachments[i].lastIndexOf('/') + 1);
        $cordovaFile.removeFile(cordova.file.externalRootDirectory, name);
      }
    });
  };
});