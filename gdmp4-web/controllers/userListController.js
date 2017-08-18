(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('UserListController', UserListController);
    UserListController.$inject = ['$scope', '$rootScope', '$stateParams', '$state', 'MED_API', 'ERROR_MSGS', '$uibModal', 'RoleDetails', 'ctrlName'];
    function UserListController($scope, $rootScope, $stateParams, $state, MED_API, ERROR_MSGS, $uibModal, RoleDetails, ctrlName) {
        var cot = $stateParams.cot || '', 
            sortParams = {},
            firstTime = true,
            defaultSort = "asc", 
            reverseSort = "desc";
        
        $scope.tab = $stateParams.tab;
        $scope.role = $stateParams.role;
        $scope.sortCol = {};
        $scope.sKey = '';
        $scope.mFilters = false;
        //for pagination
        $scope.roleTableParams = {
            pageNo: 1, 
            totalCount: 0, 
            itemsPerPage: MED_API.LIMIT.ROWS
        };
        $scope.sort = '';
        $scope.roleTableParams.primaryFilter = {};
        $scope.selectedFilters = {};
        $scope.search = {};
        $scope.roleTableParams.filters = {};
        $scope.searchFilters = {};
        $scope.visibility = {};

        $scope.format = 'MM/dd/yyyy';
        $scope.popup1 = { opened: false };
        $scope.popup2 = { opened: false };
        $scope.dateOptions = {
            formatYear: 'yy',
            maxDate: new Date(),
            minDate: new Date(1800, 1, 1),
            startingDay: 1
        };
        $scope.open1 = function() {
            $scope.popup1.opened = true;
        };
        $scope.open2 = function() {
            $scope.popup2.opened = true;
        };
        //Create modal instance based on role
        var getModalInstance = function () {
            var ctrlName = $scope.roleSelected + 'Controller';

            if (!isController(ctrlName)){
                return false;
            }
            return $uibModal.open({
                animation: true, 
                templateUrl: 'partials/edit.html', 
                controller: ctrlName, 
                size: 'lg', 
                scope: $scope, 
                backdrop: 'static'
            });
        };
        $scope.isCreate = function () {
            var tmpRole = $scope.role;
            $rootScope.globalUsed.editPermission = false;
            if($rootScope.globals.uData) var coTMembers = angular.copy($rootScope.globals.uData.role);
            angular.forEach(coTMembers, function(value, key){
                if(value.cot_id == $rootScope.globalUsed.selectedCoT.cot_id && key == $rootScope.globalUsed.selectedCoT.cotName){
                    if(value.access.user.entitlement == "W" || value.access.user.entitlement =="A"){
                        $rootScope.globalUsed.editPermission = true;
                        //break;
                    } else if(value.access.user.entitlement == "R" || value.access.user.entitlement =="N"){
                        $rootScope.globalUsed.editPermission = false; 
                        //  break;
                    }
                }
            })
           
           
            if($rootScope.globalUsed.editPermission){
                if (tmpRole && tmpRole.toLowerCase() !== 'devices'){
                    return true;
                }
            }
            return false;
        }
        function isController(cntrl) {
            return ctrlName.exists(cntrl);
        }

        //To fetch the user data from server
        $scope.getUserData = function (pageNo) {
            var iCount = $scope.roleTableParams.itemsPerPage, 
                         offset, 
                         searchParams = {}, 
                         data = {};
            if (!$scope.includeFilters || firstTime) $scope.includeFilters = [];
            $scope.roleTableParams.total_count = 0;
            $scope.showLoader = true;
            $scope.dataError = '';
            offset = (pageNo > 1) ? (iCount * pageNo - iCount) : 0; //offset Calculation
            //Merging search filters & Sort params
            if($scope.includeFilters.length !== 0){
                searchParams = (Object.keys($scope.searchFilters).length) ? angular.merge(getSearchParams($scope.searchFilters, $scope.includeFilters), sortParams) : sortParams;
            } else if(sortParams) {
                searchParams = sortParams;
            } else {
                searchParams.include_filter = true;
            }
            if ($scope.search.name) searchParams.name = $scope.search.name;
            else delete searchParams.name
            if(searchParams.medtronic_employee!=null && searchParams.medtronic_employee.length==2){
                searchParams.medtronic_employee = null;
            }
            data = RoleDetails.getData($scope.role, cot, MED_API.LIMIT.ROWS, offset, searchParams, $scope.includeFilters);
            data.then(function (response) {
                $scope.showLoader = false;
                $scope.roleDetails = {};
                $scope.roleTableParams.total_count = 0;
                $scope.dataError = ERROR_MSGS.LOAD_ERROR;
                $scope.showMoreFilters = true;

                if (!angular.isObject(response.data.data) || !Object.keys(response.data.data).length){
                    return
                }
                $scope.roleDetails = response.data;
                if ((response.data.filters) && response.data.filters.length > 0){
                    $scope.showMoreFilters = (response.data.filters.length === 1) ? false : true;
                    $scope.roleTableParams.primaryFilter = response.data.filters.splice(0, 1)[0];
                    $scope.roleTableParams.filters = response.data.filters;
                    if(firstTime){
                        $scope.searchFilters[$scope.roleTableParams.primaryFilter.name] = {};
                        $scope.roleTableParams.primaryFilter.entries.forEach(function(filter){
                            $scope.searchFilters[$scope.roleTableParams.primaryFilter.name][filter.value] = filter.selected;
                        })
                        $scope.roleTableParams.filters.forEach(function(group){
                            $scope.searchFilters[group.name] = {};
                            group.entries.forEach(function(filter){
                                $scope.searchFilters[group.name][filter.value] = filter.selected;
                            })
                        })
                        firstTime = false;
                    }
                }
                if (response.data.total_count){
                    $scope.roleTableParams.total_count = response.data.total_count;
                    $scope.roleTableParams.pageNo = (offset > $scope.roleTableParams.total_count) ? 1 : pageNo;
                }
                if (!$scope.roleTableParams.primaryFilter.entries || !$scope.roleTableParams.primaryFilter.entries.length){
                    $scope.dataError = ERROR_MSGS.SERVER_ERROR;
                    return;
                }
                $scope.dataError = null;
            }, function (error) {
                $scope.showLoader = false;
                $scope.roleDetails = {};
                $scope.roleTableParams.total_count = 0;
                $scope.dataError = ERROR_MSGS.LOAD_ERROR;
            });
        };

        $scope.searchRoles = function (entry) {
            if(entry && $scope.includeFilters.indexOf(entry)===-1) $scope.includeFilters.push(entry);
            var allSelected = true;
            for(var i in $scope.searchFilters[entry]){
                if($scope.searchFilters[entry][i] === false) allSelected = false;
            }
            if(entry === 'medtronic_employee'){
                if($scope.searchFilters[entry].true === $scope.searchFilters[entry].false) allSelected = true;
            }
            if(allSelected === true){
                var index = $scope.includeFilters.indexOf(entry);
                if(index !== -1){
                    $scope.includeFilters.splice(index, 1);
                }
            }
            $scope.enableFilterError = true;
            $scope.getUserData(1); //Fetching the first page
        };

        $scope.showList = function (dropList) {
            var tmpVisibility = ($scope.visibility[dropList]) ? !$scope.visibility[dropList] : true;
            $scope.visibility = {};
            $scope.visibility[dropList] = (!$scope.readOnlyFlag) ? false : tmpVisibility;
        };

        //Sorting
        $scope.getSorted = function (key) {
            var order = true; //Default Sort order
            if ($scope.sortCol[key]){
                order = !$scope.sortCol[key].order;
            }
            $scope.sKey = key;
            $scope.sortCol = {};
            sortParams = {
                order: (order) ? defaultSort : reverseSort, 
                sort_by: key //Keys should match the API param
            }

            $scope.sortCol[key] = {
                cssClass: (order) ? defaultSort : reverseSort, 
                order: order
            };
            $scope.getUserData($scope.roleTableParams.pageNo);
        };

        //Popup for Editing
        $scope.open = function (recordIndex) {
            var tmpRoleData = {}, 
                modalInstance;
            if (recordIndex === 'NEW'){
                //TODO Remove after implementation of other types
                var tmpDone = ['configuration', 'document', 'feature', 'user', 'software', 'hardware'];
                if (tmpDone.indexOf($scope.role) < 0)
                    return;
                //TODO Remove after implementation of other types
                $scope.roleData = {"root": true};
                $scope.roleData.tooltip = {};
                $scope.createRecord = true;
            } else {
                $scope.createRecord = false;
                tmpRoleData = $scope.roleDetails.data[recordIndex];
                //merging all the columns to a single object
                $scope.roleData = angular.merge({}, tmpRoleData.basic, tmpRoleData.detail, tmpRoleData.additional);
                $scope.roleData.tooltip = ($scope.roleDetails.data[recordIndex]['tooltip']) ? $scope.roleDetails.data[recordIndex]['tooltip'] : {};
            }
            modalInstance = getModalInstance();
        };

        /*
         * Default Approving Proxy
         */

        $scope.approvingProxy = {};



        $scope.getDefaultApprovingProxyData = function() {
            $scope.approvingProxy = {};

            $scope.showLoader = true;
            $scope.dataError = '';

            var data = RoleDetails.metaData(cot, 'approvingproxy');
            data.then(function (response) {
                $scope.showLoader = false;
                $scope.dataError = null;
                $scope.approvingProxy = response.data.approving_proxy;
            }, function (error) {
                debugger
                $scope.dataError = ERROR_MSGS.LOAD_ERROR;
            });
        };
        $scope.cancel = function(deviceType){
            $scope.getDefaultApprovingProxyData();
            readOnly(false);
        };
        function readOnly(flag) {
            if (flag === undefined) flag = true;
            $scope.readOnlyFlag = flag;
        };
        $scope.readOnly = function (flag) {
            readOnly(flag);
        };
        $scope.closeUpdateLoader = function () {
            if ($scope.saveSuccess)
                {
                    $scope.cancel();
                    return;
                }
            $scope.alertType = {show: false};
            $scope.showLoader = false;
        }
        $scope.saveApprovingProxy = function() {
            $scope.showLoader = true;
            $scope.dataError = '';
            $scope.approvingProxyData = {};
            Object.keys($scope.approvingProxy).forEach(function(row) {
                $scope.approvingProxyData[row] = $scope.approvingProxy[row];
                if($scope.approvingProxy[row] === "") $scope.approvingProxyData[row] = null;
            });
            RoleDetails.putApprovingProxyData('approvingproxy', cot, $scope.approvingProxyData, function (response) {
                if (response.status >= 200 && response.status < 300) {
                    $scope.alertType = {
                        show: true,
                        class: 'success',
                        msg: (response.data && response.data.msg) ? response.data.msg : ERROR_MSGS.SUCCESS
                    };
                    $scope.readOnly(false);
                } else {
                    $scope.showLoader = false;
                    $scope.dataError = ERROR_MSGS.UPLOAD_ERROR;
                }
            }, function (response) {
                if(response.status===409){
                    updatePostError(response);
                }
                else {
                    $scope.showLoader = false;
                    $scope.dataError = ERROR_MSGS.UPLOAD_ERROR;
                }
            });
        };

        function updatePostError(response) {
            $scope.alertType = {
                show: true,
                class: 'danger',
                msg: "Proxy email entered doesn't exist on the system."
            };
            $scope.saveSuccess = false;
        }


        /*
         * Pending Registration
         */
        var approvingManagerSortParams = {};
        
        $scope.approvingManagerSortCol = {};
        $scope.approvingManagerSKey = '';
        //for pagination
        $scope.approvingManagerTableParams = {
            pageNo: 1, 
            totalCount: 0, 
            itemsPerPage: MED_API.LIMIT.ROWS
        };
        $scope.approvingManagerSort = '';
        $scope.searchApprovingManagerName = "";
        
        $scope.getApprovingManagerSorted = function (key) {
            var order = true; //Default Sort order
            if ($scope.approvingManagerSortCol[key]){
                order = !$scope.approvingManagerSortCol[key].order;
            }
            $scope.approvingManagerSKey = key;
            $scope.approvingManagerSortCol = {};
            approvingManagerSortParams = {
                order: (order) ? defaultSort : reverseSort, 
                sort_by: key //Keys should match the API param
            }
            $scope.approvingManagerSortCol[key] = {
                cssClass: (order) ? defaultSort : reverseSort, 
                order: order
            };
            $scope.getApprovingManagerData($scope.approvingManagerTableParams.pageNo);
        };

        $scope.searchApprovingManagerRoles = function (entry) {
            if(entry && $scope.includeFilters.indexOf(entry)===-1) $scope.includeFilters.push(entry);
            var allSelected = true;
            if(allSelected === true){
                var index = $scope.includeFilters.indexOf(entry);
                if(index !== -1){
                    $scope.includeFilters.splice(index, 1);
                }
            }
            $scope.enableFilterError = true;
            $scope.getApprovingManagerData(1); //Fetching the first page
        };

        $scope.getApprovingManagerData = function (pageNo) {
            if (!$scope.includeFilters || firstTime) $scope.includeFilters = [];
            var iCount = $scope.approvingManagerTableParams.itemsPerPage,
                offset, 
                searchParams = {},
                data = {};
            $scope.approvingManagerTableParams.total_count = 0;
            $scope.showLoader = true;
            $scope.dataError = '';
            offset = (pageNo > 1) ? (iCount * pageNo - iCount) : 0; //offset Calculation
            //Merging search filters & Sort params
            if($scope.includeFilters.length !== 0){
                searchParams = (Object.keys($scope.searchFilters).length) ? angular.merge(getSearchParams($scope.searchFilters, $scope.includeFilters), approvingManagerSortParams) : approvingManagerSortParams;
            } else if(approvingManagerSortParams) {
                searchParams = approvingManagerSortParams;
            } else {
                searchParams.include_filter = true;
            }
            if ($scope.search.name) searchParams.name = $scope.search.name;
            else delete searchParams.name;
            data = RoleDetails.getData('mdtapprovemgr', cot, MED_API.LIMIT.ROWS, offset, searchParams, $scope.includeFilters);
            data.then(function (response) {
                $scope.showLoader = false;
                $scope.approvingManagerDetails = {};
                $scope.approvingManagerTableParams.total_count = 0;
                $scope.dataError = ERROR_MSGS.LOAD_ERROR;
                $scope.showMoreFilters = true;
                $scope.approvingManagerDetails = response.data;
                for(var i in $scope.approvingManagerDetails.filters){
                    if($scope.approvingManagerDetails.filters[i].display_name === 'Country') {
                        $scope.country = $scope.approvingManagerDetails.filters[i].entries;
                        $scope.countryList = $scope.country;
                    }
                }
                if ((response.data.filters) && response.data.filters.length > 0){
                    $scope.showMoreFilters = (response.data.filters.length === 1) ? false : true;
                    $scope.approvingManagerTableParams.primaryFilter = response.data.filters.splice(0, 1)[0];
                    $scope.approvingManagerTableParams.filters = response.data.filters;
                    if(firstTime){
                        $scope.moreFilters = {};
                        $scope.searchFilters[$scope.approvingManagerTableParams.primaryFilter.name] = {};
                        $scope.approvingManagerTableParams.primaryFilter.entries.forEach(function(filter){
                            $scope.searchFilters[$scope.approvingManagerTableParams.primaryFilter.name][filter.value] = filter.selected;
                        })
                        $scope.approvingManagerTableParams.filters.forEach(function(group){
                            $scope.searchFilters[group.name] = {};
                            group.entries.forEach(function(filter){
                                $scope.searchFilters[group.name][filter.value] = filter.selected;
                            })
                        })
                        firstTime = false;
                    }
                }
                if (!angular.isObject(response.data.data) || !Object.keys(response.data.data).length)
                    return;
                if (response.data.total_count){
                    $scope.approvingManagerTableParams.total_count = response.data.total_count;
                    $scope.approvingManagerTableParams.pageNo = (offset > $scope.approvingManagerTableParams.total_count) ? 1 : pageNo;
                }
                $scope.dataError = null;
            }, function (error) {
                $scope.showLoader = false;
                $scope.approvingManagerDetails = {};
                $scope.approvingManagerTableParams.total_count = 0;
                $scope.dataError = ERROR_MSGS.LOAD_ERROR;
            });
        };

        $scope.openApprovingManager = function (recordIndex) {
            var tmpRoleData = {}, modalInstance;
            if (recordIndex === 'NEW'){
                $scope.roleData = {"root": true};
                $scope.roleData.tooltip = {};
                $scope.createRecord = true;
            } else {
                $scope.createRecord = false;
                tmpRoleData = $scope.approvingManagerDetails.data[recordIndex];
                $scope.roleData = angular.merge({}, tmpRoleData.basic, tmpRoleData.detail, tmpRoleData.additional);
                $scope.roleData.tooltip = ($scope.approvingManagerDetails.data[recordIndex]['tooltip']) ? $scope.approvingManagerDetails.data[recordIndex]['tooltip'] : {};
            }
            modalInstance = getApprovingManagerModalInstance();
        };

        var getApprovingManagerModalInstance = function () {
            return $uibModal.open({
                animation: true,
                templateUrl: 'partials/admin/edit-mdtapprovemgr.html', 
                controller: 'facilityController', 
                size: 'lg', 
                scope: $scope, 
                backdrop: 'static'
            });
        };

        /*
         * Pending Registration
         */
        var pendingRegSortParams = {};
        
        $scope.pendingRegSortCol = {};
        $scope.pendingRegSKey = '';
        $scope.mPendingRegFilters = false;
        //for pagination
        $scope.pendingRegRoleTableParams = {
            pageNo: 1, 
            totalCount: 0, 
            itemsPerPage: MED_API.LIMIT.ROWS
        };
        $scope.pendingRegSort = '';
        $scope.pendingRegRoleTableParams.primaryFilter = {};
        $scope.pendingRegSelectedFilters = {};
        $scope.searchPendingRegName = "";
        $scope.pendingRegRoleTableParams.filters = {};
        $scope.pendingRegSearchFilters = {};
        
        //To fetch the user data from server
        $scope.getPendingRegData = function (pageNo) {
            var iCount = $scope.pendingRegRoleTableParams.itemsPerPage, 
                offset, 
                searchParams = {}, 
                data = {};
            if (!$scope.includeFilters || firstTime) $scope.includeFilters = [];
            $scope.pendingRegRoleTableParams.total_count = 0;
            $scope.showLoader = true;
            $scope.dataError = '';
            offset = (pageNo > 1) ? (iCount * pageNo - iCount) : 0; //offset Calculation
            //Merging search filters & Sort params
            if($scope.includeFilters.length !== 0){
                searchParams = (Object.keys($scope.pendingRegSearchFilters).length) ? angular.merge(getSearchParams($scope.pendingRegSearchFilters, $scope.includeFilters), pendingRegSortParams) : pendingRegSortParams;
            } else if(pendingRegSortParams) {
                searchParams = pendingRegSortParams;
            } else {
                searchParams.include_filter = true;
            }

            if ($scope.searchPendingRegName) searchParams.user_name = $scope.searchPendingRegName;
            else delete searchParams.user_name;
            if ($scope.searchPendingRegFromDate) searchParams.from_register_date = convertDate($scope.searchPendingRegFromDate);
            else delete searchParams.from_register_date;
            if ($scope.searchPendingRegToDate) searchParams.to_register_date = convertDate($scope.searchPendingRegToDate);
            else delete searchParams.to_register_date

            data = RoleDetails.getData('pendingregistration', cot, MED_API.LIMIT.ROWS, offset, searchParams, $scope.includeFilters);
            data.then(function (response) {
                $scope.showLoader = false;
                $scope.pendingRegRoleDetails = {};
                $scope.pendingRegRoleTableParams.total_count = 0;
                $scope.dataError = ERROR_MSGS.LOAD_ERROR;
                $scope.showpendingRegMoreFilters = true;

                if (!angular.isObject(response.data.data) || !Object.keys(response.data.data).length)
                    return;
                $scope.pendingRegRoleDetails = response.data;

                if ((response.data.filters) && response.data.filters.length > 0){
                    $scope.showMoreFilters = (response.data.filters.length === 1) ? false : true;
                    $scope.pendingRegRoleTableParams.filters = response.data.filters;
                    if(firstTime){
                        $scope.pendingRegRoleTableParams.filters.forEach(function(group){
                            $scope.pendingRegSearchFilters[group.name] = {};
                            group.entries.forEach(function(filter){
                                $scope.pendingRegSearchFilters[group.name][filter.value] = filter.selected;
                            })
                        })
                        firstTime = false;
                    }
                }
                if (response.data.total_count){
                    $scope.pendingRegRoleTableParams.total_count = response.data.total_count;
                    $scope.pendingRegRoleTableParams.pageNo = (offset > $scope.pendingRegRoleTableParams.total_count) ? 1 : pageNo;
                }
                $scope.dataError = null;
            }, function (error) {
                $scope.showLoader = false;
                $scope.pendingRegRoleDetails = {};
                $scope.pendingRegRoleTableParams.total_count = 0;
                $scope.dataError = ERROR_MSGS.LOAD_ERROR;
            });
        };

        function convertDate(input){
            function pad(s){ return (s<10)? '0'+s : s; }
            var d = new Date(input);
            return [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate())].join('-');
        }

        $scope.searchPendingRegRoles = function (entry) {
            if(entry && $scope.includeFilters.indexOf(entry)===-1) $scope.includeFilters.push(entry);
            var allSelected = true;
            for(var i in $scope.pendingRegSearchFilters[entry]){
                if($scope.pendingRegSearchFilters[entry][i] === false) allSelected = false;
            }
            if(allSelected === true){
                var index = $scope.includeFilters.indexOf(entry);
                if(index !== -1){
                    $scope.includeFilters.splice(index, 1);
                }
            }
            $scope.enableFilterError = true;
            $scope.getPendingRegData(1); //Fetching the first page
        };

        //Sorting
        $scope.getPendingRegSorted = function (key) {
            var order = true; //Default Sort order
            if ($scope.pendingRegSortCol[key]) {
                order = !$scope.pendingRegSortCol[key].order;
            }
            $scope.sPendingRegKey = key;
            $scope.pendingRegSortCol = {};
            pendingRegSortParams = {
                order: (order) ? defaultSort : reverseSort,
                sort_by: key //Keys should match the API param
            }
            $scope.pendingRegSortCol[key] = {
                cssClass: (order) ? defaultSort : reverseSort, 
                order: order
            };
            $scope.getPendingRegData($scope.pendingRegRoleTableParams.pageNo);
        };

        //Popup for Editing
        $scope.openPendingReg = function (recordIndex) {
            var tmpRoleData = {},
                modalInstance;

            $scope.createRecord = false;
            tmpRoleData = $scope.pendingRegRoleDetails.data[recordIndex];
            //merging all the columns to a single object
            $scope.roleData = angular.merge({}, tmpRoleData.basic, tmpRoleData.detail, tmpRoleData.additional);
            $scope.roleData.tooltip = ($scope.pendingRegRoleDetails.data[recordIndex]['tooltip']) ? $scope.pendingRegRoleDetails.data[recordIndex]['tooltip'] : {};

            modalInstance = getPendingRegModalInstance();
        };

        //Create modal instance based on role
        var getPendingRegModalInstance = function () {
            var ctrlName = 'PendingRegistrationController';

            if (!isController(ctrlName)){
                return false;
            }

            return $uibModal.open({
                animation: true, 
                templateUrl: 'partials/user/edit-pending-reg.html', 
                controller: ctrlName, 
                size: 'big', 
                scope: $scope, 
                backdrop: 'static'
            });
        };

        $scope.switchTab = function(tab) {
            firstTime = true;
            $scope.searchFilters = {};
            $scope.tab = tab;
            if ($scope.tab === 'defaultApprovingProxy') {
                $scope.getDefaultApprovingProxyData();
            }
            else if ($scope.tab === 'approvingManager') {
                $scope.getApprovingManagerData($scope.approvingManagerTableParams.pageNo);
            }
            else if ($scope.tab === 'pendingRegistration') {
                $scope.getPendingRegData($scope.pendingRegRoleTableParams.pageNo);
            }
            else {
                //Initial fetch to display the landing page
                $scope.getUserData($scope.roleTableParams.pageNo);
            }
        };

        $scope.switchTab($scope.tab);

        $scope.$on('MED_COT_CHANGE', function (event, cotId) {
            cot = cotId;
            firstTime = true;
            $scope.switchTab($scope.tab);
            $scope.searchFilters = {};
        });
    }
    //Private Functions
    //To generate the search param from filters
    var getSearchParams = function (filterObj, selectedName) {
        var sParams = {};
        angular.forEach(filterObj, function (selections, paramName) {
            if(selectedName.indexOf(paramName) > -1){
                angular.forEach(selections, function (value, entry) {
                    if (value){
                        (sParams[paramName]) ? sParams[paramName].push(entry) : sParams[paramName] = [entry];
                    }
                })
            }
        });
        return (sParams);
    }
})();