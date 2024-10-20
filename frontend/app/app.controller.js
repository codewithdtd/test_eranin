angular.module('myApp').controller('FormController', function($scope, AuthService, $location) {
    $scope.user = {};
    $scope.isLogin = false;
    $scope.message = false;
    $scope.isRegister = false;
    $scope.mfa = '';
    $scope.qrCode = '';

    if (localStorage.getItem('isLogged') === 'true') {
        $scope.isLogin = true;
        $scope.user = JSON.parse(localStorage.getItem('user')); // Lấy thông tin người dùng từ localStorage
    }
    
    $scope.toggleForm = function() {
        $scope.isRegister = !$scope.isRegister;
    };

    $scope.register = function() {
        AuthService.register($scope.user).then(function(response) {
            $scope.message = 'Registration successful!';
            $scope.user = {};
        }).catch(function(error) {
            $scope.message = { error: error.data.message };
            console.log(error)
        });
    };

    $scope.login = function(e) {
        e.preventDefault();
        AuthService.login($scope.user).then(function(response) {
            if (response && response.data) {
                $scope.user = response.data;
                console.log($scope.user);
                $scope.mfa = true;
                if (!$scope.user.mfaEnabled) {
                    AuthService.enableMFA($scope.user).then(function(res) {
                        $scope.qrCode = res.data.qrCodeDataUrl;
                    });
                }
                $scope.message = '';
            } else {
                $scope.message = { error: 'Invalid login response' };
            }
        }).catch(function(error) {
            $scope.message = {error: error.data.message};
            console.log(error)
        });
    }
    $scope.verify = function(e) {
        e.preventDefault();
        AuthService.verifyMFA($scope.user).then(function(response) {
           if (response && response.data && response.data.token) {
                // Chỉ chuyển hướng khi có token trong response
                localStorage.setItem('user', JSON.stringify($scope.user));
                localStorage.setItem('isLogged', true);
                localStorage.setItem('accessToken', response.data.token);
                $scope.isLogin = true;
                $location.path('/home');
                $scope.message = '';
            } else {
                // Nếu không có token hoặc dữ liệu cần thiết, báo lỗi
                $scope.message = {error: "Invalid response from server"};
            }
        }).catch(function(error) {
            $scope.message = {error: error.data.message};
            console.log(error)
        });
    }

    $scope.logout = function() {
        AuthService.logout($scope.user).then(function(response) {
            if (response && response.data) {
                $scope.user = {};
                // Xóa dữ liệu khỏi localStorage
                localStorage.removeItem('user');
                localStorage.removeItem('isLogged');
                localStorage.removeItem('accessToken');
                $scope.isLogin = false;
                $scope.mfa = '';
                console.log('Đã đăng xuất thành công');
            }
        }).catch(function(error) {
            console.error('Lỗi khi đăng xuất: ', error);
            $scope.message = {error: error.data.message || 'Đăng xuất thất bại'};
        });
    };
});

angular.module('myApp')
  .factory('AuthInterceptor', function($q, $window, $injector) {
    return {
      // Intercept request and add token
      request: function(config) {
        const token = $window.localStorage.getItem('accessToken');
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      
      // Handle errors in response (optional)
      responseError: function(response) {
        const AuthService = $injector.get('AuthService');
        const deferred = $q.defer();

        // Xử lý lỗi phản hồi, kiểm tra mã lỗi
        if (response.status === 403) {
          const errorMessage = response.data?.message || '';

          // Kiểm tra nếu lỗi là do hết hạn token
          if (errorMessage.includes('not authenticated') || errorMessage.includes('Token is not valid')) {
            
            AuthService.refresh({}).then(function(newToken) {
              $window.localStorage.setItem('accessToken', newToken.data.accessToken);
              response.config.headers.Authorization = `Bearer ${newToken.data.accessToken}`;
              const $http = $injector.get('$http');
              return $http(response.config); // Thực hiện lại yêu cầu
            }).then(function(res) {
              deferred.resolve(res);
            }).catch(function(error) {
              console.error('Không thể làm mới token - redirecting to login', error);
              deferred.reject(error);
            });

            return deferred.promise;
          } else {
            // Nếu không phải lỗi token hết hạn (vd: sai mật khẩu), không làm mới token
            console.error('Lỗi xác thực: ' + errorMessage);
          }
        }

        return $q.reject(response); // Trả về promise bị từ chối
      }
    };
  });

angular.module('myApp')  
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('AuthInterceptor');
  });
