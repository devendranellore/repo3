(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('softwareController', softwareController);
    app.controller('customerController', softwareController);
    softwareController.$inject = ['$scope', '$rootScope', 'RoleDetails', 'ERROR_MSGS', '$uibModalInstance', '$sce'];
    function softwareController ($scope, $rootScope, RoleDetails, ERROR_MSGS, $uibModalInstance, $sce, AdminRoleController) {
        var selectAllObj,
            regionSelected,
            regionCheckUncheck = true,
            excludedList = {};
        $scope.visibility = {};
        $scope.countryExcluded = {};
        $scope.selectedCountries = {};
        $scope.readOnlyFlag = ($scope.createRecord) ? false : true;
        $scope.showLoader = true;
        $scope.regionExcluded = {};
        $scope.deleteCountry = deleteCountry();
        $scope.clone = ($rootScope.clone != undefined || $rootScope.clone != null) ? $rootScope.clone: false;
        delete $rootScope.clone;
        $scope.help = $sce.trustAsHtml('Click &lsquo;Edit&rsquo; to change an existing item.<br/><br/>\
                        Fill in fields, upload a file (when applicable) and click Save to create/update an item.<br/><br/>\
                        All fields with asterisk (*) mark are required.<br/><br/>\
                        Check for fields in <span style="color: red">red border</span> if Save button is unavailable.<br\><br\>Click Help again to hide this message');
        //Region Check or Uncheck
        $scope.selectAll = function (region, check, removeRegion) {
            regionCheckUncheck = check;
            selectAllObj = {};
            regionSelected = region;
            $scope.metaData.country[region].forEach(addRemoveCountries);
            $scope.selectedCountries[region] = selectAllObj;
            if (!regionCheckUncheck) {
                $scope.selectedCountries[region] = null;
            }
            if (removeRegion) {
                $scope.regionExcluded[region] = false;
            }
        };
        $scope.roleData.clientAssociations = {};
        if (!$scope.createRecord || $scope.cloneRecord) {
            $scope.roleData.clientAssociations['documents'] = $scope.roleData['documents'];
            $scope.roleData.clientAssociations['hardwares'] = $scope.roleData['hardwares'];
            $scope.roleData.clientAssociations['facilities'] = $scope.roleData['facilities'];
        }
        if($scope.clone){
            $scope.roleData.clientAssociations['documents'] = $scope.roleData['documents'];
            $scope.roleData.clientAssociations['hardwares'] = $scope.roleData['hardwares'];
            $scope.roleData.clientAssociations['facilities'] = $scope.roleData['facilities'];
        }
       
        function addRemoveCountries(country) {
            selectAllObj[country.value] = {'selected': regionCheckUncheck, 'displayName': country.displayName, 'value': country.value};
            if (!$scope.countryExcluded[regionSelected]) {
                $scope.countryExcluded[regionSelected] = {};
            }
            $scope.countryExcluded[regionSelected][country.value] = regionCheckUncheck;
        }
        $scope.isEmptyObj = function (obj) {
            return (angular.isObject(obj) && Object.keys(obj).length === 0 || obj === undefined);
        }
        $scope.excludeCountry = function (region, country) {
            excludedList = $scope.selectedCountries;
            if (!excludedList[region]) {
                excludedList[region] = {};
            }
            excludedList[region][country.value] = {
                'displayName': country.displayName,
                'value': country.value,
                'selected': $scope.countryExcluded[region][country.value]
            };
            if (!hasCountries(excludedList[region])) {
                excludedList[region] = null;
            }
            $scope.selectedCountries = excludedList;
        };
        function hasCountries(list) {
            var count = 0;
            angular.forEach(list, function (value, key) {
                count = (value.selected) ? ++count : count;
            });
            return (count > 0);
        }

        function deleteCountry() {
            return function (region, country) {
                var deleteObj;
                if ($scope.selectedCountries[region] && $scope.selectedCountries[region][country]) {
                    deleteObj = $scope.selectedCountries[region][country];
                    deleteObj.selected = false; //Make the selection false
                    if (!$scope.countryExcluded[region]) {
                        $scope.countryExcluded[region] = {};
                    }
                    $scope.countryExcluded[region][country] = false;
                    if (!hasCountries($scope.selectedCountries[region])) {
                        $scope.selectedCountries[region] = null; //Make the region null to hide the region header
                    }
                }
            };
        }

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
                if ($scope.uploadError == 'Error!! Please try again.') $scope.uploadError = $scope.uploadError + ' Uploading will be continued from the break point.'
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
                if (response.status === 200){
                    $scope.roleData.file = null;
                    $scope.deletingDoc = false;
                    $scope.deleteError = null;
                } else {
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

        function loadLists() {
            if ($scope.role == 'customer'){
                $scope.showLoader = false;
                return;
            }
            if ($scope.roleData && $scope.roleData.excluded_countries) {
                $scope.selectedCountries = $scope.roleData.excluded_countries;
            }
            angular.forEach($scope.selectedCountries, function (obj, key) {
                var tmpCountires = Object.keys(obj);
                tmpCountires.map(function (x) {
                    if (!$scope.countryExcluded[key]) {
                        $scope.countryExcluded[key] = {};
                    }
                    $scope.countryExcluded[key] [x] = true;
                });
            });
            var getMeta = RoleDetails.metaData($scope.cotId, $scope.role, $scope.roleData.id);
            getMeta.then(function (response) {
                if (!angular.isObject(response.data) || !Object.keys(response.data).length) {
                    $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                    return;
                }
                $scope.currentStatus = {};
                $scope.metaData = response.data;
                $scope.metaData.languageList = $scope.metaData.language;
                if ($scope.createRecord) {    
                    $scope.roleData[$scope.role+'Status'] = ($rootScope.tmpStatus) ? $rootScope.tmpStatus : $scope.metaData.status[1].displayName;
                    $scope.roleData[$scope.role+'StatusId'] = ($rootScope.tmpStatus) ? $rootScope.tmpStatusId : $scope.metaData.status[1].value;
                }
                $scope.currentStatus.displayName = $scope.roleData.status;
                $scope.currentStatus.value = $scope.roleData.statusId;
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
        $scope.readOnly = function (flag) {
            if (flag === undefined)
                flag = true;
            $scope.readOnlyFlag = flag;
            if (!$scope.readOnlyFlag){
                if($scope.roleData.softwareStatusId < 3 || $scope.roleData.featureStatusId < 3) {
                    $scope.docControl = true;
                }
            }
        };
        $scope.showList = function (dropList) {
            var tmpVisibility = ($scope.visibility[dropList]) ? !$scope.visibility[dropList] : true;
            $scope.visibility = {};
            $scope.visibility[dropList] = ($scope.readOnlyFlag) ? false : tmpVisibility;
        };
        $scope.showTypeOptions = function () {
            $scope.typeClick = true;
        };
        var clearAssociation = function () {
            $scope.searchResult = {};
            $scope.roleData.clientAssociations = {};
            $scope.roleData.documents = {};
            $scope.roleData.hardwares = {};
            $scope.roleData.facilities = {};
        };
        $scope.updateType = function (key, displayObj) { //valueId is the reference in BE
            if((key === ($scope.role+'Status') || key === 'deviceType') && $scope.createRecord) clearAssociation();
            $scope.roleData[key] = displayObj.displayName;
            $scope.roleData[key + 'Id'] = displayObj.value;
            $scope.visibility = {};
        };
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
            $scope.showLoader = true;
            angular.merge($scope.roleData, $scope.roleData.clientAssociations);
            // $scope.roleData.clientAssociations = null;
            $scope.roleData.excluded_countries = $scope.selectedCountries;
            $scope.roleData.userConfirmation = confirmation;
            if (confirmation===false) {
                $scope.showLoader = false;
                return
            }
            var method;
            method = ($scope.createRecord) ? 'postData' : 'putData';
            RoleDetails[method]($scope.role, $scope.roleData, function (response) {
                console.log(response)
                if (response.status === 200 || response.status === 201){
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        confirmation: response.data.confirmation,
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
        };
        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
            $scope.tmpFilename = null;
            $rootScope.tmpStatus = null;
            $rootScope.tmpStatusId = null;
            $scope.roleData = null;
            $scope.readOnlyFlag = false;
        };

        $scope.clone = function (archiveParent) {
            $rootScope.tmpStatus = $scope.roleData[$scope.role+'Status'];
            $rootScope.tmpStatusId = $scope.roleData[$scope.role+'StatusId'];
            $uibModalInstance.dismiss('clone');
            $scope.readOnlyFlag = false;
            $rootScope.clone = true;
            $scope.roleData.archiveParent = archiveParent;
            $scope.open('CLONE', $scope.roleData);
        };

        $scope.closeUpdateLoader = function () {
            if ($scope.saveSuccess){
                $scope.cancel();
                return;
            }
            $scope.alertType = {show: false};
            $scope.showLoader = false;
        }

        $scope.loadingSearch = {};
        $scope.searchResult = {};
        $scope.searchType = search();
        function search() {
            return function (type, sString) {
                $scope.loadingSearch[type] = true;
                var data = RoleDetails.getSearchData(type, $scope.cotId, 0, {'name': sString, 'status': $scope.roleData[$scope.role+'StatusId']});
                data.then(function (response) {
                    $scope.loadingSearch[type] = false;
                    if (response.status === 200){
                        $scope.searchResult[type] = (response.data) ? response.data.data : null;
                    }
                }, function (response) {
                    $scope.loadingSearch[type] = false;
                });
            };
        }
        $scope.$watch('roleData.clientAssociations.hardwares', function(val){
            $scope.hasNoHW = false;
            if($scope.isCatalogDevice){
                if($scope.isEmptyObj(val)){
                    $scope.hasNoHW = true;
                } else {
                    $scope.hasNoHW = false;
                }
            }
        }, true)
        $scope.addAssociation = function (index, associationKey, searchObj, type, root) {
            if (type === undefined)
                type = associationKey;
            if (root == undefined)
                root = true;
            var tmpId = searchObj.basic.id,
                tmpObj = $scope.roleData;
            $scope.roleData.root = root;
            if (!tmpObj.clientAssociations || (!$scope.roleData.clientAssociations && tmpObj.clientAssociations)){
                tmpObj.clientAssociations = {};
                tmpObj.clientAssociations[associationKey] = {}
            } else {
                tmpObj.clientAssociations[associationKey] = (!tmpObj.clientAssociations[associationKey]) ? {} : tmpObj.clientAssociations[associationKey];
            }
            if (!(tmpObj.clientAssociations[associationKey][tmpId])){
                tmpObj.clientAssociations[associationKey][tmpId] = $scope.searchResult[type][index].detail;
            }
            $scope.roleData.clientAssociations = tmpObj.clientAssociations;
        }
        ;
        $scope.removeAssociation = function (index, ObjKey) {
            delete $scope.roleData.clientAssociations[ObjKey][index]
        }
        loadLists(); //Fetch the data for populating the dropdowns
    };
})();