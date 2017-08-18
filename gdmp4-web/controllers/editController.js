(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('hardwareController', hardwareController);
    app.controller('documentController', hardwareController);
    hardwareController.$inject = ['$scope', '$rootScope', '$log', 'RoleDetails', 'ERROR_MSGS', '$uibModalInstance', '$sce'];
    function hardwareController ($scope, $rootScope, $log, RoleDetails, ERROR_MSGS, $uibModalInstance, $sce) {
        $scope.showLoader = true;
        $scope.readOnlyFlag = ($scope.createRecord) ? false : true;
        $scope.visibility = {};
        $scope.searchResult = {};
        $scope.alertType = {show: false};
        $scope.help = $sce.trustAsHtml('Click &lsquo;Edit&rsquo; to change an existing item.<br/><br/>\
                        Fill in fields, upload a file (when applicable) and click Save to create/update an item.<br/><br/>\
                        All fields with asterisk (*) mark are required.<br/><br/>\
                        Check for fields in <span style="color: red">red border</span> if Save button is unavailable.<br\><br\>Click Help again to hide this message');
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
            if ($scope.role === 'devices')
                return;
            if ($scope.tab === 'approvingManager') var getMeta = RoleDetails.metaData($scope.cotId, 'mdtapprovemgr', $scope.roleData.id, $scope.roleData.configTypeCode);
            else var getMeta = RoleDetails.metaData($scope.cotId, $scope.role, $scope.roleData.id, $scope.roleData.configTypeCode);
            getMeta.then(function (response) {
                if (!angular.isObject(response.data) || !Object.keys(response.data).length){
                    $log.debug("Error in MetaData(No Data)");
                    $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                    return;
                }
                $scope.currentStatus = {};
                $scope.metaData = response.data;
                if($scope.metaData.country) $scope.metaData.countryList = $scope.metaData.country;
                if($scope.metaData.language) $scope.metaData.languageList = $scope.metaData.language;
                if ($scope.role === 'hardware' && $scope.createRecord) {
                    if ($rootScope.tmpStatus) {
                        $scope.roleData.hardwareStatus = $rootScope.tmpStatus;
                        $scope.roleData.hardwareStatusId = $rootScope.tmpStatusId;
                    }else{
                        $scope.roleData.hardwareStatus = $scope.metaData.status[1].displayName;
                        $scope.roleData.hardwareStatusId = $scope.metaData.status[1].value;
                    }
                }
                if ($scope.role === 'configuration' && $scope.createRecord) {
                    if ($rootScope.tmpStatus) {
                        $scope.roleData.status = $rootScope.tmpStatus;
                        $scope.roleData.statusId = $rootScope.tmpStatusId;
                    }else{
                        $scope.roleData.status = $scope.metaData.status[1].displayName;
                        $scope.roleData.statusId = $scope.metaData.status[1].value;
                    }
                }
                if ($scope.role === 'document' && $scope.createRecord) {
                    if ($rootScope.tmpStatus) {
                        $scope.roleData.documentStatus = $rootScope.tmpStatus;
                        $scope.roleData.documentStatusId = $rootScope.tmpStatusId;
                    }else{
                        $scope.roleData.documentStatus = $scope.metaData.status[1].displayName;
                        $scope.roleData.documentStatusId = $scope.metaData.status[1].value;
                    }
                }
                $scope.currentStatus.displayName = $scope.roleData.status || $scope.roleData.hardwareStatus || $scope.roleData.documentStatus;
                $scope.currentStatus.value = $scope.roleData.statusId || $scope.roleData.hardwareStatusId || $scope.roleData.documentStatusId;

                // if($scope.roleData.status === )
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

        var clearAssociation = function () {
            $scope.searchResult = {};
            $scope.roleData.clientAssociations = {};
            $scope.roleData.featureConfiguration = {};
            $scope.roleData.hardwareConfiguration = {};
            $scope.roleData.softwareConfiguration = {};
            $scope.roleData.features = {};
            $scope.roleData.hardwares = {};
            $scope.roleData.softwares = {};
        };

        $scope.updateConfig = function(key, displayObj) {
            if(document.getElementById("searchHardware"))
                document.getElementById("searchHardware").value = '';
            if(document.getElementById("searchSoftware"))
                document.getElementById("searchSoftware").value = '';
            if(document.getElementById("searchFeature"))
                document.getElementById("searchFeature").value = '';
            if(document.getElementById("searchHardwareConfig"))
                document.getElementById("searchHardwareConfig").value = '';
            if(document.getElementById("searchSoftwareConfig"))
                document.getElementById("searchSoftwareConfig").value = '';
            if(document.getElementById("searchFeatureConfig"))
                document.getElementById("searchFeatureConfig").value = '';
            $scope.updateType(key, displayObj);
        }

        $scope.updateType = function (key, displayObj) { //valueId is the reference in BE
            if(key !== 'status' || $scope.createRecord) clearAssociation();
            $scope.roleData[key] = displayObj.displayName;
            $scope.roleData[key + 'Id'] = displayObj.value;
            $scope.visibility = {};
        };
        $scope.createType = function () {
            $scope.showLoader = true;
            if ($scope.tab === 'approvingManager') {
                $scope.roleData.cotId = $scope.cotId;
                var role = 'mdtapprovemgr';
            }
            else var role = $scope.role;
            RoleDetails.postData(role, $scope.roleData, function (response) {
                if (response.status === 200 || response.status === 201){
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        confirmation: response.data.confirmation,
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
        $scope.cancelConfirmation = function () {
            $scope.alertType = {show: false};
            $scope.showLoader = false;
        }

        $scope.$watch('roleData.language', function(val){
            if($scope.metaData){
                if($scope.metaData.language){
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
            }
            $scope.selectedValidLanguage = true;
            if($scope.metaData && $scope.roleData){
                if($scope.metaData.language){
                    $scope.selectedValidLanguage = false;
                    if($scope.roleData.language){
                        angular.forEach($scope.metaData.language, function(value, key){
                            if(value.displayName.toLowerCase() === $scope.roleData.language.toLowerCase()){
                                $scope.roleData.language = value.displayName;
                                $scope.roleData.languageId = value.value;
                                $scope.selectedValidLanguage = true;
                            }
                        })
                    }
                }
            }
        });

        $scope.save = function (confirmation) {
            $scope.alertType = {show: false};
            $scope.roleData.userConfirmation = confirmation
            if (confirmation===false) {
                $scope.showLoader = false;
                return
            }
            if ($scope.createRecord){
                $scope.createType();
            } else{
                update();
            }
        };

        $scope.clone = function (archiveParent) {
            $rootScope.tmpStatus = ($scope.roleData.hardwareStatus || $scope.roleData.documentStatus || $scope.roleData.status);
            $rootScope.tmpStatusId = ($scope.roleData.hardwareStatusId || $scope.roleData.documentStatusId || $scope.roleData.statusId);
            $uibModalInstance.dismiss('clone');
            $scope.readOnlyFlag = false;
            $scope.roleData.archiveParent = archiveParent;
            $scope.open('CLONE', $scope.roleData);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
            $rootScope.tmpStatus = null;
            $rootScope.tmpStatusId = null;
            $scope.roleData = null;
            $scope.readOnlyFlag = false;            
        };
        $scope.readOnly = function (flag) {
            $scope.readOnlyFlag = flag;
            $scope.docControl = false; 
            if (!$scope.readOnlyFlag){
                if($scope.roleData.hardwareStatusId < 3) {
                    $scope.docControl = true;
                }
            }
        };

        function isValid(str){
            return !/[~!@#$%^&*()+=:;"'{}[\]<>/?`,]/g.test(str);
        }

        //For document upload
        $scope.uploadDoc = function (file) {
            if (!file) return;
            $scope.hasSpecialChar = (isValid(file.name)) ? false : true;
            if ($scope.hasSpecialChar) return;
            if (!$scope.tmpFilename || ($scope.tmpFilename !== file.name)){
                $scope.tmpFilename = file.name;
                $scope.uid = new Date().getTime();
            }
            var params = {file: file, uid: $scope.uid};
            $scope.uploadingDoc = true;
            $rootScope.stopSessionTimeout();
            RoleDetails.uploadDoc(params, function (response) {
                if (response.status === 200 && $scope.roleData){
                    $scope.roleData.file = response.data;
                    $scope.uploadingDoc = false;
                    $scope.uploadError = false;
                    $rootScope.resetSessionTimeout();
                } else {
                    updateError(response)
                }
            }, function (response) {
                updateError(response)
            });
            function updateError(response) {
                $scope.uploadingDoc = false;
                $scope.uploadError = (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.UPLOAD_ERROR;
                $rootScope.resetSessionTimeout();
            }
        }
        $scope.deleteError = null;
        $scope.deletingDoc = false;
        $scope.deleteDoc = function (fileObj) {
            if (!fileObj)
                return;
            $scope.deletingDoc = true;
            RoleDetails.deleteDoc(fileObj, function (response) {

                if (response.status === 200)
                {
                    $scope.roleData.file = null;
                    $scope.deletingDoc = false;
                    $scope.deleteError = null;
                } else
                {
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
                var data = RoleDetails.getSearchData(type, $scope.cotId, 0, {'name': sString, 'device_types':$scope.roleData.deviceType || 0, 'warning_status': $scope.roleData.warningTypeId || 0, 'status': $scope.roleData.statusId || $scope.roleData.hardwareStatusId});
                data.then(function (response) {
                    $scope.loadingSearch[type] = false;
                    if (response.status === 200)
                    {
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
            if (!($scope.roleData[associationKey] && $scope.roleData[associationKey][tmpId]))
            {
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
            if ($scope.saveSuccess){
                $scope.cancel();
                return;
            }
            $scope.alertType = {show: false};
            $scope.showLoader = false;
        }

        function update() {
            $scope.showLoader = true;
            if ($scope.tab === 'approvingManager') {
                $scope.roleData.cotId = $scope.cotId;
                var role = 'mdtapprovemgr';
            }
            else var role = $scope.role;
            RoleDetails.putData(role, $scope.roleData, function (response) {
                if (response.status === 200){
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        confirmation: response.data.confirmation,
                        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                    };
                    $scope.saveSuccess = true;
                    if($scope.tab === 'approvingManager') $scope.getApprovingManagerData(1);
                    else $scope.getData(1);
                } else{
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
