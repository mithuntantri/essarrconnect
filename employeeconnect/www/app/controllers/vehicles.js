(function() {
    'use strict';

    angular
        .module('app')
        .controller('VehiclesController', VehiclesController);

    VehiclesController.$injector = ['$scope', '$rootScope', '$location', '$nativeDrawer', '$timeout', 'Login', 'User', 'Dashboard'];

    function VehiclesController($scope, $rootScope, $location, $nativeDrawer, $timeout, Login, User, Dashboard){
        StatusBar.backgroundColorByHexString('#219787');
        StatusBar.styleLightContent();

        $scope.title = 'Vehicle Maintanence'
        $scope.User = User

        $scope.fuel = {
            'vehicle_number': 0,
            'kms': 0,
            'litres': 0,
            'date': moment().format("DD MMM YYYY")
        }

        $scope.oil_change = {
            'vehicle_number': 0,
            'kms': 0,
            'date': moment().format("DD MMM YYYY")
        }

        $scope.service = {
            'vehicle_number': 0,
            'kms': 0,
            'date': moment().format("DD MMM YYYY")
        }

        $scope.kms = {
            'vehicle_number': 0,
            'kms': 0,
        }

        $scope.showBtnLoader = false


        $scope.openModal = (modal_name, index)=>{
            $scope.current_modal = modal_name
            if(modal_name == 'fuel'){
                $scope.fuel.vehicle_number = User.AllVehicles[index].vehicle_number
                $scope.fuel.kms = User.AllVehicles[index].current_kms
            }else if(modal_name == 'oil'){
                $scope.oil_change.vehicle_number = User.AllVehicles[index].vehicle_number
                $scope.oil_change.kms = User.AllVehicles[index].current_kms
            }else if(modal_name == 'service'){
                $scope.service.vehicle_number = User.AllVehicles[index].vehicle_number
                $scope.service.kms = User.AllVehicles[index].current_kms
            }else if(modal_name == 'kms'){
                $scope.kms.vehicle_number = User.AllVehicles[index].vehicle_number
                $scope.kms.kms = User.AllVehicles[index].current_kms
            }
            $('#lab-slide-bottom-popup-'+modal_name).modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-'+modal_name);
        }

        $scope.closeModal = (modal_name)=>{
            $('#lab-slide-bottom-popup-'+modal_name).modal().hide();
            User.getAllVehicles().then((result)=>{
                if(result.data.status){
                    User.AllVehicles = result.data.data
                }else{
                    showBottom('Failed to fetch vehicle list')
                }
            }).catch(()=>{
                showBottom('Failed to fetch vehicle list')
            })
        }

        $scope.addFuel = ()=>{
            $scope.showBtnLoader = true
            if($scope.fuel.kms > 0 && $scope.fuel.litres > 0 && $scope.fuel.date){
                User.UpdateFuel($scope.fuel).then((result)=>{
                    $scope.showBtnLoader = false
                    $scope.closeModal('fuel')
                    if(result.data.status){
                        showBottom('Refuel updated successfully')
                    }else{
                        showBottom('Something went wrong. Please try again')
                    }
                })
            }else{
                showBottom('Please fill in all details')
            }
        }

        $scope.addOilChange = ()=>{
            $scope.showBtnLoader = true
            if($scope.oil_change.kms > 0 && $scope.oil_change.date){
                User.UpdateOilChange($scope.oil_change).then((result)=>{
                    $scope.showBtnLoader = false
                    $scope.closeModal('oil')
                    if(result.data.status){
                        showBottom('Oil Change updated successfully')
                    }else{
                        showBottom('Something went wrong. Please try again')
                    }
                })
            }else{
                showBottom('Please fill in all details')
            }
        }

        $scope.addService = ()=>{
            $scope.showBtnLoader = true
            if($scope.service.kms > 0 && $scope.service.date){
                User.UpdateService($scope.service).then((result)=>{
                    $scope.showBtnLoader = false
                    $scope.closeModal('service')
                    if(result.data.status){
                        showBottom('Vehicle Service updated successfully')
                    }else{
                        showBottom('Something went wrong. Please try again')
                    }
                })
            }else{
                showBottom('Please fill in all details')
            }
        }

        $scope.addKms = ()=>{
            $scope.showBtnLoader = true
            if($scope.kms.kms > 0){
                User.UpdateKms($scope.kms).then((result)=>{
                    $scope.showBtnLoader = false
                    $scope.closeModal('kms')
                    if(result.data.status){
                        showBottom('Vehicle Kms updated successfully')
                    }else{
                        showBottom('Something went wrong. Please try again')
                    }
                })
            }else{
                showBottom('Please fill in all details')
            }
        }

        function showBottom(message) {
            if(message){
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
        }

        $scope.showDatePicker = (type)=>{
            var options = {
                date: new Date(),
                mode: 'date', // or 'time'
                minDate: new Date(),
                allowOldDates: true,
                allowFutureDates: false,
                doneButtonLabel: 'DONE',
                doneButtonColor: '#F2F3F4',
                cancelButtonLabel: 'CANCEL',
                cancelButtonColor: '#000000'
            };
            function onSuccess(date) {
                // alert('Selected date: ' + date);
                console.log(moment(date).format("DD MMM YYYY"))
                $timeout(()=>{
                    if(type == 'fuel'){
                        $scope.fuel.date = moment(date).format("DD MMM YYYY")                    
                    }else if(type == 'oil'){
                        $scope.oil_change.date = moment(date).format("DD MMM YYYY")                    
                    }else{
                        $scope.service.date = moment(date).format("DD MMM YYYY")                    
                    }
                })
            }

            function onError(error) {
                // alert('Error: ' + error);
            }

            datePicker.show(options, onSuccess, onError)
        }
      }
})()