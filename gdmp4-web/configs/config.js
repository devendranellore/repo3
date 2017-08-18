(function () {
    "use strict";
    //All the configs
    var medConfig = {
        'GENERAL_INFO': {
            'APP_NAME': 'Medtronic',
            'APP_VERSION_MAJOR': '4',
            'APP_VERSION_MINOR': '0',
            'APP_VERSION_PATCH': '0',
            'APP_VERSION_BUILD': '168',
            'APP_VERSION': '4.0.0.168.1c278e3',
            'COMMIT_HASH': '1c278e3',
            'DEBUG': true
        },
        'MED_API': {
            'BASE_URL': "https://gdmpqaprod.covidien.com/gdmp-server/web/api/",
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
            'SESSION_TIMEOUT': "Session Expired.",
             'CONFIRM_ARCHIVE': 'Do you want to archive associated configurations?'
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
