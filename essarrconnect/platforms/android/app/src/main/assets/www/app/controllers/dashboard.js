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
    	$rootScope.drawer = $nativeDrawer;
        $scope.User = User
        $scope.Dashboard = Dashboard
        $scope.selectedFeature = 4
        $scope.all_branches = []
        $scope.all_employees = []
        $scope.all_salaries = []
        $scope.all_holidays = []
        $scope.all_incentives = []
        $scope.all_announcements = []
        $scope.all_targets = []

        $scope.upload_types = [
            {name:'MSGP Retail Target'},
            {name: 'MSGA Retail Target'}, 
            {name:'Customerwise Targets'}
        ]
        $scope.selected_upload_type = $scope.upload_types[0].name

        console.log("Admin", User.AdminDetails)

        var options = {
            maxWidth: 300,
            speed: 0.2,
            animation: 'ease-out',
            topBarHeight: 56,
            modifyViewContent: true,
            useActionButton: true
        }

        $scope.branch = {
            'name' : '',
            'address': '',
            'latitude': 0.00,
            'longitude': 0.00,
            'pin_code': ''
        }

        $scope.employee = {
            'number': null,
            'designation': '',
            'department': '',
            'location': null
        }

        $scope.salary = {
            'gross_income': 0,
            'basic': 0,
            'hra': 0,
            'bank_name': '',
            'account_number': '',
            'uan_number': '',
            'epf_number': '',
            'esic_number': ''
        }

        $scope.holiday = {
            'occassion': '',
            'from_date': '',
            'to_date': ''
        }

        $scope.incentive = {
            'employee_id': null,
            'amount': 0,
            'reason': ''
        }

        $scope.announcement = {
            'title': '',
            'message': ''
        }

        $rootScope.drawer.init( options );

    	$rootScope.title = 'Essarr Admin Connect'

        $scope.features = [
            {'name': 'Manage Branches', 'selected': false},
            {'name': 'Manage Employees', 'selected': false},
            {'name': 'Manage Salary', 'selected': false},
            {'name': 'Manage Incentives', 'selected': false},
            {'name': 'Track Targets', 'selected': false},
            {'name': 'Leave Requests', 'selected': false},
            {'name': 'Holiday Chart', 'selected': false},
            {'name': 'Employee Questions', 'selected': false},
            {'name': 'Send Announcements', 'selected': false},
        ]

        $scope.features[$scope.selectedFeature].selected = true

        $scope.showDashboard = (index)=>{
            console.log("showDashboard", index)
            _.each($scope.features, (f)=>{f.selected = false})
            $scope.features[index].selected = true
            $scope.selectedFeature = index
            $rootScope.title = $scope.features[index].name
            $scope.showLoader = true
            if(index == 0){
                Dashboard.getBranches().then((result)=>{
                    $scope.showLoader = false
                    if(result.data.status){
                        $scope.all_branches = result.data.data
                    }else{
                        showBottom(result.data.message)
                    }
                })
            }else if(index == 1){
                Dashboard.getBranches().then((result)=>{
                    if(result.data.status){
                        $scope.all_branches = result.data.data
                        Dashboard.getEmployees().then((result)=>{
                            $scope.showLoader = false
                            if(result.data.status){
                                $scope.all_employees = result.data.data
                            }else{
                                showBottom(result.data.message)
                            }
                        })
                    }else{
                        showBottom(result.data.message)
                    }
                })
            }else if(index == 2){
                Dashboard.getSalaries().then((result)=>{
                    $scope.showLoader = false
                    if(result.data.status){
                        $scope.all_salaries = result.data.data
                        console.log($scope.all_salaries)
                    }else{
                        showBottom(result.data.message)
                    }
                })
            }else if(index == 3){
                Dashboard.getIncentives().then((result)=>{
                    $scope.showLoader = false
                    if(result.data.status){
                        $scope.all_incentives = result.data.data
                        Dashboard.getEmployees().then((result)=>{
                            $scope.showLoader = false
                            if(result.data.status){
                                $scope.all_employees = result.data.data
                            }else{
                                showBottom(result.data.message)
                            }
                        })
                        console.log($scope.all_incentives)
                    }else{
                        showBottom(result.data.message)
                    }
                })
            }else if(index == 4){
                Dashboard.getAllTargets().then((result)=>{
                    $scope.showLoader = false
                    if(result.data.status){
                        $scope.all_targets = result.data.data
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
            }else if(index == 5){
                Dashboard.getAllLeaves().then((result)=>{
                    $scope.showLoader = false
                    if(result.data.status){
                        $scope.all_leaves = result.data.data
                        console.log($scope.all_leaves)
                    }else{
                        showBottom(result.data.message)
                    }
                })
            }else if(index == 6){
                Dashboard.getHolidays().then((result)=>{
                    $scope.showLoader = false
                    if(result.data.status){
                        $scope.all_holidays = result.data.data
                        console.log($scope.all_holidays)
                    }else{
                        showBottom(result.data.message)
                    }
                })
            }else if(index == 8){
                Dashboard.getAnnouncements().then((result)=>{
                    $scope.showLoader = false
                    if(result.data.status){
                        $scope.all_announcements = result.data.data
                        console.log($scope.all_announcements)
                    }else{
                        showBottom(result.data.message)
                    }
                })
            }
            console.log($scope.features)    
        }

        $scope.showDashboard($scope.selectedFeature)

        $scope.logout = ()=>{
            localStorage.removeItem('token')
            $location.url('/')
        }

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

        $scope.addFeature = ()=>{
            console.log("open Modal",$scope.selectedFeature)
            if($scope.selectedFeature == 0){
                $scope.openAddLocation()
            }else if($scope.selectedFeature == 1 || $scope.selectedFeature == 2){
                $scope.openAddEmployee()
            }else if($scope.selectedFeature == 3){
                $scope.openAddIncentive()
            }else if($scope.selectedFeature == 4){
                $scope.openUploadForm()
            }else if($scope.selectedFeature == 6){
                $scope.openAddHoliday()
            }else if($scope.selectedFeature == 8){
                $scope.openAddAnnouncement()
            }
        }

        $scope.openAddIncentive = ()=>{
            $scope.current_modal = 'incentive'
            $('#lab-slide-bottom-popup-incentive').modal('show');
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-incentive');
        }

        $scope.openAddAnnouncement = ()=>{
          $scope.current_modal = 'incentive'
            $('#lab-slide-bottom-popup-announcements').modal('show');
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-announcements');
        }

        $scope.openUploadForm = ()=>{
            $scope.current_modal = 'upload'
            $('#lab-slide-bottom-popup-upload').modal('show');
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-upload');
        }

        $scope.openUpdateSalary = (index)=>{
            $scope.salary = $scope.all_salaries[index]
            $scope.current_modal = 'salary'
            $('#lab-slide-bottom-popup-salary').modal('show');
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-salary');
        }
        $scope.openAddHoliday = ()=>{
            $scope.current_modal = 'holiday'
            $('#lab-slide-bottom-popup-holiday').modal('show');
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-holiday');
        }
        $scope.openAddLocation = ()=>{
            $scope.current_modal = 'location'
            $('#lab-slide-bottom-popup-location').modal('show');
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-location');
        }

        $scope.openAddEmployee = ()=>{
            $scope.current_modal = 'employee'
            $('#lab-slide-bottom-popup-employee').modal('show');
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-employee');
        }

        $scope.closeAddLocation = ()=>{
            $('#lab-slide-bottom-popup-location').modal().hide();
        }

        $scope.closeAddIncentive = ()=>{
            $('#lab-slide-bottom-popup-incentive').modal().hide();
        }

        $scope.closeAddHolidays = ()=>{
            $('#lab-slide-bottom-popup-holiday').modal().hide();
        }

        $scope.closeAddEmployee = ()=>{
            $('#lab-slide-bottom-popup-employee').modal().hide();
        }

        $scope.closeUpdateSalary = ()=>{
            $('#lab-slide-bottom-popup-salary').modal().hide();
        }

        $scope.closeUpload = ()=>{
            $('#lab-slide-bottom-popup-upload').modal().hide();
        }

        $scope.closeAddAnnouncement = ()=>{
            $('#lab-slide-bottom-popup-announcements').modal().hide();
        }


        $scope.addBranch = ()=>{
            $scope.showBtnLoader = true
            console.log($scope.branch)
            Dashboard.addBranch($scope.branch).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    $scope.closeAddLocation()
                    $scope.showDashboard($scope.selectedFeature)
                    showBottom(result.data.message)
                }else{
                    showBottom(result.data.message)
                }
            })
        }

        $scope.addAnnouncement = ()=>{
            $scope.showBtnLoader = true
            console.log($scope.announcement)
            Dashboard.addAnnouncement($scope.announcement).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    $scope.closeAddAnnouncement()
                    $scope.showDashboard($scope.selectedFeature)
                    showBottom(result.data.message)
                }else{
                    showBottom(result.data.message)
                }
            })
        }
        

        $scope.addIncentive = ()=>{
            $scope.showBtnLoader = true
            console.log($scope.incentive)
            Dashboard.addIncentive($scope.incentive).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    $scope.closeAddIncentive()
                    $scope.showDashboard($scope.selectedFeature)
                    showBottom(result.data.message)
                }else{
                    showBottom(result.data.message)
                }
            })
        }

        $scope.addHoliday = ()=>{
            $scope.showBtnLoader = true
            console.log($scope.holiday)
            Dashboard.addHoliday($scope.holiday).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    $scope.closeAddHolidays()
                    $scope.showDashboard($scope.selectedFeature)
                    showBottom(result.data.message)
                }else{
                    showBottom(result.data.message)
                }
            })
        }

        $scope.updateSalary = ()=>{
            $scope.showBtnLoader = true
            console.log($scope.salary)
            Dashboard.updateSalary($scope.salary).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    $scope.closeUpdateSalary()
                    $scope.showDashboard($scope.selectedFeature)
                    showBottom(result.data.message)
                }else{
                    showBottom(result.data.message)
                }
            })
        }

        $scope.addEmployee = ()=>{
            $scope.showBtnLoader = true
            console.log($scope.employee)
            Dashboard.addEmployee($scope.employee).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    $scope.closeAddEmployee()
                    $scope.showDashboard($scope.selectedFeature)
                    showBottom(result.data.message)
                }else{
                    showBottom(result.data.message)
                }
            })
        }

        $scope.deleteBranch = (index)=>{
            $scope.all_branches[index].deleting = true
            Dashboard.deleteBranch($scope.all_branches[index].id).then((result)=>{
                if(result.data.status){
                    $scope.all_branches.splice(index, 1)
                    showBottom(`Branch deleted successfully`)
                }else{
                    $scope.all_branches[index].deleting = false
                    showBottom(result.data.message)
                }
            })
        }

        $scope.updateLeave = (index, status)=>{
            $scope.all_leaves[index].deleting = true
            Dashboard.updateLeave($scope.all_leaves[index].id, status).then((result)=>{
                if(result.data.status){
                    $scope.all_leaves[index].deleting = false
                    $scope.all_leaves[index].approved = status
                    showBottom(`Leave ${status == 1?'declined':'approved'} successfully`)
                }else{
                    $scope.all_leaves[index].deleting = false
                    showBottom(result.data.message)
                }
            })
        }

        $scope.deleteIncentive = (index)=>{
            $scope.all_incentives[index].deleting = true
            Dashboard.deleteIncentive($scope.all_incentives[index].id).then((result)=>{
                if(result.data.status){
                    $scope.all_incentives.splice(index, 1)
                    showBottom(`Incentive deleted successfully`)
                }else{
                    $scope.all_incentives[index].deleting = false
                    showBottom(result.data.message)
                }
            })
        }

        $scope.deleteHoliday = (index)=>{
            $scope.all_holidays[index].deleting = true
            Dashboard.deleteHoliday($scope.all_holidays[index].id).then((result)=>{
                if(result.data.status){
                    $scope.all_holidays.splice(index, 1)
                    showBottom(`Holiday deleted successfully`)
                }else{
                    $scope.all_holidays[index].deleting = false
                    showBottom(result.data.message)
                }
            })
        }

        $scope.deleteEmployee = (index)=>{
            $scope.all_employees[index].deleting = true
            Dashboard.deleteEmployee($scope.all_employees[index].id).then((result)=>{
                if(result.data.status){
                    $scope.all_employees.splice(index, 1)
                    showBottom(`Employee deleted successfully`)
                }else{
                    $scope.all_employees[index].deleting = false
                    showBottom(result.data.message)
                }
            })
        }

        $scope.uploadFileMF = (element)=>{
            Dashboard.uploadFileMF(element)
        }

        $scope.uploadTarget = ()=>{
            $scope.showBtnLoader = true
            if($scope.selected_upload_type != '' || $scope.selected_upload_type != null){
                Dashboard.uploadFile($scope.selected_upload_type).then(()=>{
                    $scope.showBtnLoader = false
                    $scope.closeUpload()
                    $scope.showDashboard($scope.selectedFeature)
                    showBottom('File Uploaded successfully')
                }).catch((err)=>{
                    $scope.showBtnLoader = false
                    if(err.code == 'ER_BAD_FIELD_ERROR'){
                        showBottom('Invalid data in uploaded file! Please rectify and try again')                        
                    }else if(err.code == 'ER_DUP_ENTRY'){
                        showBottom($scope.selected_upload_type + ' file already uploaded today')                        
                    }else{
                        showBottom('Something went wrong! Try again')                        
                    }
                })

            }else{
                $scope.showBtnLoader = false
                showBottom('Select the Upload file category')
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
                        $scope.holiday.from_date = moment(date).format("DD MMM YYYY")                    
                    }else{
                        $scope.holiday.to_date = moment(date).format("DD MMM YYYY")                    
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