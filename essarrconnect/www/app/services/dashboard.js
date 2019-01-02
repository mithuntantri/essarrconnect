class Dashboard{
	constructor($http, $q, $timeout){
		this.$http = $http
        this.$timeout = $timeout
        this.$q = $q
		this.features = [
             {'name': 'Manage Branches', 'selected': false},
            {'name': 'Manage Employees', 'selected': false},
            {'name': 'Manage Salary', 'selected': false},
            {'name': 'Manage Incentives', 'selected': false},
            {'name': 'Track Targets', 'selected': false},
            {'name': 'Leave Requests', 'selected': false},
            {'name': 'Holiday Chart', 'selected': false},
            {'name': 'Employee Questions', 'selected': false},
            {'name': 'Send Announcements', 'selected': false}
        ]
        this.title = ''
        this.selectedFeature = 4
        this.showDashboard(this.selectedFeature)
        this.validFormats = ['xls', 'xlsx', 'csv'];
        this.FileMessage = null
        this.theFile = null
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
    getAllCategory(){
        return this.$http({
            url: `${baseUrl}/admin/category`,
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
    getThreads(){
        return this.$http({
            url: `${baseUrl}/admin/threads`,
            method: 'GET'
        })
    }
    addThread(thread){
        return this.$http({
            url: `${baseUrl}/admin/threads`,
            method:'POST',
            data: thread
        })
    }
    updateThread(thread){
        return this.$http({
            url: `${baseUrl}/admin/threads`,
            method:'PUT',
            data: thread
        })
    }
    getAnnouncements(){
        return this.$http({
            url: `${baseUrl}/admin/announcements`,
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
    addAnnouncement(announcement){
        return this.$http({
            url: `${baseUrl}/admin/announcements`,
            method:'POST',
            data: announcement
        })
    }
    deleteHoliday(id){
        return this.$http({
            url: `${baseUrl}/admin/holidays?id=${id}`,
            method:'DELETE',
        })
    }
    getIncentives(){
        return this.$http({
            url: `${baseUrl}/admin/incentives`,
            method: 'GET'
        })
    }
    getAllLeaves(){
        return this.$http({
            url: `${baseUrl}/admin/leaves`,
            method: 'GET'
        })
    }
    updateLeave(id, status){
        return this.$http({
            url: `${baseUrl}/admin/leaves?id=${id}&status=${status}`,
            method: 'PUT',
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
    updateDeviceInfo(onesignal){
        console.log(onesignal)
        return this.$http({
            url: `${baseUrl}/login/updateDeviceInfo`,
            method: 'POST',
            data: onesignal
        })
    }
    getAllTargets(){
        return this.$http({
            url: `${baseUrl}/admin/targets`,
            method:'GET'
        })
    }

    uploadFileMF(element){
        this.temp_element = element
        console.log(this.temp_element)
    }

    uploadFile(option){
        let defer = this.$q.defer()
        this.$timeout(()=>{
          let element = this.temp_element
          this.theFile = element.files[0];
          this.FileMessage = null;
          var filename = this.theFile.name;
          var ext = filename.split(".").pop()
          var is_valid = this.validFormats.indexOf(ext) !== -1;
          var is_one = element.files.length == 1
          var is_valid_filename = this.theFile.name.length <= 128
          if(!is_valid_filename){
            this.theFile.name = option + "_" + moment().unix()
          }
          console.log(this.theFile, this.FileMessage, is_valid, is_one, is_valid_filename)
          console.log(ext, filename)
          if (is_valid && is_one && is_valid_filename){
            var data = new FormData();
            data.append('file', this.theFile);
            var token = localStorage.getItem('token')
            let url = `${baseUrl}/admin/upload?option=${option}`
            this.$http({
              url: url,
              method: 'POST',
              headers: {'Content-Type': undefined},
              data: data
            }).then((response)=>{
              if(response.data.status){
                defer.resolve()
              }else{
                defer.reject(response.data.message)
              }
            }).catch(()=>{
                defer.reject()
            })
            angular.element("input[type='file']").val(null);
          } else if(!is_valid){
            this.theFile = ''
            angular.element("input[type='file']").val(null);
            this.FileMessage = 'Please upload correct File Name, File extension is not supported';
            defer.reject()
          } else if(!is_one){
            this.theFile = ''
            angular.element("input[type='file']").val(null);
            this.FileMessage = 'Cannot upload more than one file at a time';
            defer.reject()
          } else if(!is_valid_filename){
            this.theFile = ''
            angular.element("input[type='file']").val(null);
            this.FileMessage = 'Filename cannot exceed 64 Characters';
            defer.reject()
          }
        })
        return defer.promise
    }

    downloadReport(report){
        let defer = this.$q.defer()
        var fileTransfer = new FileTransfer();
        let url = `${baseUrl}/admin/report?employee_id=${report.employee_id}&date=${report.date}`
        var uri = encodeURI(url);
        var fileURL = `file:///storage/emulated/0/download/attendance_report_${report.employee_id}(${report.date}).xlsx`
        fileTransfer.download(
            uri,
            fileURL,
            function(entry) {
                console.log("Download complete: " + entry.toURL());
                defer.resolve(`Attendance report for ${report.employee_id} downloaded Successfully`)
            },
            function(error) {
                console.log("download error source " + error.source);
                console.log("download error target " + error.target);
                console.log("download error code" + error.code);
                defer.reject("Failed to download Attendance report")
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
}

Dashboard.$inject = ['$http', '$q', '$timeout']
angular.module('app').service('Dashboard', Dashboard)