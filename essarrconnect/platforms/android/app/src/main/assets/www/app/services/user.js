class User{
	constructor($http){
		this.$http = $http
		this.UserDetails = {}
		this.AdminDetails = {}
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
}

User.$inject = ['$http']
angular.module('app').service('User', User)