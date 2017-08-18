(function () {
    'use strict';
    var app = angular.module('MedApp');
    app.controller('FeatureListController', FeatureListController);
    FeatureListController.$inject = ['$scope', '$stateParams', '$state', 'MED_API', 'ERROR_MSGS', '$uibModal', 'RoleDetails', 'ctrlName'];
    function FeatureListController($scope, $stateParams, $state, MED_API, ERROR_MSGS, $uibModal, RoleDetails, ctrlName) {
        var cot = $stateParams.cot || '', 
            sortParams = {},
            firstTime = true,
            defaultSort = "asc", 
            reverseSort = "desc";
        $scope.role = $stateParams.role;
        $scope.tab = $stateParams.tab;

        $scope.sortCol = {};
        $scope.sort = '';
        $scope.sKey = '';

        $scope.mFilters = false;

        $scope.toggleMoreFilter = function() {
            $scope.mFilters = !$scope.mFilters;
        };

        //for pagination
        $scope.roleTableParams = {
            pageNo: 1, 
            totalCount: 0, 
            itemsPerPage: MED_API.LIMIT.ROWS
        };
        $scope.roleTableParams.filters = {};
        $scope.roleTableParams.primaryFilter = {};

        $scope.selectedFilters = {};
        $scope.searchFilters = {};
        $scope.search = {};
        $scope.searchKeywords = {};

        $scope.switchTab = function (tab) {
            firstTime = true;
            $state.go('home.feature', {
                role: $stateParams.role,
                cot: cot,
                tab: tab
            });
        }

        //Create modal instance based on role
        var getModalInstance = function () {
            var ctrlName = $scope.roleSelected + 'Controller';
            var templateUrl = 'partials/feature/edit.html';
            
            if ($scope.tab) {
                ctrlName = $scope.tab + 'Controller';
                templateUrl = 'partials/feature/entitlement-edit.html';
            }

            if (!isController(ctrlName)) {
                return false;
            }

            return $uibModal.open({
                animation: true,
                templateUrl: templateUrl,
                controller: ctrlName,
                size: 'lg',
                scope: $scope,
                backdrop: 'persist'
            });
        };

        $scope.isCreate = function () {
            var tmpRole = $scope.role;
            if (tmpRole && tmpRole.toLowerCase() !== 'devices') {
                return true;
            }
            return false;
        }
        
        function isController(cntrl) {
            return ctrlName.exists(cntrl);
        }

        //To fetch the data from server
        $scope.getData = function (pageNo) {
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
            if (!$scope.tab) {
                if ($scope.search.name) searchParams.name = $scope.search.name;
                else delete searchParams.name;
                data = RoleDetails.getData($scope.role, cot, MED_API.LIMIT.ROWS, offset, searchParams, $scope.includeFilters);
            } else {
                if ($scope.searchKeywords.name) searchParams.name = $scope.searchKeywords.name;
                else delete searchParams.name;
                if ($scope.searchKeywords.deviceSN) searchParams.deviceSerialNumber = $scope.searchKeywords.deviceSN;
                else delete searchParams.deviceSerialNumber;
                data = RoleDetails.getData($scope.tab, cot, MED_API.LIMIT.ROWS, offset, searchParams, $scope.includeFilters);
            }
            data.then(function (response) {
                $scope.showLoader = false;
                $scope.roleDetails = {};
                $scope.roleTableParams.total_count = 0;
                $scope.dataError = ERROR_MSGS.LOAD_ERROR;
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
                if (!angular.isObject(response.data.data) || !Object.keys(response.data.data).length)
                    return;

                if (response.data.total_count) {
                    $scope.roleTableParams.total_count = response.data.total_count;
                    $scope.roleTableParams.pageNo = (offset > $scope.roleTableParams.total_count) ? 1 : pageNo;
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
            if(entry !== 'status'){
                var allSelected = true;
                for(var i in $scope.searchFilters[entry]){
                    if($scope.searchFilters[entry][i] === false) allSelected = false;
                }
                if(allSelected === true){
                    var index = $scope.includeFilters.indexOf(entry);
                    if(index !== -1){
                        $scope.includeFilters.splice(index, 1);
                    }
                }
            } else {
                if(Object.keys($scope.searchFilters[entry]).length == 0){
                    var index = $scope.includeFilters.indexOf(entry);
                    if(index !== -1){
                        $scope.includeFilters.splice(index, 1);
                    }
                }
            }
            $scope.enableFilterError = true;
            $scope.getData(1); //Fetching the first page
        };

        //Sorting
        $scope.getSorted = function (key) {
            var order = true; //Default Sort order
            if ($scope.sortCol[key]) {
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
            $scope.getData($scope.roleTableParams.pageNo);
        };

        //Popup for Editing
        $scope.open = function (recordIndex, roleData) {
            var tmpRoleData = {}, 
                modalInstance;
            delete $scope.status;
            if (recordIndex === 'NEW') {
                $scope.roleData = {"root": true};
                $scope.roleData.tooltip = {};
                $scope.createRecord = true;
            }
            else if (recordIndex === 'CLONE') {
                $scope.createRecord = true;
                $scope.roleData = roleData;
                $scope.roleData.cloneFrom = roleData.id;
                $scope.termSelected = true;

            }
            else {
                $scope.createRecord = false;
                tmpRoleData = $scope.roleDetails.data[recordIndex];
                //merging all the columns to a single object
                $scope.roleData = angular.merge({}, tmpRoleData.basic, tmpRoleData.detail, tmpRoleData.additional);
                if($scope.roleData.status){
                    $scope.status = $scope.roleData.status;
                }
                if($scope.roleData.formerlyInProduction && $scope.status==='Limited Release'){
                    $scope.status = 'In Production';
                }
                $scope.roleData.tooltip = ($scope.roleDetails.data[recordIndex]['tooltip']) ? $scope.roleDetails.data[recordIndex]['tooltip'] : {};
            }
            modalInstance = getModalInstance();
        };

        //Initial fetch to display the landing page
        $scope.getData($scope.roleTableParams.pageNo);
        $scope.$on('MED_COT_CHANGE', function (event, cotId) {
            cot = cotId;
            firstTime = true;
            $scope.getData(1);
            $scope.searchFilters = {};
        });
    }

    //Private Functions
    //To generate the search param from filters
    var getSearchParams = function (filterObj, selectedName) {
        var sParams = {};
        angular.forEach(filterObj, function (selections, paramName) {
            if(selectedName.indexOf(paramName) > -1 || paramName === 'status'){
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