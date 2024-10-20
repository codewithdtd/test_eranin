angular.module('myApp').service('AuthService', function($http, $q) {
    // Auth service methods
    this.register = function(user) {
        return $http.post('http://localhost:3000/auth/register', user, { withCredentials: true });
    };

    this.login = function(user) {
        return $http.post('http://localhost:3000/auth/login', user, { withCredentials: true });
    };

    this.logout = function(user) {
        return $http.post('http://localhost:3000/auth/logout', user, { withCredentials: true });
    };
    this.refresh = function() {
        return $http.post('http://localhost:3000/auth/refresh', {}, { withCredentials: true });
    };

    this.enableMFA = function(user) {
        return $http.post('http://localhost:3000/auth/enable-mfa', user, { withCredentials: true });
    };

    this.verifyMFA = function(user) {
        return $http.post('http://localhost:3000/auth/verify-mfa', user, { withCredentials: true });
    };
});
