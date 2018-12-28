angular
.module('app')
.factory('tokenInterceptor', function ($q, $rootScope, $location) {
    return {
        request: function(config) {
            config.headers = config.headers || {};
            if(config.url.includes('www.googleapis.com')){
                delete config.headers.Authorization;
            }else{
                let token = localStorage.getItem('token')
                let OS_userID = localStorage.getItem('OS_userID')
                let OS_pushToken = localStorage.getItem('OS_pushToken')
                if (token) {
                    config.headers.Authorization = 'JWT '+ token
                    config.headers.OS_userID = OS_userID
                    config.headers.OS_pushToken = OS_pushToken
                }
            }
            return config || $q.when(config);
        },
        responseError: function(response) {
            if (response.status === 401) {
                localStorage.removeItem('token')
                $location.url('/')
            }else if(response.status == 502 || response.status == 500){
                $rootScope.$broadcast('reloadpage')
            }
            return response || $q.when(response);
        }
    };
})
