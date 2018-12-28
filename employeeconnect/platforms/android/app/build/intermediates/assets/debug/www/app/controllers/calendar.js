(function() {
    'use strict';

    angular
        .module('app')
        .controller('CalendarController', CalendarController);

    CalendarController.$injector = ['$scope', '$rootScope', '$location', '$nativeDrawer', '$timeout', 'Login', 'User', 'Dashboard'];

    function CalendarController($scope, $rootScope, $location, $nativeDrawer, $timeout, Login, User, Dashboard){
        StatusBar.backgroundColorByHexString('#219787');
        StatusBar.styleLightContent();
    	
        console.log('CalendarController')
        $scope.User = User
        $scope.title = 'ESSARR Employee Connect'

        $scope.all_holidays = _.filter(Dashboard.AllHolidays, (holiday)=>{
            holiday.timestamp = moment(holiday.from_date, "DD MMM YYYY")
            return holiday.timestamp > moment().unix()
        })
        console.log($scope.all_holidays)

        $scope.all_holidays = _.sortBy($scope.all_holidays, 'timestamp')
        console.log($scope.all_holidays)
    }
})()