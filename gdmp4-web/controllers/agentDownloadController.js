(function(){
	'use strict';
	var app = angular.module('MedApp')
    app.controller('AgentDownloadController', AgentDownloadController);
    AgentDownloadController.$inject = ['$scope', '$http', '$log', 'ERROR_MSGS', 'RoleDetails', 'MED_API'];
    function AgentDownloadController($scope, $http, $log, ERROR_MSGS, RoleDetails, MED_API){
    	var getAgentDownloadData = RoleDetails.agentDownloadData();
    	getAgentDownloadData.then(function(response){
    		if(response){
                if (!angular.isObject(response.data) || !Object.keys(response.data).length) {
                    $scope.data = [];
                    // $scope.showLoader = false;
                    // $scope.modalError = null;
                    // $scope.data.base_url = MED_API.BASE_URL;
                    // $log.debug("Error (No Data)");
                    $scope.modalError = ERROR_MSGS.LOAD_ERROR;
                    return;
                }
                $scope.data = response.data;
                $scope.showLoader = false;
                $scope.modalError = null;
                $scope.data.base_url = MED_API.BASE_URL;
            }
        }, function (error) {
            $scope.showLoader = false;
            $scope.modalError = ERROR_MSGS.LOAD_ERROR;
        });
    }
})();