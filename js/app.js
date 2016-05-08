angular.module('underscore', [])
.factory('_', function() {
  return window._; // assumes underscore has already been loaded on the page
});



angular.module('GoReSale', [
  'ionic','ionic.service.core',
  'GoReSale.common.directives',
  'GoReSale.app.controllers',
  'GoReSale.auth.controllers',
  'GoReSale.app.services',
  'GoReSale.views',
  'underscore',
  'angularMoment',
  'ngCordova'
])


// Enable native scrolls for Android platform only,
// as you see, we're disabling jsScrolling to achieve this.
.config(function ($ionicConfigProvider) {
  if (ionic.Platform.isAndroid()) {
    $ionicConfigProvider.scrolling.jsScrolling(false);
  }
})

.run(function($ionicPlatform, $rootScope, $ionicHistory, $state) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    
    Parse.initialize("3ORg0I7s6uCCsqXPVo7mulrbD1FgLgnER0cJ6vIB","09JJZTtSeZ0v6syQLQa01tfGZQDWNjuBZ8BKkteA","pcHU9s4cgqOaCLN66sno5jdThNRUMPLu7CiY0lDH");
    Parse.User.enableRevocableSession();
    
        var currentUser = Parse.User.current();

        if (currentUser) {
            $rootScope.user = currentUser;
            $rootScope.isLoggedIn = true;
            $state.go('app.settings');
        }
        else if(!currentUser){
           $rootScope.user = 'anonymous';
            $rootScope.isLoggedIn = false;
        }
       
        
    if(!(ionic.Platform.isIOS() || ionic.Platform.isAndroid())){
      
    window.fbAsyncInit = function() {
      Parse.FacebookUtils.init({
          appId      : '1096817230352428', 
          version    : 'v2.5',
          xfbml      : true
      });
  };
 
  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "//connect.facebook.net/en_US/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
}
  });
})

.config(function($stateProvider, $urlRouterProvider) {
 
 
  $stateProvider

  //SIDE MENU ROUTES
  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "views/app/side-menu.html",
    controller: 'AppCtrl'
  })

  .state('app.feed', {
    url: "/feed",
    views: {
      'menuContent': {
        templateUrl: "views/app/feed.html",
        controller: "FeedCtrl"
      }
    }
  })

  .state('app.profile', {
    abstract: true,
    url: '/profile/:userId',
    views: {
      'menuContent': {
        templateUrl: "views/app/profile/profile.html",
        controller: 'ProfileCtrl'
      }
    }
  })

  .state('app.profile.posts', {
    url: '/posts',
    views: {
      'profileContent': {
        templateUrl: 'views/app/profile/profile.posts.html'
      }
    }
  })

  .state('app.settings', {
    url: "/settings",
    views: {
      'menuContent': {
        templateUrl: "views/app/profile/settings.html",
        controller: 'SettingsCtrl'
      }
    }
  })

  .state('app.shop', {
    url: "/shop",
    abstract: true,
    views: {
      'menuContent': {
        templateUrl: "views/app/shop/shop.html"
      }
    }
  })

  .state('app.shop.home', {
    url: "/",
    views: {
      'shop-home': {
        templateUrl: "views/app/shop/shop-home.html",
        controller: 'ShopCtrl'
      }
    }
  })

  .state('app.shop.popular', {
    url: "/popular",
    views: {
      'shop-popular': {
        templateUrl: "views/app/shop/shop-popular.html",
        controller: 'ShopCtrl'
      }
    }
  })

  .state('app.shop.sale', {
    url: "/sale",
    views: {
      'shop-sale': {
        templateUrl: "views/app/shop/shop-sale.html",
        controller: 'ShopCtrl'
      }
    }
  })

  .state('app.cart', {
    url: "/cart",
    views: {
      'menuContent': {
        templateUrl: "views/app/shop/cart.html",
        controller: 'ShoppingCartCtrl'
      }
    }
  })

  .state('app.shipping-address', {
    url: "/shipping-address",
    views: {
      'menuContent': {
        templateUrl: "views/app/shop/shipping-address.html",
        controller: "CheckoutCtrl"
      }
    }
  })

  .state('app.checkout', {
    url: "/checkout",
    views: {
      'menuContent': {
        templateUrl: "views/app/shop/checkout.html",
        controller: "CheckoutCtrl"
      }
    }
  })

  .state('app.product-detail', {
    url: "/product/:productId",
    views: {
      'menuContent': {
        templateUrl: "views/app/shop/product-detail.html",
        controller: 'ProductCtrl'
      }
    }
  })


  //AUTH ROUTES
  .state('facebook-sign-in', {
    url: "/facebook-sign-in",
    templateUrl: "views/auth/facebook-sign-in.html",
    controller: 'WelcomeCtrl'
  })

  .state('dont-have-facebook', {
    url: "/dont-have-facebook",
    templateUrl: "views/auth/dont-have-facebook.html",
    controller: 'WelcomeCtrl'
  })

  .state('create-account', {
    url: "/create-account",
    templateUrl: "views/auth/create-account.html",
    controller: 'CreateAccountCtrl'
  })

  .state('welcome-back', {
    url: "/welcome-back",
    templateUrl: "views/auth/welcome-back.html",
    controller: 'WelcomeBackCtrl'
  })
;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/facebook-sign-in');
  // $urlRouterProvider.otherwise('/app/feed');
})


;
