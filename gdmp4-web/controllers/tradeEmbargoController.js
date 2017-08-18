(function () {
  'use strict';
  var app = angular.module('MedApp');
  app.controller('TradeEmbargoController', tradeEmbargoController);
  tradeEmbargoController.$inject = ['$scope', '$state', '$q', 'RoleDetails', 'ERROR_MSGS'];
  function tradeEmbargoController ($scope, $state, $q, RoleDetails, ERROR_MSGS) {
    $scope.visibility = {};
    $scope.showLoader = true;
    var cot = $scope.$parent.$parent.$parent.cotId;
    function loadLists() {
      var getRoleData = RoleDetails.getRoleData('tradingembargo', cot);
      var getMetaData = RoleDetails.metaData(undefined, 'tradeembargo');

      $q.all([getRoleData, getMetaData]).then(function(responses) {
        var dataValid = [0,1].every(function(i) {
          return angular.isObject(responses[i].data) && Object.keys(responses[i].data).length;
        });

        if(!dataValid){
          $scope.modalError = ERROR_MSGS.LOAD_ERROR;
          return;
        }

        $scope.roleData = responses[0].data.embargoCountries;
        $scope.metaData = responses[1].data;
        $scope.metaData.countryList = $scope.metaData.country;

        $scope.showLoader = false;
        $scope.modalError = null;
        if (!$scope.$$phase) {
          $scope.$apply();
        }
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
      RoleDetails.putEmbargoRoleData('tradeembargo',cot ,$scope.roleData, function (response) {
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
        $scope.alertType = {
          show: true,
          class: 'danger',
          msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR
        };
      }
    };

    $scope.updateCountry = function(country) {
      $scope.selectedCountry = {}
      $scope.selectedCountry.displayName = country.displayName;
    };

    $scope.$watch('selectedCountry.displayName', function(val){
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
      if($scope.metaData && $scope.selectedCountry){
        $scope.selectedValidCountry = false;
        if($scope.selectedCountry.displayName){
          angular.forEach($scope.metaData.country, function(value, key){
            if(value.displayName.toLowerCase() === $scope.selectedCountry.displayName.toLowerCase()){
              $scope.selectedCountry.displayName = value.displayName;
              $scope.selectedCountry.code = value.value;
              $scope.selectedValidCountry = true;
            }
          })
        }
      }
    });

    $scope.addCountry = function(country) {
      if (!$scope.selectedValidCountry) {
        return;
      }
      if (!$scope.roleData) {
        $scope.roleData = [];
      }
      if ($scope.selectedCountry) {
        $scope.roleData.forEach(function(selectedCountry){
          if($scope.selectedCountry.code === selectedCountry.code){
            $scope.hasSelected = true;
          }
        })
        if(!$scope.hasSelected){
          $scope.roleData.push({
            code: $scope.selectedCountry.code,
            name: $scope.selectedCountry.displayName
          });
        }
        $scope.hasSelected = false;
        $scope.selectedCountry = null;
      }
    };

    $scope.deleteCountry = function(country) {
      var index = $scope.roleData.indexOf(country);
      if (index >=0) {
        $scope.roleData.splice(index, 1);
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
readOnly(true);
};
})();