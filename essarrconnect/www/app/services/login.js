class Login{
	constructor($http){	
		this.$http = $http
	}

	validateToken(token){
		return this.$http({
			url: `${baseUrl}/login/validateToken`,
			method: 'POST'
		})
	}

	userLogin(data){
		data.access_level = 'admin'
		return this.$http({
			url: `${baseUrl}/login/userLogin`,
			method: 'POST',
			data: data
		})
	}

	userRegister(data){
		return this.$http({
			url: `${baseUrl}/register/userRegister`,
			method: 'POST',
			data: data
		})
	}

	verifyUser(username, otp){
		return this.$http({
			url: `${baseUrl}/register/verifyUser`,
			method: 'POST',
			data: {
				'username': username,
				'otp': otp
			}
		})
	}

	verifyLogin(username, otp){
		return this.$http({
			url: `${baseUrl}/login/verifyLogin`,
			method: 'POST',
			data: {
				'username': username,
				'otp': otp
			}
		})
	}

	setPassword(data){
		return this.$http({
			url: `${baseUrl}/register/setPassword`,
			method: 'POST',
			data: data
		})
	}
}

Login.$inject = ['$http']
angular.module('app').service('Login', Login)