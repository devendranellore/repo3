(function () {
  'use strict';
  var app = angular.module('MedApp');
  app.controller('userController', userController);
  userController.$inject = ['$scope','$rootScope', '$state', 'RoleDetails', 'ERROR_MSGS', '$uibModalInstance', '$sce'];
  function userController ($scope, $rootScope, $state, RoleDetails, ERROR_MSGS, $uibModalInstance, $sce) {
    $scope.visibility = {};
    $scope.showLoader = true;
    $scope.trainerPrivilege = {};
    $scope.trainingRecord = {};
    $scope.search = {};
    $scope.result = {};
    $scope.help = $sce.trustAsHtml('Firstly select type of user that cannot be changed after saving.<br\><br\>Fill in all required fields with asterisk (*) mark.<br\><br\>At least one role must be selected.<br\><br\>Training Privilege and Training Record is optional.<br\><br\>To add a Training Privilege or Training Record, make sure to click \'+\' button after making selections for a new record before clicking Save. Otherwise, new records are not added.<br\><br\>To remove a Training Privilege or Training Record, click the Trashcan button next to each record.<br\><br\>Click Help again to hide this message');
    var today = new Date();
    $scope.searchedCustomers = [];
    $scope.authorizedEdit = true;
    $scope.deviceAccessMapping = {
      gdmpSoftwareInstallable: "Entitled to Install SW",
      gdmpLatestVersionSoftwareAccessible: "Install Latest Version SW Only",
      gdmpLimitedReleaseSoftwareAccessible: "Access Limited Release SW",
      gdmpFeatureLicenseInstallable: "Entitled to Install Feature License",
      gdmpLimitedReleaseFeatureAccessible: "Access Limited Release Feature License"
    };
    $scope.formats = 'dd-MMMM-yyyy';
    $scope.popup = { opened: false };
    $scope.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(),
      minDate: new Date(1800, 1, 1),
      startingDay: 1
    };

    $scope.open = function() {
      $scope.popup.opened = true;
    };

    function loadLists() {
      var getMeta = RoleDetails.metaData($scope.cotId, $scope.role, $scope.roleData.id);
      getMeta.then(function (response) {
        if (!angular.isObject(response.data) || !Object.keys(response.data).length) {
          $scope.modalError = ERROR_MSGS.LOAD_ERROR;
          return;
        }
        $scope.metaData = response.data;
        $scope.metaData.countryList = $scope.metaData.country;
        $scope.metaData.languageList = $scope.metaData.language;
        $scope.showLoader = false;
        $scope.modalError = null;
      }, function (error) {
        if(error.status === 401) updatePostError();
        else{
          $scope.showLoader = false;
          $scope.modalError = ERROR_MSGS.LOAD_ERROR;
        }
      });
      function updatePostError() {
        $scope.alertType = {
          show: true,
          class: 'danger',
          msg: 'You are no longer allowed to perform this action, and you will be logged out of the system.',
          auth: true
        };
      }
    }

    function readOnly(flag) {
       $scope.hideSave = false;
    if (flag === undefined) {
      flag = true;
      $scope.hideSave = true;
    }
    if($rootScope.globalUsed.editPermission == undefined || $rootScope.globalUsed.editPermission) {
        $scope.authorizedEdit = true;
      }
    else if(!$rootScope.globalUsed.editPermission){
        $scope.authorizedEdit = false;
      }
      if(flag == false){
        if($scope.authorizedEdit){
          $scope.hideSave = true;
        }
      }
      $scope.readOnlyFlag = flag;
    }

    $scope.showList = function (dropList) {
      var tmpVisibility = ($scope.visibility[dropList]) ? !$scope.visibility[dropList] : true;
      $scope.visibility = {};
      $scope.visibility[dropList] = ($scope.readOnlyFlag) ? false : tmpVisibility;
    };
    $scope.showTypeOptions = function () {
      $scope.typeClick = true;
    };
    $scope.updateType = function (key, displayObj) { //valueId is the reference in BE
      $scope.roleData[key + 'Name'] = displayObj.displayName;
      $scope.roleData[key + 'Id'] = displayObj.value;
      $scope.visibility = {};
    };

    $scope.changeMedtronicEmployee = function(){
      $scope.roleData.isMedtronicEmployee = !$scope.roleData.isMedtronicEmployee;
      $scope.roleData.roles = {};
    }

    $scope.$watch('roleData', function(){
      if($scope.roleData){
        if($scope.roleData.roles){
          $scope.cotSelected = Object.getOwnPropertyNames($scope.roleData.roles).length ? true : false;
        }else{
          $scope.cotSelected = false;
        }

        if($scope.roleData.isMedtronicEmployee === true) $scope.formValid = true;
        else if(!$scope.roleData.customers){
          $scope.formValid = false;
        } else if ($scope.roleData.customers.length === 0) {
          $scope.formValid = false;
        } else {
          $scope.formValid = true;
        }
      }
    }, true);

    $scope.save = function () {
      $scope.alertType = {show: false};
      $scope.showLoader = true;
      if (!validate())
        return;
      $scope.roleData.cot = $scope.cotId;
      // if($scope.roleData.mail) $scope.roleData.mail = $scope.roleData.mail.toLowerCase();
      $scope.trainerPrivilege = {};
      $scope.trainingRecord = {};
      var method;
      method = ($scope.createRecord) ? 'postData' : 'putData';

      RoleDetails[method]($scope.role, $scope.roleData, function (response) {
        if (response.status >= 200 && response.status < 300) {
          $scope.alertType = {
            show: true,
            class: 'success',
            msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
          };
          $scope.saveSuccess = true;
          $scope.getUserData(1);
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

      function validate() {
        if (!$scope.roleData || !$scope.roleData.roles) return;
        var defaultExists = false;
        angular.forEach($scope.roleData.roles, function(roleData, cotName) {
          if (roleData.roleName && roleData.isDefault) {
            defaultExists = true;
          }
        });
        if (!defaultExists) {
          updatePostError({ data: { msg: 'Must select at least one role as default.' } });
          return false;
        }
        return true;
      }
    };
    $scope.userAction = function(action) {
      $scope.showLoader = true;
      $scope.trainerPrivilege = {};
      $scope.trainingRecord = {};
      RoleDetails.customAction($scope.role, {'id':$scope.roleData.uuid, 'cotId': $scope.cotId}, action, function (response) {
        if (response.status >= 200 && response.status < 300) {
          $scope.alertType = {
            show: true,
            class: 'success',
            msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
          };
          $scope.saveSuccess = true;
          $scope.getUserData(1);
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
      $scope.selectedValidCountry = true;
      if($scope.metaData && $scope.roleData){
        $scope.selectedValidCountry = false;
        if($scope.roleData.countryName){
          angular.forEach($scope.metaData.country, function(value, key){
            if(value.displayName.toLowerCase() === $scope.roleData.countryName.toLowerCase()){
              $scope.roleData.countryName = value.displayName;
              $scope.roleData.countryId = value.value;
              $scope.selectedValidCountry = true;
            }
          })
        }
      }
    });

    $scope.$watch('roleData.languageName', function(val){
      if($scope.metaData){
        if(val){
          $scope.metaData.languageList = [];
          $scope.metaData.language.forEach(function(language){
            if(language.displayName.toLowerCase().slice(0, val.length) === val.toLowerCase()) {
              $scope.metaData.languageList.push(language);
            }
          })
        }else{
          $scope.metaData.languageList = $scope.metaData.language.slice();
        }
      }
      $scope.selectedValidLanguage = true;
      if($scope.metaData && $scope.roleData){
        $scope.selectedValidLanguage = false;
        if($scope.roleData.languageName){
          angular.forEach($scope.metaData.language, function(value, key){
            if(value.displayName.toLowerCase() === $scope.roleData.languageName.toLowerCase()){
              $scope.roleData.languageName = value.displayName;
              $scope.roleData.languageId = value.value;
              $scope.selectedValidLanguage = true;
            }
          })
        }
      }
    });

    $scope.cancel = function () {
      $uibModalInstance.dismiss('cancel');
      $scope.roleData = null;
      readOnly();
    };
    $scope.readOnly = function (flag) {
      readOnly(flag);
    };

    $scope.closeUpdateLoader = function () {
      if ($scope.saveSuccess){
        $scope.cancel();
        return;
      }
      $scope.alertType = {show: false};
      $scope.showLoader = false;
    };

    $scope.generatePassword = function () {
      var password = '';
      var length = 12;
      var special = false;
      var randomNumber;
      var iteration = 0;
      while (iteration < length) {
        randomNumber = (Math.floor((Math.random() * 100)) % 94) + 33;
        if (!special) {
          if ((randomNumber >= 33) && (randomNumber <= 47)) { continue; }
          if ((randomNumber >= 58) && (randomNumber <= 64)) { continue; }
          if ((randomNumber >= 91) && (randomNumber <= 96)) { continue; }
          if ((randomNumber >= 123) && (randomNumber <= 126)) { continue; }
        }
        iteration++;
        password += String.fromCharCode(randomNumber);
      }
      $scope.roleData.password = password;
    };

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

    $scope.updateCotRole = function (cotName, roleName, roleData) {
      if (!$scope.roleData.roles) {
        $scope.roleData.roles = {};
      }

      if (!$scope.roleData.roles[cotName]) {
        $scope.roleData.roles[cotName] = {};
      }

      if (!roleName) { // Delete role data when user select no role.
        delete $scope.roleData.roles[cotName];
        return;
      }

      $scope.roleData.roles[cotName].roleName = roleName;

      var defaultExists = false;
      angular.forEach($scope.roleData.roles, function (roleData, roleName) {
        if (roleData.isDefault) {
          defaultExists = true;
        }
      });

      if (!defaultExists) {
        $scope.roleData.roles[cotName].isDefault = true;
      }
      $scope.roleData.roles[cotName].deviceAccess = {};

      if (roleData) {
        roleData.forEach(function (deviceAccess) {
          $scope.roleData.roles[cotName].deviceAccess[deviceAccess] = true;
        });
      }
    };

    $scope.selectDefaultCot = function (cotName) {
      if (!$scope.roleData.roles) {
        $scope.roleData.roles = {};
      }

      if (!$scope.roleData.roles[cotName]) {
        $scope.roleData.roles[cotName] = {};
      }

      angular.forEach($scope.roleData.roles, function (cotData, cot) {
        if (cot === cotName) {
          cotData.isDefault = !cotData.isDefault;
        } else {
          cotData.isDefault = false;
        }
      });
    };

    $scope.addTrainerPrivilege = function () {
      if ($scope.trainerPrivilege.cotName && $scope.trainerPrivilege.deviceType) {
        if (!$scope.roleData.trainerPrivileges) {
          $scope.roleData.trainerPrivileges = {};
        }

        var key = $scope.trainerPrivilege.deviceType.name;
        if (!$scope.roleData.trainerPrivileges[key]) {
          $scope.roleData.trainerPrivileges[key] = $scope.trainerPrivilege.cotName;
          $scope.trainerPrivilege = {};
        }
      }
    };

    $scope.removeTrainerPrivilege = function (deviceTypeName) {
      delete $scope.roleData.trainerPrivileges[deviceTypeName];
    };

    $scope.changeTrainingRecordDeviceType = function(trainingRecord, deviceType) {
      trainingRecord.deviceType = deviceType;
      trainingRecord.trainerList = deviceType.trainerSet;
      trainingRecord.trainer = undefined;

      if (deviceType.trainerSet) {
        deviceType.trainerSet.forEach(function (trainer) {
          if (trainer.isDefault) {
            trainingRecord.trainer = trainer;
          }
        });
      }
    };

    $scope.addTrainingRecord = function () {
      if($scope.trainingRecord.date > today){
        return;
      }
      if ($scope.trainingRecord.cotName
        && $scope.trainingRecord.deviceType
        && $scope.trainingRecord.trainer
        && $scope.trainingRecord.date
        && $scope.trainingRecord.certificated !== undefined) {

        if (!$scope.roleData.trainingRecords) {
          $scope.roleData.trainingRecords = {};
        }

        var key = $scope.trainingRecord.deviceType.name;
        if (!$scope.roleData.trainingRecords[key]) {
          $scope.roleData.trainingRecords[key] = {
            cotName: $scope.trainingRecord.cotName,
            deviceTypeId: $scope.trainingRecord.deviceType.id,
            trainerEmail: $scope.trainingRecord.trainer.mail,
            trainerUuid: $scope.trainingRecord.trainer.uuid,
            trainingDate: $scope.trainingRecord.date,
            certificated: $scope.trainingRecord.certificated
          }
          $scope.trainingRecord = {};
        }
      }
    };

    $scope.removeTrainingRecord = function (deviceTypeName) {
      delete $scope.roleData.trainingRecords[deviceTypeName];
    }

    loadLists(); //Fetch the data for populating the dropdowns
    if (!$scope.createRecord) {
      readOnly(); //load the edit screen with readOnly true
    } else {
      $scope.roleData.isMedtronicEmployee = true;
    }
  };
})();
