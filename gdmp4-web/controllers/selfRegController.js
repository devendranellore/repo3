(function () {
    'use strict';
    var app = angular.module('MedApp')
    app.controller('SelfRegistrationController', SelfRegistrationController);
    SelfRegistrationController.$inject = ['$scope', '$http', 'ERROR_MSGS', 'RoleDetails'];
    function SelfRegistrationController($scope, $http, ERROR_MSGS, RoleDetails) {
        $scope.roleData = {
            isMedtronicEmployee: true,
            roles: {},
            trainingRecords: {},
            trainingMaterial: {}
        };
        $scope.search = {};
        $scope.result = {};
        $scope.showLoader = true;
        $scope.visibility = {};
        $scope.step = 1;

        $scope.formats = 'dd-MMMM-yyyy';
        $scope.opened = [];
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(1800, 1, 1),
            startingDay: 1
        };
        $scope.toggleRHeader = function () {
            $scope.reportCategories = !$scope.reportCategories;
        }
        $scope.open = function($event, index){
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened[index] = true;
        }

        var getMeta = RoleDetails.metaData(undefined, 'selfregistration', undefined);
        getMeta.then(function (response) {
            if (!angular.isObject(response.data) || !Object.keys(response.data).length) {
                $log.debug("Error in MetaData(No Data)");
                $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                return;
            }
            $scope.metaData = response.data;
            $scope.metaData.countryList = $scope.metaData.country;
            $scope.showLoader = false;
            $scope.modalError = null;
        }, function (error) {
            $scope.showLoader = false;
            $scope.modalError = ERROR_MSGS.LOAD_ERROR;
        });

        $scope.showList = function (dropList) {
            var tmpVisibility = ($scope.visibility[dropList]) ? !$scope.visibility[dropList] : true;
            $scope.visibility = {};
            $scope.visibility[dropList] = ($scope.readOnlyFlag) ? false : tmpVisibility;
        };

        $scope.updateType = function (key, displayObj) { //valueId is the reference in BE
            $scope.roleData[key + 'Name'] = displayObj.displayName;
            $scope.roleData[key + 'Id'] = displayObj.value;
            $scope.visibility = {};
        };

        $scope.$watch('roleData.roles', function(){
            if($scope.roleData.roles) var cot = Object.keys($scope.roleData.roles)[0];
            if(cot) {
                $scope.mainCot = $scope.metaData.roles[cot].cot;
                $scope.formCotValid = true;
            }else{
                delete $scope.mainCot;
                $scope.formCotValid = false;
            }
        }, true);

        $scope.$watch('roleData.countryName', function(val){
            if($scope.metaData){
                if(val){
                    $scope.metaData.countryList = [];
                    $scope.metaData.country.forEach(function(country){
                        if(country.displayName.toLowerCase().slice(0, val.length) === val.toLowerCase()) {
                            $scope.metaData.countryList.push(country);
                        }
                    })
                }else{
                    $scope.metaData.countryList = $scope.metaData.country.slice();
                }
            }
        });

        $scope.search = function (type, keyword) {
            if ((!keyword || keyword.length < 3) && (keyword !== '*'))
                return;
            var data;
            if ($scope.roleData.isMedtronicEmployee && $scope.mainCot){
                data = RoleDetails.getData(type, $scope.mainCot, 5, 0, {'managerName':keyword});
            } else if (!$scope.roleData.isMedtronicEmployee){
                data = RoleDetails.getData(type+'search', $scope.mainCot, 5, 0, {'customerName':keyword});
            } else {
                return
            }
            data.then(function (response) {
                if (response.status === 200) {
                    $scope.result[type] = (response.data) ? response.data : [];
                    $scope.visibility = {};
                    $scope.visibility['search_' + type] = true;
                }
            });
        };

        $scope.reset = function () {
            $scope.roleData = {isMedtronicEmployee: true};
            $scope.trainingDates = {};
            angular.element(training_date).val('');
        };

        $scope.addCustomer = function (cust) {
            if (!$scope.roleData.customers) {
                $scope.roleData.customers = [];
            }
            var exists = false;
            $scope.roleData.customers.forEach(function (customer) {
                if (customer.name == cust.name) {
                    exists = true;
                }
            });
            if (!exists) { // Prevent duplicated sku codes.
                $scope.roleData.customers.push(cust);
            }
            $scope.search.customer = '';
            $scope.showList('hide');
        };

        $scope.deleteCustomer = function (cust) {
            var newCollection = [];
            if ($scope.roleData.customers) {
                $scope.roleData.customers.forEach(function (customer) {
                    if (customer != cust) {
                        newCollection.push(customer);
                    }
                });
            }
            $scope.roleData.customers = newCollection;
        };

        $scope.deleteRole = function (cotName) {
            if (!$scope.roleData.roles) {
                $scope.roleData.roles = {};
            }
            delete $scope.roleData.roles[cotName];
            if ($scope.metaData.roles[cotName].deviceTypes) {
                $scope.metaData.roles[cotName].deviceTypes.forEach(function (deviceType) {
                    delete $scope.roleData.trainingRecords[deviceType.name];
                });
            }
        };

        $scope.toggleTrainingRecord = function (cotName, deviceType) {
            if (!$scope.roleData.trainingRecords) {
                $scope.roleData.trainingRecords = {};
            }
            var record = $scope.roleData.trainingRecords[deviceType.name];

            if (record) {
                delete $scope.roleData.trainingRecords[deviceType.name];
            } else {
                $scope.roleData.trainingRecords[deviceType.name] = {
                    deviceTypeId: deviceType.id,
                    cotName: cotName
                };

                if (deviceType.trainerSet) {
                    deviceType.trainerSet.forEach(function (trainer) {
                        if (trainer.isDefault) {
                            $scope.setTrainer(deviceType, trainer);
                        }
                    });
                }
            }
        };

        $scope.setTrainer = function (deviceType, trainer) {
            if (!$scope.roleData.trainingRecords || !$scope.roleData.trainingRecords[deviceType.name]) {
                return;
            }
            $scope.roleData.trainingRecords[deviceType.name].trainerUuid = trainer.uuid;
            $scope.roleData.trainingRecords[deviceType.name].trainerName = trainer.mail;
        };

        $scope.setTrainingDate = function(deviceType, date) {
            if (!$scope.roleData.trainingRecords || !$scope.roleData.trainingRecords[deviceType.name]) {
                return;
            }
            $scope.roleData.trainingRecords[deviceType.name].trainingDate = date;
        };

        $scope.changeMedtronicEmployee = function(){
            $scope.roleData.isMedtronicEmployee = !$scope.roleData.isMedtronicEmployee;
            $scope.roleData.roles = {};
            angular.element(training_date).val('');
        }

        $scope.$watch('roleData', function(){
            if($scope.roleData){
                if($scope.roleData.isMedtronicEmployee === true) $scope.formValid = true;
                else if(!$scope.roleData.customers){
                    $scope.formValid = false;
                } else if ($scope.roleData.customers.length === 0) {
                    $scope.formValid = false;
                } else {
                    $scope.formValid = true
                }
            }
        }, true);

        $scope.save = function () {
            // if($scope.roleData.mail) $scope.roleData.mail = $scope.roleData.mail.toLowerCase();
            // if($scope.roleData.confirmMail) $scope.roleData.confirmMail = $scope.roleData.confirmMail.toLowerCase();
            $scope.alertType = {};
            $scope.showLoader = true;

            if (!validate())
                return;

            RoleDetails.postData('selfregistration', $scope.roleData, function (response) {
                if (response.status >= 200 && response.status < 300) {
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                    };
                    $scope.saveSuccess = true;
                    $scope.showLoader = false;
                    $scope.step = 3;
                } else {
                    updatePostError(response);
                }
            }, function (response) {
                updatePostError(response);
            })
        };

        $scope.getCaptcha = function () {
            $scope.showLoader = true;
            RoleDetails.getData('captcha')
            .then(function (response) {
                if (response.status >= 200 && response.status < 300) {
                    $scope.captcha = response.data;
                    $scope.showLoader = false;
                } else {
                    updatePostError(response);
                }
            }, function (response) {
                updatePostError(response);
            });
        };
        $scope.getCaptcha();

        $scope.verifyCaptcha = function () {
            $scope.showLoader = true;
            RoleDetails.postData('captcha', $scope.captcha, function (response) {
                if (response.status >= 200 && response.status < 300) {
                    if (response.data.correct) {
                        $scope.step = 2;
                        $scope.showLoader = false;
                    }
                    $scope.alertType = {
                        show: true,
                        class: 'danger',
                        msg: 'Invalid security code.'
                    };
                } else {
                    updatePostError(response);
                }
            }, function (response) {
                updatePostError(response);
            });
        }

        $scope.closeUpdateLoader = function () {
            if ($scope.saveSuccess) {
                $scope.step = 3;
                return;
            }
            $scope.alertType = {show: false};
            $scope.showLoader = false;
        };

        function updatePostError(response) {
            $scope.saveSuccess = false;
            $scope.alertType = {
                show: true,
                class: 'danger',
                msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR
            };
        }

        function validate() {
            if ($scope.roleData.mail != $scope.roleData.confirmMail) {
                updatePostError({data: {msg: 'Confirm Email does not match the Email.'}});
                return false;
            }

            var selectedValidCountry = false;
            if($scope.roleData.countryName != null){
                angular.forEach($scope.metaData.country, function(value, key){
                    if(value.displayName.toLowerCase() === $scope.roleData.countryName.toLowerCase()){
                        $scope.roleData.countryId = value.value;
                        return selectedValidCountry = true;
                    }
                })
            }
            if(!selectedValidCountry) {
                updatePostError({data: {msg: 'You must select a valid country before you register.'}});
                return false;
            }

            // var deviceCount = Object.keys($scope.roleData.trainingRecords).length;
            // if (deviceCount === 0) {
            //     updatePostError({data: {msg: 'You must select at least one or more device before register.'}});
            //     return false;
            // }

            var deviceTypeNames = Object.keys($scope.roleData.trainingRecords);

            var trainingRecordsValid = deviceTypeNames.reduce(function (lastValid, deviceTypeName) {
                if (!lastValid)
                    return false;

                var record = $scope.roleData.trainingRecords[deviceTypeName];
                if (!record.cotName)
                    return true; // Skip the records without cot name.
                $scope.metaData.roles[record.cotName].limitedAccessRoles.forEach(function(role){
                    if ($scope.roleData.roles[record.cotName] === role) {
                        $scope.skipTraining = true;
                    }
                })
                if($scope.skipTraining) return true;
                $scope.skipTraining = false;
                var deviceCount = Object.keys($scope.roleData.trainingRecords[deviceTypeName]).length;
                if (deviceCount === 0) {
                    updatePostError({data: {msg: 'You must select at least one or more device before register.'}});
                    return false;
                }
                var materialTraining = $scope.metaData.roles[record.cotName].materialTraining;

                if (materialTraining && !$scope.roleData.trainingMaterial[record.cotName]) {
                    updatePostError({data: {msg: 'Please acknowledge training for selected devices.'}});
                    return false;
                }

                if (!materialTraining && !(record.trainerUuid && record.trainerName && record.trainingDate)) {
                    updatePostError({data: {msg: 'One or more required training records are not specified.'}});
                    return false;
                }

                if(!$scope.roleData.roles[record.cotName]){
                    updatePostError({data: {msg: 'One or more role are not specified.'}});
                    return false;
                }

                return true;
            }, true);

            if (!trainingRecordsValid)
                return false;

            var registeredCots = Object.keys($scope.roleData.roles);

            var rolesValid = registeredCots.reduce(function (lastValid, cotName) {
                if (!lastValid)
                    return false;

                var deviceTypes = $scope.metaData.roles[cotName].deviceTypes;
                var oneOrMoreDeviceSelected = deviceTypes.reduce(function (lastSelected, deviceType) {
                    if (lastSelected)
                        return true;
                    return !!$scope.roleData.trainingRecords[deviceType.name];
                }, false);

                if (!oneOrMoreDeviceSelected) {
                    updatePostError({data: {msg: 'You must select at least one or more device before register.'}});
                    return false;
                }

                return true;
            }, true);
            
            if (!rolesValid)
                return false;
            return true;
        }
    }
})();