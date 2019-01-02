(function() {
    'use strict';

    angular
        .module('app')
        .controller('TargetsController', TargetsController);

    TargetsController.$injector = ['$scope', '$rootScope', '$location', '$nativeDrawer', '$timeout', 'Login', 'User', 'Dashboard'];

    function TargetsController($scope, $rootScope, $location, $nativeDrawer, $timeout, Login, User, Dashboard){
        StatusBar.backgroundColorByHexString('#219787');
        StatusBar.styleLightContent();

        $scope.title = 'Track Targets'
        $scope.all_targets = []
        $scope.showLoader = true

        function showBottom(message) {
        if(message)
          window.plugins.toast.showWithOptions(
            {
              message: message,
              duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
              position: "bottom",
              addPixelsY: -40  // added a negative value to move it up a bit (default 0)
            },
            function(){}, // optional
            function(){}    // optional
          );
        }

        Dashboard.getAllTargets().then((result)=>{
            $scope.showLoader = false
            if(result.data.status){
                $scope.all_targets = result.data.data.targets
                $scope.as_on = result.data.data.as_on
                $scope.location = result.data.data.location
                         $scope.msgp_target = 0
                         $scope.msgp_completed = 0
                         $scope.msgp_balance = 0
                         $scope.msga_target = 0
                         $scope.msga_completed = 0
                         $scope.msga_balance = 0
                        _.each($scope.all_targets[0], (msgp)=>{
                            msgp.total_target = msgp.target
                            $scope.msgp_target += parseFloat(msgp.total_target.toFixed(2))
                            msgp.target_as_on = msgp.as_on
                            $scope.msgp_completed += parseFloat(msgp.target_as_on.toFixed(2))
                            msgp.total_balance = msgp.balance
                            $scope.msgp_balance += parseFloat(msgp.balance.toFixed(2))
                            msgp.total_per_day = msgp.per_day
                            $scope.msgp_balance_per_day = parseFloat(msgp.total_per_day.toFixed(2))
                        })
                        _.each($scope.all_targets[1], (msga)=>{
                            msga.total_target = msga.target
                            $scope.msga_target += parseFloat(msga.total_target.toFixed(2))
                            msga.target_as_on = msga.as_on
                            $scope.msga_completed += parseFloat(msga.target_as_on.toFixed(2))
                            msga.total_balance = msga.balance
                            $scope.msga_balance += parseFloat(msga.balance.toFixed(2))
                            msga.total_per_day = msga.per_day
                            $scope.msga_balance_per_day = parseFloat(msga.total_per_day.toFixed(2))
                        })
                        $scope.msgp_completed = parseFloat($scope.msgp_completed.toFixed(2))
                        $scope.msga_completed = parseFloat($scope.msga_completed.toFixed(2))

                        $scope.msgp_target = parseFloat($scope.msgp_target.toFixed(2))
                        $scope.msga_target = parseFloat($scope.msga_target.toFixed(2))
            }else{
                showBottom(result.data.message)
            }
        })

    }
})()