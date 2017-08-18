var app = angular.module('MedApp');
app.controller('templatesEditController', function ($scope, $log, $controller, RoleDetails, ERROR_MSGS, MED_API, $uibModalInstance) {
    angular.extend(this, $controller('generalEditController', {$scope: $scope, $uibModalInstance: $uibModalInstance}));
    var tmpRoleData = {};
    if ($scope.createAlertRecord){
        tmpRoleData = {};
        $scope.alertData = {};
        $scope.readOnlyAlertFlag = false;
    } else {
        tmpRoleData = $scope.subData.data[$scope.rowKey];
        $scope.alertData = angular.merge({}, tmpRoleData.basic, tmpRoleData.detail, tmpRoleData.additional);
        $scope.readOnlyAlertFlag = true;
    }

    $scope.addPlaceHolder = function (placeHolder) {
        $scope.alertData.filePath = ($scope.alertData.filePath) ? $scope.alertData.filePath + placeHolder : placeHolder;
    }
    $scope.readOnlyPermission = $scope.roleDetails.readOnly;
    $scope.alertMeta = $scope.subData.meta;
    $scope.showLoader = false;
    $scope.visibility = {};
    $scope.checkEditable = function (element) {
        if ($scope.createAlertRecord)
            return (!$scope.readOnlyAlertFlag && $scope.visibility[element]);
        return false;
    }
});