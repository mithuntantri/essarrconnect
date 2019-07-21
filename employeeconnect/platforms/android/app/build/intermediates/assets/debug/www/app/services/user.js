class User{
	constructor($http){
		this.$http = $http
		this.UserDetails = {}
		this.AdminDetails = {}
		this.AllVehicles = []
	}
	getAdminDetails(){
		return this.$http({
			url: `${baseUrl}/user/adminDetails`,
			method: 'GET'
		})
	}
	getUserDetails(){
		return this.$http({
			url: `${baseUrl}/user/userDetails`,
			method: 'GET'
		})
	}
	getAllVehicles(){
		return this.$http({
			url: `${baseUrl}/user/getAllVehicles`,
			method: 'GET'
		})
	}
	UpdateFuel(fuel){
		return this.$http({
			url: `${baseUrl}/user/updateFuel`,
			method:"POST",
			data: fuel
		})
	}
	UpdateOilChange(oil_change){
		return this.$http({
			url: `${baseUrl}/user/updateOilChange`,
			method:"POST",
			data: oil_change
		})
	}
	UpdateService(service){
		return this.$http({
			url: `${baseUrl}/user/updateService`,
			method:"POST",
			data: service
		})
	}
	UpdateKms(kms){
		return this.$http({
			url: `${baseUrl}/user/updateKms`,
			method:"POST",
			data: kms
		})
	}
}

User.$inject = ['$http']
angular.module('app').service('User', User)