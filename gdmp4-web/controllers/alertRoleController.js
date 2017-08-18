(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('AlertRoleController', function ($scope, $stateParams, $rootScope, $log, $controller, RoleDetails, ERROR_MSGS, MED_API, ctrlName, $uibModal) {
        angular.extend(this, $controller('RoleController', {$scope: $scope}));
        $scope.activeTabs = {'alerts': true};
        var cot = $stateParams.cot || '',
            sortParams = {},
            firstTime = true,
            defaultSort = "asc", 
            reverseSort = "desc";
        $scope.selectedTab = 'alerts';
        var selectAllObj,
            regionSelected,
            regionCheckUncheck = true,
            sortTabParams = {},
            defaultTabSort = "asc",
            reverseTabSort = "desc",
            apiTabEndPoint,
            excludedList = {};
        $scope.readOnlyAlertFlag = true;
        $scope.tabPageParams = {
            pageNo: 1, 
            totalCount: 0, 
            itemsPerPage: MED_API.LIMIT.ROWS
        };
        $scope.endDateBeforeRender = endDateBeforeRender
        $scope.endDateOnSetTime = endDateOnSetTime
        $scope.startDateBeforeRender = startDateBeforeRender
        $scope.startDateOnSetTime = startDateOnSetTime

        $scope.do = function($event){
            $event.preventDefault();
        }

        function startDateOnSetTime () {
          $scope.$broadcast('start-date-changed');
        }

        function endDateOnSetTime () {
          $scope.$broadcast('end-date-changed');
        }

        function startDateBeforeRender ($dates) {
            if($scope.dateRange){
                if ($scope.dateRange.to) {
                    var activeDate = moment($scope.dateRange.to);
                    $dates.filter(function (date) {
                        return date.localDateValue() >= activeDate.valueOf()
                    }).forEach(function (date) {
                        date.selectable = false;
                    })
                }
            }
        }

        function endDateBeforeRender ($view, $dates) {
            if($scope.dateRange){
                if ($scope.dateRange.from) {
                    var activeDate = moment($scope.dateRange.from).subtract(1, $view).add(1, 'minute');
                    $dates.filter(function (date) {
                        return date.localDateValue() <= activeDate.valueOf()
                    }).forEach(function (date) {
                        date.selectable = false;
                    })
                }
            }
        }

        $scope.readOnlyAlert = function (flag) {
            $scope.readOnlyAlertFlag = flag;
        };
        $scope.addAppRole = function (index) {
            $scope.alertData.selectedApplicationRoles.push($scope.alertData.applicationRoles.splice(index, 1)[0]);
            $scope.savable = true;
        };
        $scope.enableAlerts = function (obj) {
            obj.active = !obj.active;
        }
        $scope.removeAppRole = function (index) {
            $scope.alertData.applicationRoles.push($scope.alertData.selectedApplicationRoles.splice(index, 1)[0]);
            $scope.savable = true;
        }
        $scope.sortTabCol = {};
        $scope.tabSort = '';
        $scope.tabPageParams.primaryFilter = {};
        $scope.tabSelectedFilters = {};
        $scope.tabPageParams.filters = {};
        $scope.tabSearchFilters = {};
        $scope.mTabFilters = false;
        $scope.createAlertRecord = false;
        $scope.savable = false;
        $scope.visibility = {};
        $scope.countryExcluded = {};
        $scope.selectedCountries = {};
        $scope.manageSubData = {};
        $scope.regionExcluded = {};
        $scope.openModal = function (rowKey) {
            console.log(rowKey)
            var tmpRoleData = {}, 
                modalInstance;
            var tmpDone = ['alerts', 'general', 'templates'];
            if (tmpDone.indexOf($scope.selectedTab) < 0) return;
            if (rowKey === 'NEW'){
                $scope.createAlertRecord = true;
            } else {
                $scope.createAlertRecord = false;
                $scope.rowKey = rowKey;
            }
            $scope.editMode = true;
            modalInstance = getModalTabInstance();
        };

        $scope.delete = function(role) {
            $scope.showLoader = true;
            RoleDetails.deleteItem('templates', role, cot, function (response) {
                if (response.status >= 200 && response.status < 300) {
                    console.log('deleted')
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
        };

        var getModalTabInstance = function () {
            var ctrlName = $scope.selectedTab + 'EditController';
            if (!isAlertController(ctrlName)){
                return false;
            }
            return $uibModal.open({
                animation: true, 
                templateUrl: 'partials/alerts/edit.html', 
                controller: ctrlName, 
                size: 'lg', 
                scope: $scope, 
                backdrop: 'static'
            });
        };

        $scope.$watch('alertData.subsAlertEvent', function (ObjValue) {
            $scope.alertData = {};
            $scope.alertMeta = {};
            if (ObjValue === true) {
                $scope.alertData = angular.merge({}, $scope.manageSubData.basic, $scope.manageSubData.subsAlertEventData);
                $scope.alertMeta = $scope.manageSubData.subsAlertEventMeta;
            } else {
                $scope.alertData = angular.merge({}, $scope.manageSubData.basic, $scope.manageSubData.disableAlertData);
                $scope.alertMeta = $scope.manageSubData.disableAlertMeta;
            }
            $scope.alertData.subsAlertEvent = ObjValue;
            $scope.savable = false;
        });
        
        $scope.$watch('alertData.delivery', function(newVal, oldVal){
            if(newVal === null || oldVal === null) $scope.savable = false;
            else $scope.savable = true;
        })

        function isAlertController(cntrl) {
            return ctrlName.exists(cntrl);
        }
        ;
        $scope.changeActive = function (obj) {
            if ($scope.readOnlyFlag)
                return;
            obj.active = !obj.active;
        };
        $scope.readOnly = function (flag) {
            $scope.readOnlyFlag = flag;
        };
        $scope.changedevEmail = function () {
            if ($scope.readOnlyFlag)
                return;
            $scope.subData.deviceMethodEmail = !$scope.subData.deviceMethodEmail;
        }
        $scope.selectAll = function (region, check, removeRegion) {
            regionCheckUncheck = check;
            selectAllObj = {};
            regionSelected = region;
            $scope.subData.metaData.country[region].forEach(addRemoveCountries);
            $scope.selectedCountries[region] = selectAllObj;
            if (!regionCheckUncheck){
                $scope.selectedCountries[region] = null;
            }
            if (removeRegion){
                $scope.regionExcluded[region] = false;
            }
        };
        function addRemoveCountries(country) {
            selectAllObj[country.value] = {'selected': regionCheckUncheck, 'displayName': country.displayName, 'value': country.value};
            if (!$scope.countryExcluded[regionSelected]){
                $scope.countryExcluded[regionSelected] = {};
            }
            $scope.countryExcluded[regionSelected][country.value] = regionCheckUncheck;
        }
        $scope.excludeCountry = function (region, country) {
            excludedList = $scope.selectedCountries;
            if (!excludedList[region]){
                excludedList[region] = {};
            }
            excludedList[region][country.value] = {
                'displayName': country.displayName,
                'value': country.value,
                'selected': $scope.countryExcluded[region][country.value]
            };
            if (!hasCountries(excludedList[region])){
                excludedList[region] = null;
            }
            $scope.selectedCountries = excludedList;
        };
        $scope.deleteCountry = deleteCountry();
        $scope.cancel = function (tab) {
            $scope.activateTab(tab);
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
                if ($scope.selectedCountries[region] && $scope.selectedCountries[region][country]){
                    deleteObj = $scope.selectedCountries[region][country];
                    deleteObj.selected = false; //Make the selection false
                    if (!$scope.countryExcluded[region]){
                        $scope.countryExcluded[region] = {};
                    }
                    $scope.countryExcluded[region][country] = false;
                    if (!hasCountries($scope.selectedCountries[region])){
                        $scope.selectedCountries[region] = null; //Make the region null to hide the region header
                    }
                }
            };
        }

        $scope.updateSubType = function (key, displayObj, nextDrop) { //valueId is the reference in BE
            $scope.alertData[key] = displayObj.displayName;
            $scope.alertData[key + 'Id'] = displayObj.value;
            $scope.visibility = {};
            window.devType = displayObj;
            switch (nextDrop) {
                case 'category':
                    $scope.alertData.alertCategory = null;
                    $scope.alertData.alertEvent = null;
                    $scope.alertData.delivery = null;
                    $scope.alertData.messageTemplate = null;
                    $scope.alertData.applicationRoles = null;
                    $scope.alertData.selectedApplicationRoles = null;
                    $scope.alertMeta.alertCategory = displayObj.alertCategory;
                    $scope.alertMeta.alertEvent = null;
                    $scope.alertMeta.delivery = null;
                    if ($scope.alertData.subsAlertEvent === false){
                        $scope.alertData.enableAlertEvents = null;
                    }
                    break;
                case 'alertEvent':
                    $scope.alertData.alertEvent = null;
                    $scope.alertData.delivery = null;
                    $scope.alertData.messageTemplate = null;
                    $scope.alertData.applicationRoles = null;
                    $scope.alertData.selectedApplicationRoles = null;
                    $scope.alertMeta.alertEvent = displayObj.alertEvent;
                    $scope.alertMeta.delivery = null;
                    if ($scope.alertData.subsAlertEvent === false){
                        $scope.alertData.enableAlertEvents = displayObj.enableAlertEvents;
                    }
                    break;
                case 'delivery' :
                    $scope.alertData.delivery = null;
                    $scope.alertMeta.delivery = displayObj.delivery;
                    $scope.alertData.applicationRoles = displayObj.applicationRoles;
                    $scope.alertData.selectedApplicationRoles = displayObj.selectedApplicationRoles;
                    $scope.alertData.messageTemplate = displayObj.messageTemplate;
                    break;
            }
            if(key === 'alertEvent'){
                var alertStatusObj = (displayObj.delivery[0].selected === true)? displayObj.delivery[0] : displayObj.delivery[1];
                $scope.updateSubType('delivery', alertStatusObj)
            }
        };

        $scope.updatedeviceScope = function (deviceScopeObj, subObj) {

            subObj.deviceScope = deviceScopeObj.displayName;
            subObj['deviceScopeId'] = deviceScopeObj.value;
            $scope.visibility = {};
        }
        $scope.activateTab = function (tabName, subTab) {
            $scope.selectedTab = tabName;
            if (subTab === true){
                $scope.activeSubTabs = {};
                $scope.activeSubTabs[tabName] = true;
            } else {
                $scope.activeSubTabs = {};
                $scope.activeTabs = {};
                $scope.activeTabs[tabName] = true;
                if (tabName === 'mAlerts') {
                    $scope.activeSubTabs['general'] = true;
                    $scope.selectedTab = 'general';
                } else {
                    $scope.activeSubTabs['general'] = false;
                }
            }
            $scope.sortTabCol = {};
            $scope.tabSort = '';
            $scope.tabPageParams.primaryFilter = {};
            $scope.tabSelectedFilters = {};
            $scope.tabPageParams.filters = {};
            $scope.tabSearchFilters = {};
            $scope.mTabFilters = false;
            $scope.visibility = {};
            $scope.countryExcluded = {};
            $scope.selectedCountries = {};
            $scope.regionExcluded = {};
            regionCheckUncheck = true;
            sortTabParams = {};
            defaultTabSort = "asc";
            reverseTabSort = "desc";
            apiTabEndPoint;
            excludedList = {};
            function showLoaders() {
                $scope.showLoader = true;
                $scope.modalError = null;
                $scope.readOnlyFlag = true;
            }
            $scope.getTabPageData = function (pageNo) {
                var iCount = $scope.tabPageParams.itemsPerPage, 
                    offset, 
                    searchParams = {}, 
                    data = {};
                $scope.tabPageParams.total_count = 0;
                $scope.showLoader = true;
                $scope.dataTabError = '';
                offset = (pageNo > 1) ? (iCount * pageNo - iCount) : 0;
                searchParams = (Object.keys($scope.tabSearchFilters).length) ? angular.merge(getTabSearchParams($scope.tabSearchFilters), sortTabParams) : sortTabParams;
                searchParams.name = null;
                searchParams['dateFrom'] = ($scope.dateRange.from) ? $scope.dateRange.from : null;
                searchParams['dateTo'] = ($scope.dateRange.to) ? $scope.dateRange.to : null;
                if (searchParams['dateTo'] || searchParams['dateFrom']) {
                    searchParams['timeZoneOffset'] = new Date().getTimezoneOffset();
                }
                data = RoleDetails.getTabPageData(apiTabEndPoint, $scope.role, $scope.cotId, MED_API.LIMIT.ROWS, offset, searchParams, firstTime);
                data.then(function (response) {
                    $scope.showLoader = false;
                    $scope.subData = {};
                    $scope.tabPageParams.total_count = 0;
                    $scope.dataTabError = ERROR_MSGS.LOAD_ERROR;
                    // $scope.showMoreTabFilters = true;

                    if (!angular.isObject(response.data) || !Object.keys(response.data).length)
                        return;
                    $scope.subData = response.data;

                    if ((response.data.filters) && response.data.filters.length > 0){
                        $scope.showMoreTabFilters = (response.data.filters.length === 1) ? false : true;
                        $scope.tabPageParams.primaryFilter = response.data.filters.splice(0, 1)[0];
                        $scope.tabPageParams.filters = response.data.filters;
                        if(firstTime){
                            $scope.tabSearchFilters[$scope.tabPageParams.primaryFilter.name] = {};
                            $scope.tabPageParams.primaryFilter.entries.forEach(function(filter){
                                $scope.tabSearchFilters[$scope.tabPageParams.primaryFilter.name][filter.value] = filter.selected;
                            })
                            $scope.tabPageParams.filters.forEach(function(group){
                                $scope.tabSearchFilters[group.name] = {};
                                group.entries.forEach(function(filter){
                                    $scope.tabSearchFilters[group.name][filter.value] = filter.selected;
                                })
                            })
                            firstTime = false;
                        }
                    }
                    
                    if (response.data.total_count) {
                        $scope.tabPageParams.total_count = response.data.total_count;
                        $scope.tabPageParams.pageNo = (offset > $scope.tabPageParams.total_count) ? 1 : pageNo;
                    } else {
                        return;
                    }
                    
                    if (!$scope.tabPageParams.primaryFilter.entries || !$scope.tabPageParams.primaryFilter.entries.length) {
                        $scope.dataTabError = ERROR_MSGS.SERVER_ERROR;
                        return;
                    }
                    $scope.dataTabError = null;
                }, function (error) {
                    // $scope.showLoader = false;
                    $scope.subData = {};
                    $scope.tabPageParams.total_count = 0;
                    $scope.dataTabError = ERROR_MSGS.LOAD_ERROR;
                });
            };
            $scope.dateRange = {};
            switch (tabName) {
                case 'subscriptions':
                    showLoaders();
                    $scope.selectedDeviceType = null;
                    $scope.selectedCatType = null;
                    $scope.countryExcluded = {};
                    $scope.visibility = {};
                    getTabData(tabName, function (response) {
                        if (!angular.isObject(response.data) || !Object.keys(response.data).length || !angular.isObject(response.data.deviceTypes)){
                            $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                            return;
                        }
                        $scope.deviceData = response.data.deviceTypes;
                        $scope.metaData = response.data.metaData;
                        $scope.metaData.tempCountry = {};
                        var continentOrder = ['Northern America', 'Central America', 'South America', 'The Caribbean', 'Northern Africa', 'Eastern Africa', 'Middle Africa', 'Western Africa', 'Southern Africa', 'Asia', 'Oceania','Europe','European Union','Middle East']
                        continentOrder.forEach(function(continent){
                            $scope.metaData.tempCountry[continent] = $scope.metaData.country[continent];
                        })
                        $scope.metaData.country = $scope.metaData.tempCountry;
                        $scope.readOnlyPermission = response.data.readOnly;
                        $scope.subscriptionId = response.data.id;
                        $scope.showLoader = false;
                        $scope.modalError = null;
                    }, function (error) {
                        $scope.showLoader = false;
                        $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                    });
                    break;
                case 'general':
                case 'mAlerts':
                    showLoaders();
                    apiTabEndPoint = 'generalNotifications';
                    $scope.dateRange = {};
                    firstTime = true,
                    $scope.getTabPageData(1);
                    break;
                case 'templates':
                    showLoaders();
                    apiTabEndPoint = 'templates';
                    firstTime = true,
                    $scope.getTabPageData(1);
                    break;
                case 'manageSubscription':
                    showLoaders();
                    // $scope.readOnlyAlertFlag = true;
                    $scope.operationType = 1;
                    $scope.eventType = true;
                    getTabData(tabName, function (response) {
                        if (!angular.isObject(response.data) || !Object.keys(response.data.basic) || !Object.keys(response.data.basic).length){
                            $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                            return;
                        }
                        $scope.manageSubData = response.data;
                        if (response.data.basic.subsAlertEvent === true){
                            $scope.alertData = angular.merge({}, response.data.basic, response.data.subsAlertEventData);
                            $scope.alertMeta = response.data.subsAlertEventMeta;
                        } else {
                            $scope.alertData = angular.merge({}, response.data.basic, response.data.disableAlertData);
                            $scope.alertMeta = response.data.disableAlertMeta;
                        };
                        $scope.showLoader = false;
                        $scope.modalError = null;
                        loadSubData();
                    }, function (error) {
                        $scope.showLoader = false;
                        $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                    });
                    break;
                default :
                    $scope.showLoader = false;
                    break;
            }
            ;
            $scope.updateDeviceType = function (devObj) {
                $scope.selectedDeviceType = devObj.displayName;
                $scope.selectedCatType = null;
                $scope.selectedDevCategory = devObj;
                $scope.visibility = {};
            }
            $scope.updateCatType = function (catObj) {
                $scope.showLoader = true;
                $scope.selectedCatType = catObj.displayName;
                $scope.visibility = {};
                $scope.subData = catObj.cData;
                $scope.subData['deviceType'] = $scope.selectedDeviceType;
                if(!catObj.cData.excluded_countries)
                    $scope.selectedCountries = {}
                else
                    $scope.selectedCountries = catObj.cData.excluded_countries;
                $scope.subData.metaData = $scope.metaData;
                $scope.subData.id = $scope.subscriptionId;
                loadLists();
                $scope.readOnlyFlag = true;
                $scope.showLoader = false;
            }
            $scope.selectedDevCategory = {};

            $scope.showDevList = function (index, devFilters) {
                if (devFilters){
                    $scope.visibility = {};
                    $scope.visibility[index] = ($scope.visibility[index]) ? !$scope.visibility[index] : true;
                } else {
                    var tmpVisibility = ($scope.visibility[index]) ? !$scope.visibility[index] : true;
                    $scope.visibility = {};
                    $scope.visibility[index] = ($scope.readOnlyFlag) ? false : tmpVisibility;
                }
            }
            function loadSubData() {
                $scope.readOnlyAlertFlag = true;
            }
            function getTabData(tabName, success, error) {
                var getData = RoleDetails.getTabData(tabName, $scope.cotId, $scope.role);
                getData.then(success, error);
            }
            $scope.searchTabRoles = function () {
                $scope.enableTabFilterError = true;
                $scope.getTabPageData(1);
            };
            function getTabSearchParams(filterObj) {
                var sParams = {};
                angular.forEach(filterObj, function (selections, paramName) {
                    angular.forEach(selections, function (value, entry) {
                        if (value){
                            (sParams[paramName]) ? sParams[paramName].push(entry) : sParams[paramName] = [entry];
                        }
                    })
                });
                return (sParams);
            }

            $scope.saveMSub = function () {
                $scope.showLoader = true;
                RoleDetails.putData('manageSubscription', $scope.alertData, function (response) {
                    if (response.status === 200){
                        $scope.alertType = {
                            show: true,
                            class: 'success',
                            msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                        };
                        $scope.saveSuccess = true;
                        $scope.readOnlyAlertFlag = true;
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
            $scope.save = function () {
                $scope.showLoader = true;
                $scope.subData.updated_countries = $scope.selectedCountries;
                var params = angular.copy($scope.subData);
                params['metaData'] = null;
                RoleDetails.putData('subscriptions', params, function (response) {
                    if (response.status === 200){
                        $scope.alertType = {
                            show: true,
                            class: 'success',
                            msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                        };
                        $scope.saveSuccess = true;
                        if($scope.selectedTab === 'subscriptions'){
                            getTabData(tabName, function (response) {
                                $scope.deviceData = response.data.deviceTypes;
                                $scope.metaData = response.data.metaData;
                                $scope.readOnlyPermission = response.data.readOnly;
                                $scope.subscriptionId = response.data.id;
                            });
                        }
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
            $scope.closeUpdateLoader = function () {
                $scope.alertType = {show: false};
                $scope.readOnlyFlag = true;
                $scope.showLoader = false;
            }
            $scope.showList = function (index) {
                var tmpVisibility = ($scope.visibility[index]) ? !$scope.visibility[index] : true;
                $scope.visibility = {};
                $scope.visibility[index] =  tmpVisibility;
            }
            $scope.updateType = function (key, displayObj) { //valueId is the reference in BE
                $scope.alertData[key] = displayObj.displayName;
                $scope.alertData[key + 'Id'] = displayObj.value;
                $scope.visibility = {};
            };

            $scope.getTabSort = function (key) {
                var order = true; //Default Sort order
                if ($scope.sortTabCol[key])
                {
                    order = !$scope.sortTabCol[key].order;
                }
                $scope.sortTabCol = {};
                sortTabParams = {
                    order: (order) ? defaultTabSort : reverseTabSort, 
                    sort_by: key //Keys should match the API param
                }

                $scope.sortTabCol[key] = {
                    cssClass: (order) ? defaultTabSort : reverseTabSort, 
                    order: order
                };
                $scope.getTabPageData($scope.tabPageParams.pageNo);
            };

            function loadLists() {
                $scope.countryExcluded = {};
                $scope.regionExcluded = {};
                if ($scope.subData && $scope.subData.excluded_countries){
                    $scope.selectedCountries = $scope.subData.excluded_countries;
                } else {
                    return;
                }
                angular.forEach($scope.selectedCountries, function (obj, key) {
                    if (!obj)
                        return;
                    var tmpCountires = Object.keys(obj);
                    tmpCountires.map(function (x) {
                        if (!$scope.countryExcluded[key])
                        {
                            $scope.countryExcluded[key] = {};
                        }
                        $scope.countryExcluded[key][x] = true;
                    });
                });
            }

            $scope.$on('MED_COT_CHANGE', function (event, cotId) {
                cot = cotId;
                firstTime = true,
                // $scope.getTabPageData(1);
                $scope.activateTab($scope.selectedTab, true)
            });
        }
    });
    app.controller('alertsEditController', function ($scope, $log, $controller, RoleDetails, ERROR_MSGS, MED_API, $uibModalInstance) {
        var tmpRoleData = {};
        $scope.visibility = {};
        tmpRoleData = $scope.roleDetails.data[$scope.rowKey];
        $scope.alertData = angular.merge({}, tmpRoleData.basic, tmpRoleData.detail, tmpRoleData.additional);
        $scope.readOnlyPermission = $scope.roleDetails.data[$scope.rowKey].additional.readOnly;
        $scope.alertMeta = $scope.roleDetails.meta;
        $scope.showLoader = false;
        $scope.readOnlyAlertFlag = true;
                    
        if(!$scope.readOnlyPermission){
            switch($scope.roleDetails.data[$scope.rowKey].detail.statusId){
                case 1:
                case 2:
                case 3:
                    $scope.allowedStatusId = 4;
                    break;
                case 4:
                    $scope.allowedStatusId = 5;
                    break;
                case 5:
                    $scope.allowedStatusId = 6;
                    break;
                case 6:
                default:
                    $scope.allowedStatusId = null;
                    break;
            }
        };

        $scope.readOnlyAlert = function (flag) {
            $scope.readOnlyAlertFlag = flag;
        }
        $scope.cancelAlert = function () {
            $uibModalInstance.dismiss('cancel');
            $scope.alertData = null;
            $scope.readOnlyAlertFlag = true;
        };
        $scope.showList = function (index) {
            var tmpVisibility = ($scope.visibility[index]) ? !$scope.visibility[index] : true;
            $scope.visibility = {};
            $scope.visibility[index] = tmpVisibility;
        }
        $scope.closeUpdateLoader = function () {
            if ($scope.saveSuccess){
                $scope.cancelAlert();
                return;
            }
            $scope.alertType = {show: false};
            $scope.showLoader = false;
        }
        $scope.updateType = function (key, displayObj) { //valueId is the reference in BE
            $scope.alertData[key] = displayObj.displayName;
            $scope.alertData[key + 'Id'] = displayObj.value;
            $scope.visibility = {};
        };
        $scope.saveAlert = function () {
            $scope.showLoader = true;
            var params = angular.merge({}, {'cot': $scope.cotId, 'type': $scope.role}, $scope.alertData);
            RoleDetails.putData('alerts', params, function (response) {
                if (response.status === 200){
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
        };
    });
})();