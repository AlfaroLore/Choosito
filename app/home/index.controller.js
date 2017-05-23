(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Home.IndexController', Controller);
 
    function Controller($http, urls, $scope) {
        var vm = this;
 
        initController();
 
        function initController() {
             $http.get(urls.BASE_API +'/me')
                .success(function (response) {
                   if(response.isParent){
                        getParent(response.userId);
                   }else{
                        getKid(response.userId);
                   }
                })
                .error(function(err){
                    console.log(err);
                });
        }

        function getParent(userId){
            $http.get(urls.BASE_API +'/parents/'+userId)
                .success(function (response) {
                    $scope.user=response.parent;
                })
                .error(function(err){
                    console.log(err);
                });
        }

        function getKid(userId){
            $http.get(urls.BASE_API +'/kids/'+userId)
                .success(function (response) {
                    $scope.user=response.kid;
                })
                .error(function(err){
                    console.log(err);
                });
        }
    }
})();