(function () {
  'use strict';
  var app = angular.module('MedApp');
  app.controller('PendingRegistrationController', pendingRegController);
  pendingRegController.$inject = ['$scope', '$state', 'RoleDetails', 'ERROR_MSGS', '$uibModalInstance'];
  function pendingRegController ($scope, $state, RoleDetails, ERROR_MSGS, $uibModalInstance) {
    $scope.visibility = {};
    $scope.showLoader = true;
    $scope.search = {};
    $scope.result = {};
    $scope.formats = 'dd-MMMM-yyyy';
    $scope.opened = [];
    $scope.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(),
      minDate: new Date(1800, 1, 1),
      startingDay: 1
    };
    $scope.open = function($event, index){
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened[index] = true;
    }

    function loadLists() {
      var getMeta = RoleDetails.metaData($scope.cotId, 'pendingregistration', $scope.roleData.id);
      getMeta.then(function (response) {
        if (!angular.isObject(response.data) || !Object.keys(response.data).length) {
          $scope.modalError = ERROR_MSGS.LOAD_ERROR;
          return;
        }
        $scope.metaData = response.data;
        $scope.showLoader = false;
        $scope.modalError = null;
      }, function (error) {
        $scope.showLoader = false;
        $scope.modalError = ERROR_MSGS.LOAD_ERROR;
      });
    }

    function readOnly(flag) {
      if (flag === undefined) flag = true;
      $scope.readOnlyFlag = flag;
    }

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

    $scope.decide = function (action) {
      $scope.showLoader = true;
      RoleDetails.customAction('pendingregistration', {'id':$scope.roleData.id}, action, function (response) {
        if (response.status >= 200 && response.status < 300) {
          $scope.alertType = {
            show: true,
            class: 'success',
            msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
          };
          $scope.saveSuccess = true;
          $scope.getPendingRegData(1);
        } else {
          updatePostError(response);
        }
      }, function (response) {
        updatePostError(response);
      });
    };

    $scope.save = function () {
      $scope.showLoader = true;
      if(!validate()) return;
      RoleDetails.putData('pendingregistration', $scope.roleData, function (response) {
        if (response.status >= 200 && response.status < 300) {
          $scope.alertType = {
            show: true,
            class: 'success',
            msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
          };
          $scope.saveSuccess = true;
          $scope.getPendingRegData(1);
        } else {
          updatePostError(response);
        }
      }, function (response) {
        updatePostError(response);
      });
    };

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
      $scope.roleData = null;
      readOnly();
    };

    $scope.readOnly = function (flag) {
      readOnly(flag);
    };

    $scope.closeUpdateLoader = function () {
      if ($scope.saveSuccess)
      {
        $scope.cancel();
        return;
      }
      $scope.alertType = {show: false};
      $scope.showLoader = false;
    };

    // $scope.searchCustomer = function(nameOrAccNo) {
    //   if (!nameOrAccNo || nameOrAccNo.length < 3)
    //     return;
      
    //   var data = RoleDetails.getData('customer/' + nameOrAccNo, $scope.cotId, 5, 0);
    //   data.then(function (response) {
    //     if (response.status === 200)
    //     {
    //       $scope.searchedCustomers = (response.data) ? response.data : [];
    //       $scope.visibility = {};
    //       $scope.visibility['search_customer'] = true;
    //     }
    //   });
    // };

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

    $scope.addCustomer = function(cust) {
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

    $scope.deleteCustomer = function(cust) {
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
        $scope.metaData.roles[cotName].deviceTypes.forEach(function(deviceType) {
          delete $scope.roleData.trainingRecords[deviceType.name];
        });
      }
    };

    $scope.toggleTrainingRecord = function (deviceType) {
      if (!$scope.roleData.trainingRecords) {
        $scope.roleData.trainingRecords = {};
      }
      var record = $scope.roleData.trainingRecords[deviceType.name];

      if (record) {
        delete $scope.roleData.trainingRecords[deviceType.name];
      }
      else {
        $scope.roleData.trainingRecords[deviceType.name] = {
          deviceTypeId: deviceType.id
        };
        
        if (deviceType.trainerSet) {
          deviceType.trainerSet.forEach(function (trainer) {
            if (trainer.isDefault) {
              $scope.setTrainer(deviceType, trainer);
            }
          });
        }
      }
    }

    $scope.setTrainer = function (deviceType, trainer) {
      if (!$scope.roleData.trainingRecords || !$scope.roleData.trainingRecords[deviceType.name]) {
        return;
      }

      $scope.roleData.trainingRecords[deviceType.name].trainerUuid = trainer.uuid;
      $scope.roleData.trainingRecords[deviceType.name].trainerName = trainer.mail;
    }

    if ($scope.roleData) {
      angular.forEach($scope.roleData.trainingRecords, function(trainingRecord) {
        if(trainingRecord.trainingDate) trainingRecord.trainingDate = new Date(trainingRecord.trainingDate);
      });
    }

    function updatePostError(response) {
      $scope.saveSuccess = false;
      $scope.alertType = {
        show: true,
        class: 'danger',
        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR
      };
    }

    function validate() {
      var deviceCount = Object.keys($scope.roleData.trainingRecords).length;
      if (deviceCount === 0) {
        updatePostError({data: {msg: 'You must select at least one or more device before register.'}});
        return false;
      }

      var deviceTypeNames = Object.keys($scope.roleData.trainingRecords);
      var trainingRecordsValid = deviceTypeNames.reduce(function(lastValid, deviceTypeName) {
        if(!lastValid) return false;

        var record = $scope.roleData.trainingRecords[deviceTypeName];
        var cotName = findCotName(deviceTypeName);
        var materialTraining = $scope.metaData.roles[cotName].materialTraining;

        if (materialTraining && !$scope.roleData.trainingMaterial[cotName]) {
          updatePostError({data: {msg: 'Please acknowledge training for selected devices.'}});
          return false;
        }

        if(!$scope.roleData.roles[cotName] || (!materialTraining && !(record.trainerUuid && record.trainerName && record.trainingDate))) {
          updatePostError({data: {msg: 'One or more required training records are not specified.'}});
          return false;
        }

        return true;
      }, true);
      
      if(!trainingRecordsValid) return false;

      var registeredCots = Object.keys($scope.roleData.roles);
      var rolesValid = registeredCots.reduce(function(lastValid, cotName) {
        if(!lastValid) return false;

        var deviceTypes = $scope.metaData.roles[cotName].deviceTypes;
        var oneOrMoreDeviceSelected = deviceTypes.reduce(function(lastSelected, deviceType) {
          if(lastSelected) return true;
          return !!$scope.roleData.trainingRecords[deviceType.name];
        }, false);

        if(!oneOrMoreDeviceSelected) {
          updatePostError({data: {msg: 'You must select at least one or more device before register.'}});
          return false;
        }

        return true;
      }, true);
      if(!rolesValid) return false;

      return true;
    }

    function findCotName(deviceTypeName) {
      var cotNameFound;
      angular.forEach($scope.metaData.roles, function(cotData, cotName) {
        cotData.deviceTypes.forEach(function(deviceType) {
          if(deviceType.name == deviceTypeName) {
            cotNameFound = cotName;
          }
        })
      });
      return cotNameFound;
    }

    $scope.roleData.trainingMaterial = {};
    angular.forEach($scope.roleData.roles, function(roleName, cotName) {
      $scope.roleData.trainingMaterial[cotName] = !!roleName;
    });

    loadLists(); //Fetch the data for populating the dropdowns
    readOnly(); //load the edit screen with readOnly true
  };
})();