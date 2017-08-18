var app = angular.module('MedApp');
app.controller('generalEditController', function ($scope, $rootScope, $log, $controller, RoleDetails, ERROR_MSGS, MED_API, $uibModalInstance, $uibModal) {
    var tmpRoleData = {};
    if ($scope.createAlertRecord){
        tmpRoleData = {};
        $scope.alertData = {};
        $scope.alertData.active = true;
        $scope.readOnlyAlertFlag = false;
    } else {
        tmpRoleData = $scope.subData.data[$scope.rowKey];
        $scope.alertData = angular.merge({}, tmpRoleData.basic, tmpRoleData.detail, tmpRoleData.additional);
        // $scope.recipientAsDeviceType = $scope.alertData.recipientAsDeviceType;
        $scope.alertData.scheduleFrom = new Date($scope.alertData.scheduleFrom);
        $scope.alertData.scheduleTo = new Date($scope.alertData.scheduleTo);
        $scope.readOnlyAlertFlag = true;
    }
    $scope.addScheduleVisiblity = false;
    $scope.newSchedule = {"sDate": new Date()};
    $scope.readOnlyPermission = $scope.roleDetails.readOnly;
    $scope.alertMeta = $scope.subData.meta;
    $scope.alertMeta.alertEvent = null;
    $scope.showLoader = false;
    $scope.visibility = {};
    var today = new Date();

    $scope.endDateBeforeRender = endDateBeforeRender
    $scope.endDateOnSetTime = endDateOnSetTime
    $scope.startDateBeforeRender = startDateBeforeRender
    $scope.startDateOnSetTime = startDateOnSetTime

    function startDateOnSetTime () {
      $scope.$broadcast('start-date-changed');
    }

    function endDateOnSetTime () {
      $scope.$broadcast('end-date-changed');
    }

    function startDateBeforeRender ($dates) {
        if($scope.alertData){
            if ($scope.alertData.scheduleTo) {
                var activeDate = moment($scope.alertData.scheduleTo);
                $dates.filter(function (date) {
                    return date.localDateValue() >= activeDate.valueOf()
                }).forEach(function (date) {
                    date.selectable = false;
                })
            }
        }
    }

    function endDateBeforeRender ($view, $dates) {
        if($scope.alertData){
            if ($scope.alertData.scheduleFrom) {
                var activeDate = moment($scope.alertData.scheduleFrom).subtract(1, $view).add(1, 'minute');
                $dates.filter(function (date) {
                    return date.localDateValue() <= activeDate.valueOf()
                }).forEach(function (date) {
                    date.selectable = false;
                })
            }
        }
    }

    $scope.beforeRender = function ($view, $dates) {
        var activeDate = moment(new Date()).subtract(1, $view).add(1, 'minute');
        $dates.filter(function (date) {
            return date.localDateValue() < activeDate.valueOf()
        }).forEach(function (date) {
            date.selectable = false;
        })
    }

    $scope.cancelAlert = function () {
        $scope.editMode = false;
        $uibModalInstance.dismiss('cancel');
    };
    $scope.openDateModal = function(type) {
        var modalInstance = getDateModal();
        modalInstance.result.then(function(selectedDate) {
            $scope.alertData['schedule' + type] = new Date(selectedDate);
        });
    };
    var getDateModal = function() {
        var ctrlName = 'generalEditController';
        return $uibModal.open({
            animation: true, 
            templateUrl: 'partials/editDateTime.html', 
            controller: ctrlName, 
            size: 'lg', 
            scope: $scope,
            backdrop: 'static'
        });
    };
    $scope.newDateTime = function(){
        if($scope.dt){ 
            var myHour = $scope.mytime.getHours();
            var myMinute = $scope.mytime.getMinutes();
            $scope.dt = $scope.dt.setHours(myHour, myMinute);
            $uibModalInstance.close($scope.dt);
        }
    };
    $scope.cancelDateTimeChange = function(){
        $uibModalInstance.dismiss('cancel');
    };
    $scope.changeActive = function (obj) {
        if ($scope.readOnlyAlertFlag)
            return;
        obj.active = !obj.active;
    };
    $scope.readOnlyAlert = function (flag) {
        $scope.readOnlyAlertFlag = flag;
    };

    $scope.closeUpdateLoader = function () {
        if ($scope.saveSuccess)
        {
            $scope.cancelAlert();
            return;
        }
        $scope.alertType = {show: false};
        $scope.showLoader = false;
    };
    $scope.changeRecipient = function () {
        if ($scope.readOnlyAlertFlag)
            return;
        $scope.newSchedule.recipient = !$scope.newSchedule.recipient;
    };

    $scope.showList = function (index) {
        var tmpVisibility = ($scope.visibility[index]) ? !$scope.visibility[index] : true;
        $scope.visibility = {};
        $scope.visibility[index] = ($scope.readOnlyAlertFlag) ? false : tmpVisibility;
    };
    $scope.updateType = function (key, displayObj) { //valueId is the reference in BE
        $scope.alertData[key] = displayObj.displayName;
        $scope.alertData[key + 'Id'] = displayObj.value;
        $scope.visibility = {};
        if (key === "notificationEvent") {
            $scope.alertData.recipientAsDeviceType = displayObj.recipientAsDeviceType;
            // $scope.alertData.deliverySchedule = [];
        }
    };
    $scope.updateSchedule = function (key, displayObj) { //valueId is the reference in BE
        $scope.newSchedule[key] = displayObj.displayName;
        $scope.newSchedule[key + 'Id'] = displayObj.value;
        $scope.visibility = {};
    };

    $scope.updateAlertType = function (key, displayObj) { //valueId is the reference in BE
        $scope.alertData[key] = displayObj.displayName;
        $scope.alertData[key + 'Id'] = displayObj.value;
        $scope.alertData.alertEvent = null;
        $scope.alertMeta.alertEvent = displayObj.alertEvent;
        $scope.visibility = {};
    };
    $scope.changeCheckStatus = function (index) {
        if ($scope.readOnlyAlertFlag)
            return;
        $scope.alertData[index] = !$scope.alertData[index];
    };
    $scope.saveAlert = function (endPoint) {
        $scope.showLoader = true;
        if ($scope.createAlertRecord){
            createAlert(endPoint);
        } else {
            updateAlert(endPoint);
        }
        $scope.editMode = false;
    };
    $scope.removeSchedule = function (objIndex) {
        $scope.alertData.deliverySchedule.splice(objIndex, 1);
    }
    $scope.addSchedule = function () {
        $scope.showLoader = true;
        var tmpSchedule = angular.copy($scope.newSchedule);
        if (tmpSchedule && tmpSchedule.sDate) {
            tmpSchedule.dateTime = $scope.newSchedule.sDate;
            if ($scope.alertData.recipientAsDeviceType) {
                tmpSchedule.recipient = null;
            } else {
                tmpSchedule.deviceType = null;
                tmpSchedule.deviceTypeId = null;
            }
            tmpSchedule.active = true;
            if ($scope.alertData && $scope.alertData.deliverySchedule) {
                $scope.alertData.deliverySchedule.push(tmpSchedule);
            } else {
                $scope.alertData.deliverySchedule = [];
                $scope.alertData.deliverySchedule.push(tmpSchedule);
            }
            $scope.newSchedule = {"sDate": new Date(),"active":true,"recipient":false};
        }
        $scope.showLoader = false;
    }
    function createAlert(endPoint) {
        var params = angular.merge({}, {'cot': $scope.cotId, 'type': $scope.role}, $scope.alertData);
        params['timeZoneOffset'] = new Date().getTimezoneOffset();
        RoleDetails.postData(endPoint, params, function (response) {
            if (response.status === 200){
                $scope.alertType = {
                    show: true,
                    class: 'success',
                    msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                };
                $scope.saveSuccess = true;
                $scope.getTabPageData(1);
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
    }
    function updateAlert(endPoint) {
        var params = angular.merge({}, {'cot': $scope.cotId, 'type': $scope.role}, $scope.alertData);
        params['timeZoneOffset'] = new Date().getTimezoneOffset();
        RoleDetails.putData(endPoint, params, function (response) {
            if (response.status === 200){
                $scope.alertType = {
                    show: true,
                    class: 'success',
                    msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                };
                $scope.saveSuccess = true;
                $scope.getTabPageData(1);
            } else {
                updatePostError(response);
            }
        }, function (response) {
            updatePostError(response);
        })
        function updatePostError(response) {
            $scope.saveSuccess = false;
            $scope.alertType = {
                show: true,
                class: 'danger',
                msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR
            };
        }
    }
});