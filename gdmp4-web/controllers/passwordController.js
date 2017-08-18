(function () {
    'use strict';
    var app = angular.module('MedApp')
    app.controller('PasswordController', PasswordController);
    PasswordController.$inject = ['$scope', '$location', '$stateParams', 'RoleDetails', 'ERROR_MSGS'];
    function PasswordController($scope, $location, $stateParams, RoleDetails, ERROR_MSGS) {
        $scope.captcha = {};
        $scope.getCaptcha = function () {
            $scope.showLoader = true;
            RoleDetails.getData('captcha').then(function (response) {
                if (response.status >= 200 && response.status < 300) {
                    $scope.captcha = response.data;
                    $scope.showLoader = false;
                }
                else {
                    updatePostError(response);
                }
            }, function (response) {
                updatePostError(response);
            });
        };

        $scope.getCaptcha();

        function updatePostError(response) {
            $scope.saveSuccess = false;
            $scope.alertType = {
                show: true,
                class: 'danger',
                msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR
            };
        }

        $scope.resetPassword = function() {
            // if($scope.email) $scope.email = $scope.email.toLowerCase();
            var data = {
                email: $scope.email,
                captchaText: $scope.captcha.text,
                captchaUuid: $scope.captcha.uuid
            };

            $scope.showLoader = true;
            RoleDetails.postData('resetpassword', data, function (response) {
                if (response.status >= 200 && response.status < 300){
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        msg: (response.data && response.data.msg) ? response.data.msg : 'A password reset mail has been sent.'
                    };
                    $scope.saveSuccess = true;
                } else {
                    updatePostError(response);
                }
            }, function (response) {
                updatePostError(response);
            });
        };

        $scope.setNewPassword = function() {
             $scope.showLoader = true;
             if ($scope.newPassword != $scope.confirmPassword) { 
                 $scope.saveSuccess = false;
                    $scope.alertType = {
                        show: true,
                        class: 'danger',
                        msg: "Confirm Password not correct"
                    };
                return;
            }

            var token = $stateParams.token;

            var data = {
                id: token,
                newPassword: $scope.newPassword,
                token: token
            };

           
            RoleDetails.putData('resetpassword', data, function (response) {
                if (response.status >= 200 && response.status < 300){
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                    };
                    $scope.saveSuccess = true;
                } else {
                    updatePostError(response);
                }
            }, function (response) {
                updatePostError(response);
            });
        };
        
        $scope.$watch('confirmPassword', function(){
            $scope.verified = ($scope.confirmPassword === $scope.newPassword) ? true : false;
            console.log($scope.verified)
        })

        $scope.changePassword = function() {           
            if ($scope.newPassword != $scope.confirmPassword) {
                $scope.confirmed = false;           
                return;
            } else {
                $scope.confirmed = true;
            }

            var data = {
                oldPassword: $scope.oldPassword,
                newPassword: $scope.newPassword
            };

            $scope.showLoader = true;
            RoleDetails.postData('changepassword', data, function (response) {
                if (response.status >= 200 && response.status < 300){
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                    };
                    $scope.saveSuccess = true;
                } else {
                    updatePostError(response);
                }
            }, function (response) {
                updatePostError(response);
            });
        };

        $scope.cancel = function () {
            if ($scope.$dismiss) {
                $scope.$dismiss();
            }
            else {
                $location.path('/login');
            }
        };

        $scope.closeUpdateLoader = function () {
            if ($scope.saveSuccess){
                $scope.cancel();
                return;
            }
            $scope.alertType = {show: false};
            $scope.showLoader = false;
        }
    };
})()
