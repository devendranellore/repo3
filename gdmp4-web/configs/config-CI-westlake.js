(function () {
    "use strict";
    //All the configs
    var medConfig = {
        'GENERAL_INFO': {
            'APP_NAME': 'Medtronic',
            'APP_VERSION': 'V1.1.8',
            'DEBUG': true
        },
        'MED_API': {
            'BASE_URL': "http://gdmp.hz.insigmaus.com:8080/gdmp-server/web/api/",
            'LIMIT': {
                'ROWS': 10
            },
			'SESSION_TIMEOUT' : 1800000
        },
        'ERROR_MSGS': {
            'NO_ROLE': "You are not authorized.",
            'ERROR': 'Some error has occurred.',
            'SERVER_ERROR': 'Unable to load data.',
            'SERVER_LOAD_ERROR': 'Error!! Unable to load  data.',
            'LOAD_ERROR': "No Data.",
            'UPLOAD_ERROR': "Error!! Please try again.",
            'SUCCESS': 'Success!! The changes have been saved.',
            'SESSION_TIMEOUT': "Session Expired."
        }

    };

    var app = angular.module('MedApp');
    angular.forEach(medConfig, function (key, value) {
        app.constant(value, key);
    })
    app.config(function ($logProvider) {
        $logProvider.debugEnabled(medConfig.GENERAL_INFO.DEBUG);
    });
})();
