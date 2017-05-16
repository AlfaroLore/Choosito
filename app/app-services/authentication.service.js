(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('AuthenticationService', Service);
 
    function Service($http, $localStorage, uuid2) {
        var service = {};
 
        service.Login = Login;
        service.Logout = Logout;
 
        return service;
 
        function Login(username, password, callback) {
            $http.post('https://getchoosi.com/KidsChooseApi/v1.0/auth', { username: username, password: password, idDevice: uuid2.newuuid(), os: navigator.appVersion })
                .success(function (response) {
                    // login successful if there's a token in the response
                    if (response.access_token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = { username: username, token: response.token };
 
                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.token;
 
                        // execute callback with true to indicate successful login
                        callback(true);
                    } else {
                        // execute callback with false to indicate failed login
                        callback(false);
                    }
                })
                .error(function(err){
                  callback(false);
                });
        }
 
        function Logout() {
            // remove user from local storage and clear http auth header
            delete $localStorage.currentUser;
            $http.defaults.headers.common.Authorization = '';
        }
    }
})();