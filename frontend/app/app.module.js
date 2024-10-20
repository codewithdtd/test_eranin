var app = angular.module('myApp', ["ngRoute"]);
app.config(function($routeProvider) {
    $routeProvider
    .when('/home', {
        template: `
            <div class="text-center">
                <h1>Welcome to Home Page! {{ user.email }}</h1>
                <button type="submit" class="bg-blue-500 mt-7 hover:bg-blue-700 p-2 px-4 rounded-xl text-white" ng-click="logout()">Đăng xuất</button>
            </div>`
    })
    .otherwise({
        redirectTo: '/'
    });
});