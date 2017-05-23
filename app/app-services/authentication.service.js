(function () {
    'use strict';
 
    angular
        .module('app')
        .factory('AuthenticationService', Service);
 
    function Service($http, $localStorage, uuid2, jwtHelper,urls,$interval) {
        var service = {};
        var refreshTokenTimeout;
        service.Login = Login;
        service.Logout = Logout;
 
        return service;
 
        function Login(username, password, callback) {
            $http.post(urls.BASE_API +'/auth', { username: username, password: password, idDevice: uuid2.newuuid(), os: navigator.appVersion })
                .success(function (response) {
                    // login successful if there's a token in the response
                    if (response.access_token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        $localStorage.currentUser = { username: username, token: response.access_token };
 
                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.access_token;
                        handleAuthResponse(response);
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
            $interval.cancel(refreshTokenTimeout);
        }

        function handleAuthResponse(response){
            var token = jwtHelper.decodeToken(response.access_token);
            var expiresAt = token.exp;
            scheduleAccessTokenRefresh(expiresAt,response.access_token);
        }

        function scheduleAccessTokenRefresh(expiresAt, token){
            expiresAt = new Date(expiresAt * 1000).getTime();
            const now = (new Date()).getTime();
            const wait = expiresAt - now - (60 * 1000);

            if (wait > 0) {
                $interval.cancel(refreshTokenTimeout);
                refreshTokenTimeout = $interval(refreshAccessToken, wait,[0],[true], [token]);
            }


        }

        function refreshAccessToken(params){
            $http.post(urls.BASE_API +'/refreshauth', { access_token : params[0] })
                .success(function (response) {
                    // login successful if there's a token in the response
                    if (response.access_token) {
                        // store username and token in local storage to keep user logged in between page refreshes
                        var token = jwtHelper.decodeToken(response.access_token);

                        $localStorage.currentUser = { username: token.user, token: response.access_token };
 
                        // add jwt token to auth header for all requests made by the $http service
                        $http.defaults.headers.common.Authorization = 'Bearer ' + response.access_token;
                        handleAuthResponse(response);
                    } else {
                        console.log("Access token could not be refreshed");
                    }
                })
                .error(function(err){
                  console.log("Access token could not be refreshed");
                });
        }
    }
})();