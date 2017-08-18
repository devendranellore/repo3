(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('facilityController', function ($scope, $log, RoleDetails, ERROR_MSGS, $uibModalInstance, $controller, $sce) {       
        angular.extend(this, $controller('hardwareController', {$scope: $scope, $uibModalInstance: $uibModalInstance, $sce}));
        
        $scope.readOnly = function (flag) {
            $scope.readOnlyFlag = flag;
            $scope.editable = false;
            if(!$scope.readOnlyFlag) $scope.editable = true;
        };
        $scope.help = $sce.trustAsHtml('Click &lsquo;Edit&rsquo; to change an existing item.<br/><br/>\
                        Fill in fields, upload a file (when applicable) and click Save to create/update an item.<br/><br/>\
                        All fields with asterisk (*) mark are required.<br/><br/>\
                        Check for fields in <span style="color: red">red border</span> if Save button is unavailable');
        $scope.roleData.cotId = $scope.$parent.$parent.$parent.cotId;

        $scope.$watch('roleData.country', function(newValue, oldValue){
            if($scope.metaData){
                if(newValue){
                    $scope.metaData.countryList = [];
                    $scope.metaData.country.forEach(function(country){
                        if(country.displayName.toLowerCase().startsWith(newValue.toLowerCase())) {
                            $scope.metaData.countryList.push(country);
                        }
                    })
                }else{
                    $scope.metaData.countryList = $scope.metaData.country.slice();
                }
            }
            $scope.selectedValidCountry = false;
            if($scope.metaData && $scope.roleData){
                $scope.selectedValidCountry = false;
                if($scope.roleData.country){
                    angular.forEach($scope.metaData.country, function(value, key){
                        if(value.displayName.toLowerCase() === $scope.roleData.country.toLowerCase()){
                            $scope.roleData.country = value.displayName
                            $scope.roleData.countryId = value.value;
                            $scope.selectedValidCountry = true;
                        }
                    })
                }
            }
            if(!newValue && $scope.roleData) {
                delete $scope.roleData.country;
                delete $scope.roleData.countryId;
                $scope.selectedValidCountry = false;
            }
        });

        $scope.clear = function(filterName){
            delete $scope.roleData[filterName];
            delete $scope.roleData[filterName+'Id'];
            $scope.visibility[filterName]=false;
            $scope.selectedValidCountry = true;
        }

        $scope.customAction = function(action) {
            console.log($scope.role)
            $scope.showLoader = true;
            if ($scope.tab === 'approvingManager') {
                $scope.roleData.cotId = $scope.cotId;
                var role = 'mdtapprovemgr';
            }
            else var role = $scope.role;
            RoleDetails.customAction(role, $scope.roleData, action, function (response) {
                if (response.status >= 200 && response.status < 300) {
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                    };
                    $scope.saveSuccess = true;
                    if($scope.tab === 'approvingManager') $scope.getApprovingManagerData(1);
                    else $scope.getData(1);
                } else {
                    updatePostError(response);
                }
            }, function (response) {
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
    });
})();