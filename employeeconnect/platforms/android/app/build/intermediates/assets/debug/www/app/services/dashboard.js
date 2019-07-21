class Dashboard{
	constructor($http, $q){
		this.$http = $http
        this.$q = $q
		this.features = [
            {'name': 'Manage Branches', 'selected': false},
            {'name': 'Manage Employees', 'selected': false},
            {'name': 'Track Attendance', 'selected': false},
            {'name': 'Leave Requests', 'selected': false},
            {'name': 'Track Targets', 'selected': false},
            {'name': 'Holiday Chart', 'selected': false},
            {'name': 'Employee Questions', 'selected': false}
        ]
        this.title = ''
        this.selectedFeature = 4
        this.showDashboard(this.selectedFeature)
        this.AllHolidays = []
        this.AllLeaves = []
        this.AllTargets = []
	}
	showDashboard(index){
        console.log("showDashboard", index)
        _.each(this.features, (f)=>{f.selected = false})
        this.features[index].selected = true
        this.selectedFeature = index
        console.log(this.features)
        this.title = this.features[index].name
    }
    getBranches(){
    	return this.$http({
    		url: `${baseUrl}/admin/branches`,
    		method: 'GET'
    	})
    }
    getAllTargets(){
        return this.$http({
            url: `${baseUrl}/user/targets`,
            method:'GET'
        })
    }
    getThreads(){
        return this.$http({
            url: `${baseUrl}/user/threads`,
            method: 'GET'
        })
    }
    getSalaries(){
        return this.$http({
            url: `${baseUrl}/admin/salaries`,
            method: 'GET'
        })
    }
    addBranch(branch){
        return this.$http({
            url: `${baseUrl}/admin/branches`,
            method:'POST',
            data: branch
        })
    }
    addThread(thread){
        return this.$http({
            url: `${baseUrl}/user/threads`,
            method:'POST',
            data: thread
        })
    }
    updateThread(thread){
        return this.$http({
            url: `${baseUrl}/user/threads`,
            method:'PUT',
            data: thread
        })
    }
    addLeave(leave){
        return this.$http({
            url: `${baseUrl}/user/leaves`,
            method:'POST',
            data: leave
        })
    }
    deleteBranch(id){
        return this.$http({
            url: `${baseUrl}/admin/branches?id=${id}`,
            method:'DELETE',
        })
    }
    getEmployees(){
        return this.$http({
            url: `${baseUrl}/admin/employees`,
            method: 'GET'
        })
    }
    addEmployee(employee){
        return this.$http({
            url: `${baseUrl}/admin/employees`,
            method:'POST',
            data: employee
        })
    }
    deleteEmployee(id){
        return this.$http({
            url: `${baseUrl}/admin/employees?id=${id}`,
            method:'DELETE',
        })
    }
    updateSalary(salary){
        return this.$http({
            url: `${baseUrl}/admin/salaries`,
            method: 'POST',
            data: salary
        })
    }
    getHolidays(){
        return this.$http({
            url: `${baseUrl}/admin/holidays`,
            method: 'GET'
        })
    }
    addHoliday(holiday){
        return this.$http({
            url: `${baseUrl}/admin/holidays`,
            method:'POST',
            data: holiday
        })
    }
    deleteHoliday(id){
        return this.$http({
            url: `${baseUrl}/admin/holidays?id=${id}`,
            method:'DELETE',
        })
    }
    showBottom(message) {
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
    deleteLeave(id){
        let defer = this.$q.defer()
        this.$http({
            url: `${baseUrl}/user/leaves?id=${id}`,
            method:'DELETE'
        }).then((result)=>{
            if(result.data.status){
                this.getLeaves().then((result)=>{
                    if(result.data.status){
                        this.AllLeaves = result.data.data                    
                        this.showBottom("Leave Request deleted Successfully")
                        defer.resolve()    
                    }else{
                        this.showBottom(result.data.message)
                        defer.resolve()
                    }
                }).catch((err)=>{
                    this.showBottom(err)
                    defer.resolve()
                })
            }else{
                this.showBottom(result.data.message)
                defer.reject()
            }
        }).catch((err)=>{
            this.showBottom(err)
            defer.reject()
        })
        return defer.promise
    }
    getIncentives(){
        return this.$http({
            url: `${baseUrl}/admin/incentives`,
            method: 'GET'
        })
    }
    getLeaves(){
        return this.$http({
            url: `${baseUrl}/user/leaves`,
            method: 'GET'
        })
    }
    addIncentive(incentive){
        return this.$http({
            url: `${baseUrl}/admin/incentives`,
            method:'POST',
            data: incentive
        })
    }
    deleteIncentive(id){
        return this.$http({
            url: `${baseUrl}/admin/incentives?id=${id}`,
            method:'DELETE',
        })
    }
    punchAttendance(coords, timestamp){
        console.log(coords, timestamp)
        return this.$http({
            url: `${baseUrl}/user/attendance`,
            method: 'POST',
            data: {
                'coords': coords,
                'timestamp': timestamp
            }
        })
    }
    downloadPayslip(month, year){
        let defer = this.$q.defer()
        var fileTransfer = new FileTransfer();
        let url = `${baseUrl}/user/payslip?month=${month}&year=${year}`
        console.log(url)
        var uri = encodeURI(url);
        var fileURL = `file:///storage/emulated/0/download/payslip_${month}(${year})_${moment().unix()}.pdf`
        fileTransfer.download(
            uri,
            fileURL,
            function(entry) {
                console.log("Download complete: " + entry.toURL());
                defer.resolve(`Payslip for ${month} downloaded Successfully`)
            },
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("download error code" + error.code);
                defer.reject("Failed to download payslip")
            },
            false,
            {
                headers: {
                    "Authorization":  'JWT '+ localStorage.getItem('token')
                }
            }
        );
        return defer.promise
    }
    updateDeviceInfo(onesignal){
        console.log(onesignal)
        return this.$http({
            url: `${baseUrl}/login/updateDeviceInfo`,
            method: 'POST',
            data: onesignal
        })
    }
    updateProfile(profile){
        return this.$http({
            url: `${baseUrl}/user/profile`,
            method: 'POST',
            data: profile
        })
    }
    getAnnouncements(){
        return this.$http({
            url: `${baseUrl}/user/announcements`,
            method: 'GET'
        })
    }
}

Dashboard.$inject = ['$http', '$q']
angular.module('app').service('Dashboard', Dashboard)