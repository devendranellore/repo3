(function () {
  'use strict';
  var app = angular.module('MedApp');
  app.controller('DefaultTrainerController', defaultTrainerController);
  defaultTrainerController.$inject = ['$scope', '$state', 'RoleDetails', 'ERROR_MSGS'];
  function defaultTrainerController ($scope, $state, RoleDetails, ERROR_MSGS) {
    $scope.visibility = {};
    $scope.showLoader = true;
    var cot = $scope.cotId;
    
    function loadLists() {
      var getRoleData = RoleDetails.getRoleData('defaulttrainers', cot);
      getRoleData.then(function (response) {
        if (!angular.isObject(response.data) || !Object.keys(response.data).length) {
          $scope.modalError = ERROR_MSGS.LOAD_ERROR;
          return;
        }
        $scope.roleData = response.data.data;
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

    $scope.save = function () {
      $scope.showLoader = true;
      var data = {};
      $scope.roleData.forEach(function(row) {
        data[row.deviceTypeId] = row;
      });

      RoleDetails.putDefaultTrainerData('defaulttrainers', cot, data, function (response) {
        if (response.status >= 200 && response.status < 300) {
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

      function updatePostError(response) {
        $scope.saveSuccess = false;
        var message = ERROR_MSGS.UPLOAD_ERROR;
        if(response.data && response.data.detail){
          if(response.data.detail.indexOf("no user from mail in ldap")!=-1){
            message = "Trainer ID must be a valid user in the system."
          }
          else
          message = reponse.data.msg;
        }
        $scope.alertType = {
          show: true,
          class: 'danger',
          msg: message
        };
      }
    };

    $scope.cancel = function () {
      $scope.roleData = null;
      loadLists();
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

    loadLists(); //Fetch the data for populating the dropdowns
    readOnly(); //load the edit screen with readOnly true

    $scope.$on('MED_COT_CHANGE', function (event, cotId) {
        cot = cotId;
        loadLists();
        readOnly();
    });
  };
})();