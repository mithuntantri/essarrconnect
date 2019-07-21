(function() {
    'use strict';

    angular
        .module('app')
        .controller('DashboardController', DashboardController);

    DashboardController.$injector = ['$scope', '$rootScope', '$location', '$nativeDrawer', '$timeout', 'Login', 'User', 'Dashboard'];

    function DashboardController($scope, $rootScope, $location, $nativeDrawer, $timeout, Login, User, Dashboard){
        StatusBar.backgroundColorByHexString('#219787');
        StatusBar.styleLightContent();
    	
        console.log('DashboardController')
        $scope.User = User
        $scope.Dashboard = Dashboard
        console.log($scope.Dashboard.AllTargets[0][0])
        $scope.msga = $scope.Dashboard.AllTargets[0][0]
        $scope.title = 'ESSARR Employee Connect'
        $scope.showLoader = false

        $scope.all_announcements = []

        $scope.wish = 'Morning'
        let time = parseInt(moment().format("HH"))
        console.log(time)
        if(time >= 12 && time < 16){
            $scope.wish = 'Afternoon'
        }else if(time >= 16 && time <= 23){
            $scope.wish = 'Evening'
        }

        $scope.profile = User.UserDetails
        if($scope.profile.secondary_mobile)
            $scope.profile.secondary_mobile = parseInt($scope.profile.secondary_mobile)
        if($scope.profile.aadhar_number)
            $scope.profile.aadhar_number = parseInt($scope.profile.aadhar_number)
        if($scope.profile.pan_number == "null")
            $scope.profile.pan_number = ''
        if($scope.profile.bank_name == '')
            $scope.profile.bank_name = 'Karnataka Bank'

        $scope.goTo = (url)=>{
            $location.url(url)
        }

        $scope.all_paylsips = []
        _.times(3, (i)=>{
            $scope.all_paylsips.push({
                'month': moment().subtract(i+1, 'months').format("MMM YYYY")
            })
        })

        $scope.leave = {
            'reason': '',
            'description': '',
            'from_date': moment().format("DD MMM YYYY"),
            'to_date': moment().format("DD MMM YYYY"),
            'number_of_days': 1
        }

        $scope.openAddModal = (modal_name)=>{
            $scope.current_modal = modal_name
            $('#lab-slide-bottom-popup-'+modal_name).modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-'+modal_name);
        }

        $scope.closeAddModal = (modal_name)=>{
            $('#lab-slide-bottom-popup-'+modal_name).modal().hide();
        }

        if(!User.UserDetails.date_of_birth || !User.UserDetails.first_name || !User.UserDetails.last_name || !User.UserDetails.aadhar_number || !User.UserDetails.account_number || !User.UserDetails.secondary_mobile){
            $scope.openAddModal('profile')
        }

        $scope.openAnnouncements = ()=>{
            $scope.showLoader = true
            $scope.openAddModal('announcements')
            Dashboard.getAnnouncements().then((result)=>{
                $scope.showLoader = false
                if(result.data.status){
                    $scope.all_announcements = result.data.data
                }else{
                    showBottom(result.data.message)
                }
            })
        }

        $scope.updateProfile = ()=>{
            $scope.showBtnLoader = true
            Dashboard.updateProfile($scope.profile).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    $scope.closeAddModal('profile')
                    showBottom(`Profile Updated successfully`)
                }else{
                    showBottom(result.data.message)
                }
            })
        }

        $scope.addLeave = ()=>{
            $scope.showBtnLoader = true
            console.log($scope.leave)
            Dashboard.addLeave($scope.leave).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    $scope.closeAddModal('holiday')
                    showBottom(result.data.message)
                }else{
                    showBottom(result.data.message)
                }
            })
        }

        $scope.deleteLeave = (id)=>{
            $scope.showBtnLoader = true
            Dashboard.deleteLeave(id).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    showBottom(result.data.message)
                }else{
                    showBottom(result.data.message)
                }
            })
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
                    if(type == 'start'){
                        $scope.leave.from_date = moment(date).format("DD MMM YYYY")                    
                    }else if(type == 'dob'){
                        $scope.profile.date_of_birth = moment(date).format("DD MMM YYYY")                    
                    }else{
                        $scope.leave.to_date = moment(date).format("DD MMM YYYY")                    
                    }
                })
            }

            function onError(error) {
                // alert('Error: ' + error);
            }

            datePicker.show(options, onSuccess, onError)
        }

        $scope.openRewards = ()=>{
            showBottom('Rewards & Recognition will be coming soon!')
        }

        $scope.openVehicleMaintenance = ()=>{
            showBottom('Vehicle Maintenance will be coming soon')
        }

        $scope.openPayslips = ()=>{
            showBottom("Paylslips coming soon")
        }

         $scope.openMyMeetings = ()=>{
            showBottom('My Meetings will be coming soon')
        }

        $scope.punchAttendance = ()=>{
            function onSuccess(position) {
                console.log(position)
                let coords = {
                    'accuracy': position.coords.accuracy,
                    'latitude': position.coords.latitude,
                    'longitude': position.coords.longitude,
                    'altitude': position.coords.altitude,
                    'altitudeAccuracy': position.coords.altitudeAccuracy,
                    'speed': position.coords.speed,
                    'heading': position.coords.heading
                }
                Dashboard.punchAttendance(coords, position.timestamp).then((result)=>{
                    if(result.data.status){
                        showBottom('Attendance punched successfully')
                    }else{
                        showBottom(result.data.message)
                    }
                })
            }

            // onError Callback receives a [PositionError](PositionError/positionError.html) object
            //
            function onError(error) {
                alert('code: '    + error.code    + '\n' +
                      'message: ' + error.message + '\n');
            }
            navigator.geolocation.getCurrentPosition(onSuccess, onError);
        }

        $scope.downloadPayslip = (index)=>{
            showBottom(`Downloading..`)
            let data = $scope.all_paylsips[index].month.split(" ")
            Dashboard.downloadPayslip(data[0], data[1]).then((result)=>{
                $scope.closeAddModal('payslips')
                showBottom(result)
            }).catch((err)=>{
                showBottom(err)
            })
        }

        $scope.logout = ()=>{
            localStorage.removeItem('token')
            $location.url('/')
        }
    }
})()