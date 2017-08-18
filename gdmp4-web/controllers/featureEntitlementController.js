(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('featureEntitlementController', featureEntitlementController);
    featureEntitlementController.$inject = ['$scope', '$rootScope', '$state', '$log', 'RoleDetails', 'ERROR_MSGS', '$uibModalInstance', '$sce'];
    function featureEntitlementController ($scope, $rootScope, $state, $log, RoleDetails, ERROR_MSGS, $uibModalInstance, $sce) {
        $scope.showLoader = true;
        $scope.readOnlyFlag = ($scope.createRecord) ? false : true;
        $scope.visibility = {};
        $scope.searchResult = {};
        $scope.help = $sce.trustAsHtml('Click &lsquo;Edit&rsquo; to change an existing item.<br/><br/>\
						Select a device type first to see available Features to entitle to device.<br/><br/>\
                        Fill in fields and click Save to create/update an item.<br/><br/>\
                        All fields with asterisk (*) mark are required.<br/><br/>\
                        Check for fields in <span style="color: red">red border</span> if Save button is unavailable');
        $scope.alertType = {show: false};
        $scope.formats = 'dd-MMMM-yyyy';
        $scope.popup1 = { opened: false };
        $scope.popup2 = { opened: false };
        $scope.dateOptions = {
            formatYear: 'yy',
            minDate: new Date(1800, 1, 1),
            startingDay: 1
        };
        if($scope.roleData.term)
            $scope.termSelected = true;
        else
            $scope.termSelected = false;
        $scope.$watch('roleData.startDate', function(newVal){
            if($scope.roleData){
                if($scope.roleData.startDate)
                    $scope.dateOptions.minDate = new Date(newVal);
                else
                    $scope.dateOptions.minDate = new Date(1800, 1, 1);
            }
        });
        $scope.$watch('roleData.endDate', function(newVal){
            if($scope.roleData){
                if($scope.roleData.endDate)
                    $scope.dateOptions.maxDate = new Date(newVal);
            }
        });
        $scope.open1 = function() {
            $scope.popup1.opened = true;
            $scope.dateOptions.minDate = new Date(1800, 1, 1);
        };
        $scope.open2 = function() {
            $scope.popup2.opened = true;
            delete $scope.dateOptions.maxDate;
        };
        $scope.$watch('roleData.term', function(val){
            if($scope.roleData){
                if(val !== 'Time Limited' && $scope.roleData.endDate){
                    delete $scope.roleData.endDate;
                }
            }
        })
        $scope.makeWarningTypes = function (type) {
            var tmpMeta = $scope.metaData;
            if (!tmpMeta)
                return;
            if (tmpMeta.warning_type && tmpMeta.warning_type[type]){
                tmpMeta.warning_type['configs'] = tmpMeta.warning_type[type];
            } else {
                $scope.metaData = ($scope.metaData) ? $scope.metaData : {};
                tmpMeta.warning_type = {configs: []};
            }
            $scope.metaData.configs = tmpMeta.warning_type['configs'];
        }
        $scope.checkReadiness = function () {
            return true;
        }
        $scope.loadLists = function () {
            var getMeta = RoleDetails.metaData($scope.cotId, 'featureEntitlement', $scope.roleData.id);
            getMeta.then(function (response) {
                if (!angular.isObject(response.data) || !Object.keys(response.data).length){
                    $log.debug("Error in MetaData(No Data)");
                    $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                    return;
                }
                $scope.currentStatus = {};
                $scope.metaData = response.data;
                if ($scope.createRecord) {
                    if ($rootScope.tmpStatus) {
                        $scope.roleData.status = $rootScope.tmpStatus;
                        $scope.roleData.statusId = $rootScope.tmpStatusId;
                    }else{
                        $scope.roleData.status = $scope.metaData.status[1].displayName;
                        $scope.roleData.statusId = $scope.metaData.status[1].value;                        
                    }
                }
                if (!$scope.createRecord){
                    if($scope.roleData.term){
                        $scope.termSelected = true;
                        $scope.metaData.term.forEach(function(term){
                            if($scope.roleData.term === term.displayName)
                                $scope.roleData.termId = term.value;
                        })
                    };
                }
                $scope.currentStatus.displayName = $scope.roleData.status;
                $scope.currentStatus.value = $scope.roleData.statusId;
                if (!$scope.checkReadiness()){
                    $scope.showError(ERROR_MSGS.SERVER_LOAD_ERROR);
                    return;
                }
                $scope.showLoader = false;
                $scope.modalError = null;
                ($scope.roleData.configType) ? $scope.makeWarningTypes($scope.roleData.configType.toLowerCase()) : "";
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
        if ($scope.roleData) {
            if ($scope.roleData.startDate) {
                $scope.roleData.startDate = new Date($scope.roleData.startDate);
            }
            if ($scope.roleData.endDate) {
                $scope.roleData.endDate = new Date($scope.roleData.endDate);
            }
        }
        $scope.loadLists();
        $scope.uploadingDoc = false;
        $scope.uploadError = false;
        $scope.searchType = search();
        $scope.loadingSearch = {};
        $scope.showList = function (dropList) {
            var tmpVisibility = ($scope.visibility[dropList]) ? !$scope.visibility[dropList] : true;
            $scope.visibility = {};
            $scope.visibility[dropList] = ($scope.readOnlyFlag) ? false : tmpVisibility;
        };
        $scope.updateType = function (key, displayObj) { //valueId is the reference in BE
            if (key==="term") $scope.termSelected = true;
            $scope.roleData[key] = displayObj.displayName;
            $scope.roleData[key + 'Id'] = displayObj.value;
            if(displayObj.displayName === 'Permanent' && $scope.roleData.endDate){
                delete $scope.roleData.endDate;
            }
            $scope.visibility = {};
        };
        $scope.changeDeviceType = function(deviceTypeObj) {
            $scope.updateType('deviceType', deviceTypeObj);

            $scope.roleData.feature = undefined;
            $scope.roleData.featureId = undefined;

            if (!$scope.roleData.deviceTypeId) {
                return $scope.metaData.feature_filtered = [];
            }
            else {
                $scope.metaData.feature_filtered = $scope.metaData.feature.filter(function(item) {
                    return item.deviceTypeId == $scope.roleData.deviceTypeId;
                });
            }
        };
        $scope.createType = function () {
            $scope.showLoader = true;
            RoleDetails.postData('featureEntitlement', $scope.roleData, function (response) {
                if (response.status >= 200 && response.status < 300){
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                    };
                    $scope.saveSuccess = true;
                    $scope.getData(1);
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
        $scope.clone = function (archiveParent) {
            $rootScope.tmpStatus = ($scope.roleData.status);
            $rootScope.tmpStatusId = ($scope.roleData.statusId);
            $uibModalInstance.dismiss('clone');
            $scope.readOnlyFlag = false;
            $scope.open('CLONE', $scope.roleData);
        };
        $scope.save = function () {
            $scope.alertType = {show: false};
            if ($scope.createRecord) {
                $scope.createType();
            } else {
                update();
            }
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
            $scope.roleData = null;
            $scope.readOnlyFlag = false;
        };
        $scope.readOnly = function (flag) {
            $scope.readOnlyFlag = flag;
            if (!$scope.roleData.deviceTypeId) {
                return $scope.metaData.feature_filtered = [];
            }
            else {
                $scope.metaData.feature_filtered = $scope.metaData.feature.filter(function(item) {
                    return item.deviceTypeId == $scope.roleData.deviceTypeId;
                });
            }
        };
        //For document upload
        $scope.uploadDoc = function (file) {
            if (!file)
                return;
            var params = {file: file};
            $scope.uploadingDoc = true;
            RoleDetails.uploadDoc(params, function (response) {
                if (response.status >= 200 && response.status < 300) {
                    $scope.roleData.file = response.data;
                    $scope.uploadingDoc = false;
                    $scope.uploadError = false;
                } else {
                    updateError(response)
                }
            }, function (response) {
                updateError(response)
            });
            function updateError(response) {
                $scope.uploadingDoc = false;
                $scope.uploadError = (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR;
            }
        }
        $scope.deleteError = null;
        $scope.deletingDoc = false;
        $scope.deleteDoc = function (fileObj) {
            if (!fileObj)
                return;
            $scope.deletingDoc = true;
            RoleDetails.deleteDoc(fileObj, function (response) {

                if (response.status >= 200 && response.status < 300){
                    $scope.roleData.file = null;
                    $scope.deletingDoc = false;
                    $scope.deleteError = null;
                } else{
                    updateDelError(response);
                }
            }, function (response) {
                updateDelError(response);
            })
            function updateDelError(response) {
                $scope.deletingDoc = false;
                $scope.deleteError = (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR;
            }
        }

        function search() {
            return function (type, sString) {
                $scope.loadingSearch[type] = true;
                var data = RoleDetails.getData(type, $scope.cotId, 5, 0, {'name': sString});
                data.then(function (response) {
                    $scope.loadingSearch[type] = false;
                    if (response.status >= 200 && response.status < 300) {
                        $scope.searchResult[type] = (response.data) ? response.data.data : null;
                    }
                }, function (response) {
                    $scope.loadingSearch[type] = false;
                });
            };
        }
        $scope.addAssociation = function (index, associationKey, searchObj, type) {
            var tmpId = searchObj.basic.id;
            ($scope.roleData[associationKey])
            if (!($scope.roleData[associationKey] && $scope.roleData[associationKey][tmpId])) {
                (!$scope.roleData[associationKey]) ? $scope.roleData[associationKey] = {} : null;
                $scope.roleData[associationKey][tmpId] = $scope.searchResult[type][index].detail;
            }
        };
        $scope.removeAssociation = function (index, ObjKey) {
            delete $scope.roleData[ObjKey][index]
        }


        $scope.isEmptyObj = function (obj) {
            return (angular.isObject(obj) && Object.keys(obj).length === 0 || obj === undefined);
        }

        $scope.closeUpdateLoader = function () {
            if ($scope.saveSuccess) {
                $scope.cancel();
                return;
            }
            $scope.alertType = {show: false};
            $scope.showLoader = false;
        }
        function update() {
            $scope.showLoader = true;
            RoleDetails.putData('featureEntitlement', $scope.roleData, function (response) {
                if (response.status >= 200 && response.status < 300){
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                    };
                    $scope.saveSuccess = true;
                    $scope.getData(1);
                } else {
                    updatePutError(response);
                }
            }, function (response) {
                updatePutError(response);
            })
            function updatePutError(response) {
                $scope.saveSuccess = false;
                $scope.alertType = {
                    show: true,
                    class: 'danger',
                    msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR
                };
            }
        }
        $scope.showError = function (msg) {
            $scope.modalError = msg;
        }
    };
})();
