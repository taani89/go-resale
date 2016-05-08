angular.module('GoReSale.auth.controllers', [])


.controller('WelcomeCtrl', function($scope, $state, $ionicModal, $ionicViewService,
                                         $cordovaFacebook){

	$scope.bgs = ["img/IMG.jpg"];
	$scope.facebookSignIn = function(){
     //Browser Login
  if(!(ionic.Platform.isIOS() || ionic.Platform.isAndroid())){
    Parse.FacebookUtils.logIn(null, {
      success: function(user) {
        if (!user.existed()) {
          alert("User signed up and logged in through Facebook!");
        } else {
          alert("User logged in through Facebook!");
        }
        console.log("doing facebook sign in");
        $state.go('app.settings');
      },
      error: function(user, error) {
        alert("User cancelled the Facebook login or did not fully authorize.");
      }
    });
 
  } 
  //Native Login
  else {
 
    $cordovaFacebook.login(["public_profile", "email"]).then(function(success){
 
      console.log(success);
 
      //Need to convert expiresIn format from FB to date
      var expiration_date = new Date();
      expiration_date.setSeconds(expiration_date.getSeconds() + success.authResponse.expiresIn);
      expiration_date = expiration_date.toDATEString();
 
      var facebookAuthData = {
        "id": success.authResponse.userID,
        "access_token": success.authResponse.accessToken,
        "expiration_date": expiration_date
      };
 
      Parse.FacebookUtils.logIn(facebookAuthData, {
        success: function(user) {
          
          if (!user.existed()) {
            alert("User signed up and logged in through Facebook!");
          } else {
            alert("User logged in through Facebook!");
          }
          console.log("doing facebook sign in");
		      $state.go('app.settings');
        },
        error: function(user, error) {
          alert("User cancelled the Facebook login or did not fully authorize.");
        }
      });
 
    }, function(error){
      console.log(error);
    });
 
  }
    
	};

	$ionicModal.fromTemplateUrl('views/app/legal/privacy-policy.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.privacy_policy_modal = modal;
  });

	$ionicModal.fromTemplateUrl('views/app/legal/terms-of-service.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.terms_of_service_modal = modal;
  });

  $scope.showPrivacyPolicy = function() {
    $scope.privacy_policy_modal.show();
  };

	$scope.showTerms = function() {
    $scope.terms_of_service_modal.show();
  };
})

.controller('CreateAccountCtrl', function($scope, $state,$rootScope){
  $scope.data = {};
  
	$scope.doSignUp = function(){
    //Create a new user on Parse
  var user = new Parse.User();
  user.set("name", $scope.data.name);
  user.set("username",$scope.data.username);
  user.set("email", $scope.data.email);
  user.set("phone", $scope.data.phone);
  user.set("password", $scope.data.password);
  
 
  user.signUp(null, {
    success: function(user) {
      alert("success!");
      $rootScope.user = user;
      $rootScope.isLoggedIn = true;
      // Hooray! Let them use the app now.
      console.log("doing sign up");
		$state.go('welcome-back');
    },
    error: function(user, error) {
      // Show the error message somewhere and let the user try again.
      alert("Error: " + error.code + " " + error.message);
    }
   
  });
		
	};
})

.controller('WelcomeBackCtrl', function($scope, $state, $ionicModal, $rootScope){
  
  
  $scope.data = {
    username: null,
    password: null
  };
  
	$scope.doLogIn = function(){
    var user = $scope.data;
    Parse.User.logIn(user.username, user.password, {
    success: function(user) {
      // Do stuff after successful login.
      alert("success!");
      $rootScope.user = user;
      $rootScope.isLoggedIn = true;
      console.log("doing log in");
	    $state.go('app.settings');
    },
    error: function(user, error) {
      // The login failed. Check error to see why.
      alert("Error: " + error.code + " " + error.message);
    }
  });
   
	};

	$ionicModal.fromTemplateUrl('views/auth/forgot-password.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.forgot_password_modal = modal;
  });

  $scope.showForgotPassword = function() {
    $scope.forgot_password_modal.show();
  };
  
  $scope.data = {};
	$scope.requestNewPassword = function() {
     Parse.User.requestPasswordReset($scope.data.email, {
            success: function() {
                // TODO: show success
                $scope.state.success = true;
                $scope.$apply();
            },
            error: function(err) {
                
                if (err.code === 125) {
                    $scope.error.message = 'Email address does not exist';
                } else {
                    $scope.error.message = 'An unknown error has occurred, ' +
                        'please try again';
                }
                $scope.$apply();
            }
        });
    console.log("requesting new password");
    $state.go('welcome-back');
  };
  
 

  // //Cleanup the modal when we're done with it!
  // $scope.$on('$destroy', function() {
  //   $scope.modal.remove();
  // });
  // // Execute action on hide modal
  // $scope.$on('modal.hidden', function() {
  //   // Execute action
  // });
  // // Execute action on remove modal
  // $scope.$on('modal.removed', function() {
  //   // Execute action
  // });
})



