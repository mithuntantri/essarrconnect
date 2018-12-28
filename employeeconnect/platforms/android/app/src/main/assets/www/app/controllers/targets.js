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
                    msgp.total_target = msgp.iw_target + msgp.trade_target + msgp.mass_target + msgp.walk_target
                    $scope.msgp_target += parseFloat(msgp.total_target.toFixed(2))
                    msgp.target_as_on = msgp.iw_as_on + msgp.trade_as_on + msgp.mass_as_on + msgp.walk_as_on
                    $scope.msgp_completed += parseFloat(msgp.target_as_on.toFixed(2))
                    msgp.balance = msgp.total_target - msgp.target_as_on
                    $scope.msgp_balance += parseFloat(msgp.balance.toFixed(2))
                })
                _.each($scope.all_targets[1], (msga)=>{
                    msga.total_target = msga.cf_target + msga.mats_target + msga.mf_target + msga.sw_target + msga.wc_target + msga.bc_target
                    $scope.msga_target += parseFloat(msga.total_target.toFixed(2))
                    msga.target_as_on = msga.cf_as_on + msga.mats_as_on + msga.mf_as_on + msga.sw_as_on + msga.wc_as_on + msga.bc_as_on
                    $scope.msga_completed += parseFloat(msga.target_as_on.toFixed(2))
                    msga.balance = msga.total_target - msga.target_as_on
                    $scope.msga_balance += parseFloat(msga.balance.toFixed(2))
                })
                $scope.msgp_completed = parseFloat($scope.msgp_completed.toFixed(2))
                $scope.msga_completed = parseFloat($scope.msga_completed.toFixed(2))
                console.log($scope.all_targets)
                var a = moment().endOf('month');
                var b = moment().startOf('day');
                var remaining = a.diff(b, 'days')
                console.log("remaining", remaining)
                $scope.msgp_balance_per_day = parseFloat(($scope.msgp_balance / remaining).toFixed(2))
                $scope.msga_balance_per_day = parseFloat(($scope.msga_balance / remaining).toFixed(2))
                console.log($scope.all_targets)
            }else{
                showBottom(result.data.message)
            }
        })

    }
})()