app.controller("PoemCtrl", function ($scope, $http) {
  $scope.poemsList = [];
  
  function getPoemsList() {
    $http({
      method: "POST",
      url: "/api/poemsList",
      async: true
    }).then(function(res) {
      if(res.data.success){
        $scope.poemsList = res.data.poemsList;
        console.log(res.data.poemsList);
      } else {
        console.log(res.data);
      }
    });
  }
  
  getPoemsList();
  

  $scope.state = {
    titleWarning: false,
    poemBodyWarning: false,
    dateWarning: false,
    savePoemWarning: false
  };
  
  $scope.msgs = {
    poemMsg: ""
  }

  $scope.poemData = {
    title: "",
    body: "",
    date: ""
  };
  
   $scope.poemDataDefault = function() {
    $scope.poemData.title = "";
    $scope.poemData.body = "";
    $scope.poemData.date = "";
  }

  $scope.savePoem = function () {
    
    if($scope.poemData.title && $scope.poemData.body && $scope.poemData.date) {
      
      $http({
        method: "POST",
        url: "/api/savePoem",
        async: true,
        data: {
          'title': $scope.poemData.title,
          'body': $scope.poemData.body,
          'date': $scope.poemData.date
        }
      }).then(function(res) {
        if (res.data.success) {
          $scope.msgs.poemMsg = res.data.msg;
          $scope.state.savePoemWarning = true;
          $scope.poemDataDefault();
          getPoemsList();
        } else {
          $scope.state.savePoemWarning = false;
          $scope.msgs.poemMsg = "Incorrect format date!";
        }
      })
    } else {
      
      if (!$scope.poemData.title) {
        $scope.state.titleWarning = true;
      } else {
        $scope.state.titleWarning = false;
      }
      
      if(!$scope.poemData.body) {
        $scope.state.poemBodyWarning = true;
      } else {
        $scope.state.poemBodyWarning = false;
      }
      
      if(!$scope.poemData.date) {
        $scope.state.dateWarning = true;
      } else {
        $scope.state.dateWarning = false;
      }
    }
  }
})