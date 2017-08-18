(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('devicesController', function ($scope,$rootScope, $log, $controller, $uibModalInstance, RoleDetails, ERROR_MSGS, MED_API) {
        angular.extend(this, $controller('hardwareController', {$scope: $scope, $uibModalInstance: $uibModalInstance}));
        $scope.paginationParams = {
            "history": {
                pageNo: 1,
                total_count: 0
            },
            "logs": {
                pageNo: 1,
                total_count: 0
            },
            "discrepancies": {
                pageNo: 1,
                total_count: 0
            },
            "feature_history": {
                pageNo: 1,
                total_count: 0
            },
            "itemsPerPage": 7 //MED_API.LIMIT.ROWS
        };
        (function fetchData() {
            $scope.showLoader = true;
            $scope.activeTabs = {'hist': true};
            $scope.modalError = '';
            $scope.displaySlNumber = false;
            RoleDetails.getTypeData($scope.role, $scope.roleData.id, function (response) {
                if (response.status === 200){
                    $scope.showLoader = false;
                    if (!angular.isObject(response.data) || !Object.keys(response.data).length){
                        $log.debug("Error in loading device Data(No Data)");
                        $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                        return;
                    }
                    $scope.deviceData = response.data;
                    $scope.paginationParams.history.total_count = ($scope.deviceData && $scope.deviceData.history && $scope.deviceData.history.total_count) ? $scope.deviceData.history.total_count : 0;
                    $scope.paginationParams.logs.total_count = ($scope.deviceData && $scope.deviceData.logs && $scope.deviceData.logs.total_count) ? $scope.deviceData.logs.total_count : 0;
                    $scope.paginationParams.discrepancies.total_count = ($scope.deviceData && $scope.deviceData.discrepancies && $scope.deviceData.discrepancies.total_count) ? $scope.deviceData.discrepancies.total_count : 0;
                    $scope.paginationParams.feature_history.total_count = ($scope.deviceData && $scope.deviceData.feature_history && $scope.deviceData.feature_history.total_count) ? $scope.deviceData.feature_history.total_count : 0;
                    $scope.deviceData.base_url = MED_API.BASE_URL;
                } else {
                    updatePutError(response);
                }
            }, function (response) {
                updatePutError(response);
            });
            function updatePutError(response) {
                $log.debug("Error in loading device Data(No Data)");
                $scope.modalError = ERROR_MSGS.LOAD_ERROR;
            }
        })();

        $scope.getHistoryLog = function (pageNo) {
            var params = {
                "deviceId": $scope.roleData.id,
                "limit": $scope.paginationParams.itemsPerPage
            }, 
                iCount = $scope.paginationParams.itemsPerPage,
                offset = 0;
            pageNo = pageNo || 1;
            offset = (pageNo > 1) ? (iCount * pageNo - iCount) : 0;
            params.offset = offset
            RoleDetails.getReportData('devices/history', params, function (response) {
                if (response.status === 200){
                    $scope.showLogLoader = false;
                    if (!angular.isObject(response.data) || !Object.keys(response.data).length){
                        $log.debug("Error in loading device Data(No Data)");
                        $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                        return;
                    }
                    $scope.deviceData.history = response.data;
                } else{
                    updateLogError(response);
                }
            }, function (response) {
                updateLogError(response);
            }
            );
            function updateLogError(response) {
                $log.debug("Error in loading log Data(No Data)");
                $scope.deviceHistoryError = ERROR_MSGS.LOAD_ERROR;
            }
        }

        $scope.getDiscrepanciesLog = function (pageNo) {
            var params = {
                "deviceId": $scope.roleData.id,
                "limit": $scope.paginationParams.itemsPerPage
            }, 
                iCount = $scope.paginationParams.itemsPerPage,
                offset = 0;
            pageNo = pageNo || 1;
            offset = (pageNo > 1) ? (iCount * pageNo - iCount) : 0;
            params.offset = offset
            RoleDetails.getReportData('devices/discrepancies', params, function (response) {
                if (response.status === 200){
                    $scope.showLogLoader = false;
                    if (!angular.isObject(response.data) || !Object.keys(response.data).length){
                        $log.debug("Error in loading device Data(No Data)");
                        $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                        return;
                    }
                    $scope.deviceData.discrepancies = response.data;
                } else{
                    updateLogError(response);
                }
            }, function (response) {
                updateLogError(response);
            }
            );
            function updateLogError(response) {
                $log.debug("Error in loading log Data(No Data)");
                $scope.deviceDiscrepanciesError = ERROR_MSGS.LOAD_ERROR;
            }
        }

        $scope.getFeatureHistoryLog = function (pageNo) {
            var params = {
                "deviceId": $scope.roleData.id,
                "limit": $scope.paginationParams.itemsPerPage
            }, 
                iCount = $scope.paginationParams.itemsPerPage,
                offset = 0;
            pageNo = pageNo || 1;
            offset = (pageNo > 1) ? (iCount * pageNo - iCount) : 0;
            params.offset = offset
            RoleDetails.getReportData('devices/featureHistory', params, function (response) {
                if (response.status === 200){
                    $scope.showLogLoader = false;
                    if (!angular.isObject(response.data) || !Object.keys(response.data).length){
                        $log.debug("Error in loading device Data(No Data)");
                        $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                        return;
                    }
                    $scope.deviceData.feature_history = response.data;
                } else{
                    updateLogError(response);
                }
            }, function (response) {
                updateLogError(response);
            }
            );
            function updateLogError(response) {
                $log.debug("Error in loading log Data(No Data)");
                $scope.deviceFeatureHistoryError = ERROR_MSGS.LOAD_ERROR;
            }
        }

        $scope.activate = function (tabName) {
            $scope.activeTabs = {};
            $scope.activeTabs[tabName] = true;
            if (tabName === "logs") {
                $scope.paginationParams.logs.total_count = ($scope.deviceData && $scope.deviceData.logs && $scope.deviceData.logs.total_count) ? $scope.deviceData.logs.total_count : 0;
            } else if (tabName === "hist") {
                $scope.paginationParams.history.total_count = ($scope.deviceData && $scope.deviceData.history && $scope.deviceData.history.total_count) ? $scope.deviceData.history.total_count : 0;
            } else if (tabName === "feHist"){
                $scope.paginationParams.feature_history.total_count = ($scope.deviceData && $scope.deviceData.feature_history && $scope.deviceData.feature_history.total_count) ? $scope.deviceData.feature_history.total_count : 0;
            } else if (tabName === "disc"){
                $scope.paginationParams.discrepancies.total_count = ($scope.deviceData && $scope.deviceData.discrepancies && $scope.deviceData.discrepancies.total_count) ? $scope.deviceData.discrepancies.total_count : 0;
            }
        }
        $scope.isEmptyObj = function (obj) {
            return (angular.isObject(obj) && Object.keys(obj).length === 0 || obj === undefined);
        }
        $scope.logSearch = function (pageNo) {
            console.log(pageNo)
            var params = {
                "serviceDate": document.getElementById('serviceDate').value,
                "logType": $scope.deviceData.logType,
                "deviceId": $scope.roleData.id,
                "limit": $scope.paginationParams.itemsPerPage
            }, iCount = $scope.paginationParams.itemsPerPage,
            offset = 0;
            pageNo = pageNo || 1;
            offset = (pageNo > 1) ? (iCount * pageNo - iCount) : 0;
            params.offset = offset
            RoleDetails.getReportData('devices/logs', params, function (response) {
                if (response.status === 200){
                    $scope.showLogLoader = false;
                    if (!angular.isObject(response.data) || !Object.keys(response.data).length){
                        $log.debug("Error in loading device Data(No Data)");
                        $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                        return;
                    } else {
                        $scope.deviceData.logs = response.data;
                        $scope.paginationParams.logs.total_count = $scope.deviceData.logs.total_count;
                        $scope.paginationParams.logs.pageNo = (offset > $scope.paginationParams.logs.total_count) ? 1 : pageNo;
                    }
                } else {
                    updateLogError(response);
                }
            }, function (response) {
                updateLogError(response);
            });
            function updateLogError(response) {
                $log.debug("Error in loading log Data(No Data)");
                $scope.deviceLogError = ERROR_MSGS.LOAD_ERROR;
            }
        }
    });
})();