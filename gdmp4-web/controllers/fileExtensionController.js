(function() {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('FileExtensionController', function($scope, RoleDetails, ERROR_MSGS, MED_API) {
        $scope.showLoader = false;
        $scope.alertType = { show: false };
        $scope.formData = {};
        var cot = $scope.$parent.$parent.$parent.cotId;
        $scope.getFileExtension = function() {
            RoleDetails.getData('fileextensions', cot)
            .then(function(response) {
                if (response.status >= 200 && response.status < 300) {
                    $scope.formData.file_ext = response.data.file_ext;
                    $scope.showLoader = false;
                    $scope.modalError = null;
                }
                else {
                    updatePostError(response);
                }
            }, function(response) {
                updatePostError(response);
            });
        };
        $scope.getFileExtension();

        function updatePostError(response) {
            $scope.saveSuccess = false;
            $scope.alertType = {
                show: true,
                class: 'danger',
                msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR
            };
        }
        function readOnly(flag) {
            if (flag === undefined) flag = true;
            $scope.readOnlyFlag = flag;
        }
        $scope.readOnly = function (flag) {
            readOnly(flag);
        };

        $scope.save = function() {
            $scope.showLoader = true;
            RoleDetails.putExtensionData('fileextensions', cot, $scope.formData, function(response) {
                if (response.status === 200) {
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                    };
                    $scope.saveSuccess = true;
                } else {
                    updatePostError(response);
                }
            }, function(response) {
                updatePostError(response);
            });
            function updatePostError(response) {
                $scope.saveSuccess = false;
                $scope.alertType = {
                    show: true,
                    class: 'danger',
                    msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR
                };
            }
        };
        $scope.closeUpdateLoader = function () {
            if ($scope.saveSuccess){
                $scope.cancel();
                return;
            }
            $scope.alertType = {show: false};
            $scope.showLoader = false;
        };
        $scope.cancel = function () {
            $scope.roleData = null;
            $scope.getFileExtension();
            readOnly();
        };

        readOnly(true);
    });
})();