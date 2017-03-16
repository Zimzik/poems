angular.module("SomeApp", [])
  .controller("SomeAppCtrl", function($scope, $http) {
  
  $scope.states = {
    loginWindow: false,
    registerWindow: false,
    logged: false,
    activeUser: "",
    loginWarning: false,
    passConfWarning: false,
    newUserCreated: false
  };
  
  $scope.msgs = {
    loginMsg: "",
    regMsg: ""
  };
  
  $scope.userInfo = {
    userLogin: "",
    userPass: "",
    confUserPass: ""
  }
  
  let clearUserInfo = function() {
    $scope.userInfo.userLogin = "";
    $scope.userInfo.userPass = "";
    $scope.userInfo.confUserPass = "";
  }

/*==========Page Loading==========*/
  
if (window.localStorage.RESTfulToken) {
  $http({
    method: "GET",
    url: "api/memberinfo",
    headers: {
      "authorization": window.localStorage.RESTfulToken
    }
  }).then(function(res){
      if (res.data.success) {
        $scope.states.activeUser = res.data.user;
        $scope.states.logged = true;
        $scope.states.loginWindow = false;
        console.log(res);
      }
  }),
    function(res){
      console.log(res);
    }
} else {
  $scope.states.logged = false;
};
  
/*===========Log Off===========*/
  
$scope.logOff = function() {
  $scope.states.logged = false;
  $scope.states.loginWindow = true;
  $scope.states.activeUser = "";
  window.localStorage.RESTfulToken = "";
}

if (!$scope.states.logged) {

  $scope.states.loginWindow = true;

  $scope.activateLoginWindow = function () {
    $scope.states.loginWindow = true;
    $scope.states.registerWindow = false;
  };

  $scope.activateRegisterWindow = function () {
    $scope.states.loginWindow = false;
    $scope.states.registerWindow = true;
  }
  
/*=============Login============*/
  
  $scope.login = function () {
    $http({
      method: "POST",
      url: "/api/authenticate",
      data: {
        'name': $scope.userInfo.userLogin,
        'password': $scope.userInfo.userPass
      }
    }).then(function(res) {
      if(res.data.success){
        console.log(res);
        window.localStorage.RESTfulToken = res.data.token;
        $scope.states.activeUser = $scope.userInfo.userLogin;
        $scope.states.logged = true;
        $scope.states.loginWindow = false;
        $scope.states.loginWarning = false;
        $scope.msgs.regMsg = "";
        $scope.msgs.loginMsg = "";
        clearUserInfo();
      } else {
        $scope.msgs.loginMsg = res.data.msg;
        $scope.states.loginWarning = false;
        console.log(res);
      }
    }),
    function(res) {
      console.log("Login error: " + res);
    }
  }
  
  /*===================Registration====================*/
  
  $scope.registration = function() {
    $scope.states.passConfWarning = false;
    
    if ($scope.userInfo.userPass == $scope.userInfo.confUserPass) {
      $http({
        method: "POST",
        url: "/api/signup",
        data: {
          'name': $scope.userInfo.userLogin,
          'password': $scope.userInfo.userPass
        }
      }).then(function(res) {
        if(res.data.success) {
          $scope.states.newUserCreated = true;
          $scope.msgs.regMsg = res.data.msg;
          console.log(res);
        } else {
          $scope.states.newUserCreated = false;
          $scope.msgs.regMsg = res.data.msg;
          console.log(res);
        }
      }),
      function(res) {
        console.log("Registration error: " + res);
      } 
    } else {
        $scope.states.passConfWarning = true;
    }
  }
}
});
