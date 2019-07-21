(function() {
    'use strict';

    angular
        .module('app')
        .controller('DashboardController', DashboardController);

    DashboardController.$injector = ['$scope', '$rootScope', '$location', '$route', '$nativeDrawer', '$timeout', 'Login', 'User', 'Dashboard'];

    function DashboardController($scope, $rootScope, $location, $route, $nativeDrawer, $timeout, Login, User, Dashboard){
        StatusBar.backgroundColorByHexString('#219787');
        StatusBar.styleLightContent();
    	
        console.log('DashboardController')
    	$rootScope.drawer = $nativeDrawer;
        $scope.User = User
        $scope.Dashboard = Dashboard
        $scope.selectedFeature = 0
        $scope.all_branches = []
        $scope.all_employees = []
        $scope.all_salaries = []
        $scope.all_holidays = []
        $scope.all_incentives = []
        $scope.all_announcements = []
        $scope.all_targets = []
        $scope.all_categories= []
        $scope.all_vehicles = []
        $scope.all_users_blocked = []
        $scope.DashboardDetails = $scope.Dashboard.DashboardDetails
        console.log($scope.DashboardDetails)

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
            'code': '',
            'name' : '',
            'address': '',
            'latitude': 0.00,
            'longitude': 0.00,
            'pin_code': ''
        }

        $scope.employee = {
            'number': null,
            'first_name': '',
            'last_name': '',
            'designation': '',
            'department': '',
            'location': null
        }

        $scope.vehicle = {
            'vehicle_number': null,
            'model': null,
            'color': null,
            'last_oil_change': 0,
            'last_service_kms': 0,
            'last_service_date': null,
            'branch_id': null
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
            'category': 'ALL',
            'message': ''
        }

        $scope.report = {
            'employee_id': null,
            'from_date': moment().subtract(1, 'days').format("DD MMM YYYY"),
            'to_date': moment().subtract(1, 'days').format("DD MMM YYYY"),
            'type': null
        }

        $rootScope.drawer.init( options );

    	$rootScope.title = 'Essarr Admin Connect'

        $scope.features = [
            {'name': 'Dashboard', 'selected': false, 'disabled': false},
            {'name': 'Manage Branches', 'selected': false, 'disabled': false},
            {'name': 'Manage Employees', 'selected': false, 'disabled': false},
            {'name': 'Manage Vehicles', 'selected': false, 'disabled': false},
            {'name': 'Manage Incentives', 'selected': false, 'disabled': false},
            {'name': 'Track Targets', 'selected': false, 'disabled': false},
            {'name': 'Leave Requests', 'selected': false, 'disabled': false},
            {'name': 'Holiday Chart', 'selected': false, 'disabled': false},
            {'name': 'Employee Questions', 'selected': false, 'disabled': false},
            {'name': 'Announcements / Notifications', 'selected': false, 'disabled': false},
            {'name': 'Download Reports', 'selected': false, 'disabled': false},
            {'name': 'Blocked Users', 'selected': false, 'disabled': false},
        ]

        if(User.AdminDetails.admin_type == 'MG'){
            _.each($scope.features, (features)=>{
                features.disabled = true
            })
            $scope.features[4].disabled = false
        }

        $scope.features[$scope.selectedFeature].selected = true

        $scope.showDashboard = (index)=>{
            $rootScope.drawer.init( options );
            console.log("showDashboard", index)
            _.each($scope.features, (f)=>{f.selected = false})
            $scope.features[index].selected = true
            $scope.selectedFeature = index
            $rootScope.title = $scope.features[index].name
            $scope.showLoader = true
            if(index == 0){
                $scope.showLoader = true
                Dashboard.getDashboardDetails().then((result)=>{
                    if(result.data.status){
                        Dashboard.DashboardDetails = result.data.data
                        $scope.DashboardDetails = result.data.data
                    }
                    $scope.showLoader = false
                })
            }else if(index == 1){
                Dashboard.getBranches().then((result)=>{
                    $scope.showLoader = false
                    if(result.data.status){
                        $scope.all_branches = result.data.data
                    }else{
                        showBottom(result.data.message)
                    }
                })
            }else if(index == 2){
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
            }else if(index == 3){
                // Dashboard.getSalaries().then((result)=>{
                //     $scope.showLoader = false
                //     if(result.data.status){
                //         $scope.all_salaries = result.data.data
                //         console.log($scope.all_salaries)
                //     }else{
                //         showBottom(result.data.message)
                //     }
                // })
                Dashboard.getBranches().then((result)=>{
                    if(result.data.status){
                        $scope.all_branches = result.data.data
                        Dashboard.getVehicles().then((result)=>{
                            $scope.showLoader = false
                            if(result.data.status){
                                $scope.all_vehicles = result.data.data
                            }else{
                                showBottom(result.data.message)
                            }
                        })
                    }else{
                        showBottom(result.data.message)
                    }
                })

            }else if(index == 4){
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
            }else if(index == 5){
                Dashboard.getEmployees().then((result)=>{
                    if(result.data.status){
                        $scope.all_employees = result.data.data
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
                    }else{
                        showBottom(result.data.message)
                    }
                })
               
            }else if(index == 6){
                Dashboard.getAllLeaves().then((result)=>{
                    $scope.showLoader = false
                    if(result.data.status){
                        $scope.all_leaves = result.data.data
                        console.log($scope.all_leaves)
                    }else{
                        showBottom(result.data.message)
                    }
                })
            }else if(index == 7){
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
                $location.url('/chat')
            }else if(index == 9){
                Dashboard.getAllCategory().then((res)=>{
                    $scope.all_categories = res.data.data
                    Dashboard.getAnnouncements().then((result)=>{
                        $scope.showLoader = false
                        if(result.data.status){
                            $scope.all_announcements = result.data.data
                            console.log($scope.all_announcements)
                        }else{
                            showBottom(result.data.message)
                        }
                    })
                })
            }else if(index == 10){
                $scope.showLoader = false
            }else if(index == 11){
                if($scope.DashboardDetails.total_blocked > 0){
                    $scope.showLoader = true
                    Dashboard.getUsersBlocked().then((res)=>{
                        $scope.all_users_blocked = res.data.data
                        $scope.showLoader = false
                    }).catch((err)=>{
                        $scope.showLoader = false
                        showBottom(`Something went wrong`)
                    })
                }else{
                    $scope.showLoader = false
                    showBottom(`No users blocked`)
                }
            }
            console.log($scope.features)    
        }

        $scope.showDashboard($scope.selectedFeature)

        $scope.logout = ()=>{
            localStorage.removeItem('token')
            $location.url('/')
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

        $scope.updateEmployee = (index)=>{
            $scope.employee = $scope.all_employees[index]
            $scope.employee.number = parseInt($scope.employee.employee_id.substring(2,8))
            $scope.employee.location = $scope.employee.location_id
            $scope.employee.update = true
            $scope.openAddEmployee()
        }

        $scope.addFeature = ()=>{
            console.log("open Modal",$scope.selectedFeature)
            if($scope.selectedFeature == 1){
                $scope.openAddLocation()
            }else if($scope.selectedFeature == 2){
                $scope.openAddEmployee()
            }else if($scope.selectedFeature == 3){
                $scope.openAddVehicle()
            }else if($scope.selectedFeature == 4){
                $scope.openAddIncentive()
            }else if($scope.selectedFeature == 5){
                $scope.openUploadForm()
            }else if($scope.selectedFeature == 7){
                $scope.openAddHoliday()
            }else if($scope.selectedFeature == 9){
                $scope.openAddAnnouncement()
            }
        }

        $scope.openAddIncentive = ()=>{
            $scope.current_modal = 'incentive'
            $('#lab-slide-bottom-popup-incentive').modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-incentive');
        }

        $scope.openAddVehicle = ()=>{
            $scope.current_modal = 'vehicle'
            $('#lab-slide-bottom-popup-vehicle').modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-vehicle');   
        }

        $scope.openAddAnnouncement = ()=>{
            console.log('announcement modal')
          $scope.current_modal = 'announcement'
            $('#lab-slide-bottom-popup-announcements').modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-announcements');
        }

        $scope.openUploadForm = ()=>{
            $scope.current_modal = 'upload'
            $('#lab-slide-bottom-popup-upload').modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-upload');
        }

        $scope.openUploadPayroll = ()=>{
            $scope.current_modal = 'upload-salary'
            $('#lab-slide-bottom-popup-upload-salary').modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-upload-salary');
        }

        $scope.openUpdateSalary = (index)=>{
            $scope.salary = $scope.all_salaries[index]
            $scope.current_modal = 'salary'
            $('#lab-slide-bottom-popup-salary').modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-salary');
        }
        $scope.openAddHoliday = ()=>{
            $scope.current_modal = 'holiday'
            $('#lab-slide-bottom-popup-holiday').modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-holiday');
        }
        $scope.openAddLocation = ()=>{
            $scope.current_modal = 'location'
            $('#lab-slide-bottom-popup-location').modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-location');
        }

        $scope.openAddEmployee = ()=>{
            $scope.current_modal = 'employee'
            $('#lab-slide-bottom-popup-employee').modal().show();
            $('.lab-slide-up').find('a').attr('data-toggle', 'modal');
            $('.lab-slide-up').find('a').attr('data-target', '#lab-slide-bottom-popup-employee');
        }

        $scope.closeAddLocation = ()=>{
            $('#lab-slide-bottom-popup-location').modal().hide();
        }

        $scope.closeAddVehicle = ()=>{
            $('#lab-slide-bottom-popup-vehicle').modal().hide();
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

        $scope.closeUploadSalary = ()=>{
            $('#lab-slide-bottom-popup-upload-salary').modal().hide();
        }

        $scope.closeAddAnnouncement = ()=>{
            $('#lab-slide-bottom-popup-announcements').modal().hide()
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

        $scope.downloadReport = (type)=>{
            if($scope.report.from_date && $scope.report.to_date){
                $scope.showBtnLoader = true
                console.log($scope.report)
                $scope.report.type = type
                showBottom(`Downloading ${type} report..`)
                Dashboard.downloadReport($scope.report).then((result)=>{
                    $scope.showBtnLoader = false
                    $scope.showDashboard($scope.selectedFeature)
                    showBottom(result)
                }).catch((err)=>{
                    $scope.showBtnLoader = false
                    showBottom(err)
                })
            }else{
                showBottom(`Please fill in all details`)
            }
           
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
            if(!$scope.employee.update){
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
            }else{
                Dashboard.updateEmployee($scope.employee).then((result)=>{
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
        }

        $scope.addVehicle = ()=>{
            $scope.showBtnLoader = true
            console.log($scope.vehicle)
            Dashboard.addVehicle($scope.vehicle).then((result)=>{
                $scope.showBtnLoader = false
                if(result.data.status){
                    $scope.closeAddVehicle()
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

         $scope.deleteVehicle = (index)=>{
            $scope.all_vehicles[index].deleting = true
            Dashboard.deleteVehicle($scope.all_vehicles[index].vehicle_number).then((result)=>{
                if(result.data.status){
                    $scope.all_vehicles.splice(index, 1)
                    showBottom(`Vehicle deleted successfully`)
                }else{
                    $scope.all_vehicles[index].deleting = false
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

        $scope.uploadFileMS = (element)=>{
            Dashboard.uploadFileMS(element)
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

        $scope.upload_payroll_months = [
            moment().subtract(1, 'month').format("MMM YYYY"),
            moment().subtract(2, 'month').format("MMM YYYY"),
            moment().subtract(3, 'month').format("MMM YYYY")
        ]

        $scope.selected_upload_payroll_month = $scope.upload_payroll_months[0]

        $scope.uploadPayroll = ()=>{
            $scope.showBtnLoader = true
            if($scope.selected_upload_payroll_month != '' || $scope.selected_upload_payroll_month != null){
                Dashboard.uploadPayrollFile('Salary', $scope.selected_upload_payroll_month).then(()=>{
                    $scope.showBtnLoader = false
                    $scope.closeUploadSalary()
                    $scope.showDashboard($scope.selectedFeature)
                    showBottom('Payroll Uploaded successfully')
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
                    }else if(type == 'report_start'){
                        $scope.report.from_date = moment(date).format("DD MMM YYYY")                    
                    }else if(type == 'report_end'){
                        $scope.report.to_date = moment(date).format("DD MMM YYYY")                    
                    }else if(type == 'service_date'){
                        $scope.vehicle.last_service_date = moment(date).format("DD MMM YYYY")                    
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

        $scope.unblockUser = (index)=>{
            Dashboard.unblockUser($scope.all_users_blocked[index].employee_id).then((result)=>{
                if(result.data.status){
                    $scope.all_users_blocked = result.data.data
                    showBottom(`User inblocked successfully`)
                }else{
                    showBottom(`Something went wrong`)
                }
            })
        }

        document.addEventListener("backbutton", onBackKeyDown, false);

        var exitApp = false, intval = setInterval(function (){exitApp = false;}, 2000);

        function onBackKeyDown(e) {
            e.preventDefault();
            if (exitApp) {
                clearInterval(intval) 
                (navigator.app && navigator.app.exitApp()) || (device && device.exitApp())
            }
            else {
                exitApp = true
                showBottom(`Press back again to exit`)
                $scope.goBackFromModal()
            } 
        }

        $scope.goBackFromModal = ()=>{
            switch($scope.current_modal){
                case 'employee':    $scope.closeAddEmployee();
                case 'salary':    $scope.closeUpdateSalary();
                case 'vehicle':    $scope.closeAddVehicle();
                case 'incentive':    $scope.closeAddIncentive();
                case 'location':    $scope.closeAddLocation();
                case 'announcement':    $scope.closeAddAnnouncement();
                case 'holiday':    $scope.closeAddHolidays();
                case 'upload':    $scope.closeUpload();
                case 'upload-salary':    $scope.closeUploadSalary();
                case 'employee':    $scope.closeAddEmployee();
                                    $scope.showDashboard($scope.selectedFeature)
                                    break;
                default:    $scope.showDashboard(0)
                            break;
            }
        }

    }
})()