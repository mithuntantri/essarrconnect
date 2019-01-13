var hash = require('bcryptjs');
var otplib = require('otplib').default;
var jwt = require('jwt-simple');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");

var admins = [
	{
		"name": "Mithun Tantri",
		"email": "me@mithuntantri.in",
		"primary_mobile": "8867742253",
		"secondary_mobile": "",
		"username": "EAC001",
		"admin_type": "SU",
		"password": "EAC001@123"
	},
	{
		"name": "Puneeth Prasanna",
		"email": "puneeth@essarrautomotives.com",
		"primary_mobile": "8867742253",
		"secondary_mobile": "",
		"username": "EAC002",
		"admin_type": "SU",
		"password": "EAC002@puneeth"
	},
	{
		"name": "Vidya Shankar",
		"email": "vidyashankar@essarrautomotives.com",
		"primary_mobile": "8867742253",
		"secondary_mobile": "",
		"username": "EAC003",
		"admin_type": "MG",
		"password": "EAC003@345"
	}
]

var locations = [
	{
		"id": 1,
		"code": "ANE",
		"name": "Anepalya",
		"address": "No.2, Gajendra Nagar, Neelasandra, Bengaluru, Karnataka",
		"pin_code": 560027,
		"latitude": 12.950505,
		"longitude": 77.607428
	},
	{
		"id": 2,
		"code": "BNG",
		"name": "H Siddaiah Road",
		"address": "19/1-2, H Siddaiah Rd, near URVASHI THEATRE, Doddamavalli, Sudhama Nagar, Bengaluru, Karnataka",
		"pin_code": 560002,
		"latitude": 12.955754,
		"longitude": 77.584717
	},
	{
		"id": 3,
		"code": "YED",
		"name": "K R Road",
		"address": "Block D2, MM Brigade Yediyur, KR Rd, 7th Block, Jayanagar, Bengaluru, Karnataka",
		"pin_code": 560082,
		"latitude": 12.930854,
		"longitude": 77.574031
	},
	{
		"id": 4,
		"code": "CHD",
		"name": "Chitradurga",
		"address": "",
		"pin_code": 0,
		"latitude": 0,
		"longitude": 0
	},
	{
		"id": 5,
		"code": "BRG",
		"name": "Bilekahalli",
		"address": "142, 4th Cross Rd, Sundar Ram Shetty Nagar, Bilekahalli, Bengaluru, Karnataka ",
		"pin_code": 560076,
		"latitude": 12.900621,
		"longitude": 77.601379
	},
	{
		"id": 6,
		"code": "BOM",
		"name": "Bommanahalli",
		"address": "No 111/1, Hosur Main Road, Near, Begur Main Rd, Rajiv Gandhi Nagar, Bommanahalli, Bengaluru, Karnataka",
		"pin_code": 560068, 
		"latitude": 12.906769,
		"longitude": 77.629482
	},
	{
		"id": 7,
		"code": "KEN",
		"name": "Kengeri",
		"address": "1443, 11st Main Road near Hoysala circle, Gnanabharathi, Stage II, Kengeri Satellite Town, Bengaluru, Karnataka",
		"pin_code": 560060,
		"latitude": 12.925577,
		"longitude": 77.485843
	},
	{
		"id": 8,
		"code": "KNT",
		"name": "Konanakunte",
		"address": "",
		"pin_code": 0,
		"latitude": 0,
		"longitude": 0
	},
	{
		"id": 9,
		"code": "CUR",
		"name": "Old Chandapura",
		"address": "",
		"pin_code": 0,
		"latitude": 0,
		"longitude": 0
	},
	{
		"id": 10,
		"code": "VKN",
		"name": "Ramanagara",
		"address": "",
		"pin_code": 0,
		"latitude": 0,
		"longitude": 0
	},
	{
		"id": 11,
		"code": "KER",
		"name": "Tumkur",
		"address": "",
		"pin_code": 0,
		"latitude": 0,
		"longitude": 0
	},
	{
		"id": 12,
		"code": "RNA",
		"name": "Yedamadu",
		"address": "",
		"pin_code": 0,
		"latitude": 0,
		"longitude": 0
	}
]

var insertAdminValues = (admins)=>{
	return new Promise((resolve, reject)=>{
		console.log("[*] Preparing Credentials for Admin")
		let queries = []
		_.each(admins, (admin)=>{
			hash.genSalt(15, function (error, salt) {
        		hash.hash(admin.password, salt, function (err, hashed_password) {
					queries.push(`INSERT INTO admin (name, email, primary_mobile, username, password, admin_type) VALUES('${admin.name}','${admin.email}','${admin.primary_mobile}','${admin.username}', '${hashed_password}', '${admin.admin_type}')`)
					if(queries.length == admins.length){
						sqlQuery.executeQuery(queries).then((result)=>{
							resolve()			
						}).catch((err)=>{
							reject(err)
						})
					}
				})
        	})
		})
	})
}

var insertBranchValues = (branches)=>{
	return new Promise((resolve, reject)=>{
		console.log("[*] Preparing data for branches")
		let queries = []
		_.each(branches, (branch)=>{
			queries.push(`INSERT IGNORE INTO branches (id, code, name, address, pin_code, latitude, longitude) VALUES(${branch.id},'${branch.code}','${branch.name}','${branch.address}', ${branch.pin_code}, ${branch.latitude}, ${branch.longitude})`)
			if(queries.length == branches.length){
				sqlQuery.executeQuery(queries).then((result)=>{
					resolve()			
				}).catch((err)=>{
					reject(err)
				})
			}
		})
	})
}

var createAdminTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS admin (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						name VARCHAR(64) NOT NULL,
						email VARCHAR(64) NULL,
						primary_mobile VARCHAR(10) NULL,
						secondary_mobile VARCHAR(10) NULL,
						username VARCHAR(32) NOT NULL, 
						password VARCHAR(255) NOT NULL, 
						admin_type VARCHAR(2) NOT NULL,
						first_time_login boolean NOT NULL DEFAULT true,
						last_login_time VARCHAR(32), 
						failed_login_attempts INT NOT NULL DEFAULT 0,
						device_id VARCHAR(48) NULL DEFAULT NULL,
						push_token VARCHAR(256) NULL DEFAULT NULL
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			if(result[0]['warningCount'] == 0){
				insertAdminValues(admins).then(()=>{
					resolve()
				}).catch((err)=>{
					reject(err)
				})
			}else{
				resolve()				
			}
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createIWSTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS employees (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						employee_id VARCHAR(10) NOT NULL,
						first_name VARCHAR(64) NULL,
						last_name VARCHAR(64) NULL,
						email VARCHAR(64) NULL,
						designation VARCHAR(64) NULL,
						location_id INT NULL,
						date_of_birth VARCHAR(11) NULL DEFAULT NULL,
						aadhar_number VARCHAR(12) NULL DEFAULT NULL,
						pan_number VARCHAR(10) NULL DEFAULT NULL,
						primary_mobile VARCHAR(10) NULL,
						secondary_mobile VARCHAR(10) NULL,
						password VARCHAR(255) NULL, 
						first_time_login boolean NOT NULL DEFAULT true,
						last_login_time VARCHAR(32), 
						failed_login_attempts INT NOT NULL DEFAULT 0,
						device_id VARCHAR(48) NULL DEFAULT NULL,
						push_token VARCHAR(256) NULL DEFAULT NULL,
						UNIQUE(employee_id),
						UNIQUE(primary_mobile)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createBranchTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS branches (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						code VARCHAR(3) NOT NULL,
						name VARCHAR(64) NOT NULL,
						address VARCHAR(128) NULL,
						pin_code INT NULL,
						latitude FLOAT NULL,
						longitude FLOAT NULL
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
				insertBranchValues(locations).then(()=>{
					resolve()
				}).catch((err)=>{
					reject(err)
				})
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createSalaryTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS salaries (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						employee_id VARCHAR(10) NOT NULL,
						gross_income FLOAT NULL DEFAULT 0,
						basic FLOAT NULL DEFAULT 0,
						hra FLOAT NULL DEFAULT 0,
						epf_number VARCHAR(32) NULL DEFAULT 0,
						uan_number VARCHAR(32) NULL DEFAULT 0,
						esic_number VARCHAR(32) NULL DEFAULT 0,
						bank_name VARCHAR(32) NULL DEFAULT '',
						account_number VARCHAR(32) NULL DEFAULT 0,
						UNIQUE(employee_id)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}


var createHolidaysTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS holidays (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						year VARCHAR(4) NOT NULL,
						from_date VARCHAR(11) NULL DEFAULT '',
						to_date VARCHAR(11) NULL DEFAULT '',
						occassion VARCHAR(32) NULL DEFAULT ''
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createLeavesTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS leaves (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						employee_id VARCHAR(10) NOT NULL,
						year VARCHAR(4) NOT NULL,
						from_date VARCHAR(11) NULL DEFAULT '',
						to_date VARCHAR(11) NULL DEFAULT '',
						number_of_days INT NULL DEFAULT 0,
						reason VARCHAR(16) NULL DEFAULT '',
						description VARCHAR(500) NULL DEFAULT '',
						approved boolean NULL DEFAULT 0
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var alterLeavesTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `ALTER TABLE leaves ADD COLUMN timestamp INT(15) NULL DEFAULT 0`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createAttendanceTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query1 = `CREATE TABLE IF NOT EXISTS attendance (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						employee_id VARCHAR(10) NOT NULL,
						timestamp INT(15) NULL DEFAULT 0,
						accuracy FLOAT NULL DEFAULT 0,
						altitude FLOAT NULL DEFAULT 0,
						altitudeAccuracy FLOAT NULL DEFAULT 0,
						heading FLOAT NULL DEFAULT 0,
						latitude FLOAT NULL DEFAULT 0,
						longitude FLOAT NULL DEFAULT 0,
						speed FLOAT NULL DEFAULT 0,
						punch_type boolean DEFAULT 0,
						approved boolean NULL DEFAULT 0
					);`
		let query2 = `CREATE TABLE IF NOT EXISTS locations (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						employee_id VARCHAR(10) NOT NULL,
						timestamp INT(15) NULL DEFAULT 0,
						accuracy FLOAT NULL DEFAULT 0,
						altitude FLOAT NULL DEFAULT 0,
						altitudeAccuracy FLOAT NULL DEFAULT 0,
						heading FLOAT NULL DEFAULT 0,
						latitude FLOAT NULL DEFAULT 0,
						longitude FLOAT NULL DEFAULT 0,
						speed FLOAT NULL DEFAULT 0,
						punch_type boolean DEFAULT 0,
						approved boolean NULL DEFAULT 0
					);`
		sqlQuery.executeQuery([query1, query2]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}


var createIncentivesTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS incentives (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						employee_id VARCHAR(10) NOT NULL,
						amount FLOAT NULL DEFAULT 0,
						reason VARCHAR(64) NULL DEFAULT '',
						date VARCHAR(11) NULL DEFAULT ''
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}


var createMSGPTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS msgp (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						location_id VARCHAR(3) NOT NULL,
						date VARCHAR(11) NULL DEFAULT '',
						timestamp INT NULL DEFAULT NULL,
						target FLOAT NULL DEFAULT 0,
						as_on FLOAT NULL DEFAULT 0,
						balance FLOAT NULL DEFAULT 0,
						per_day FLOAT NULL DEFAULT 0,
						UNIQUE(location_id, date)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createMSGATable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS msga (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						location_id VARCHAR(3) NOT NULL,
						date VARCHAR(11) NULL DEFAULT '',
						timestamp INT NULL DEFAULT NULL,
						target FLOAT NULL DEFAULT 0,
						as_on FLOAT NULL DEFAULT 0,
						balance FLOAT NULL DEFAULT 0,
						per_day FLOAT NULL DEFAULT 0,
						UNIQUE(location_id, date)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createCustomerwiseTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS customerwise (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						location_id VARCHAR(3) NOT NULL,
						date VARCHAR(11) NULL DEFAULT '',
						timestamp INT NULL DEFAULT NULL,
						party_code VARCHAR(20) NULL DEFAULT NULL,
						party_name VARCHAR(128) NULL DEFAULT NULL,
						mobile_number VARCHAR(10) NULL DEFAULT NULL,
						type VARCHAR(10) NULL DEFAULT NULL,
						monthly_target FLOAT NULL DEFAULT 0,
						target_as_on FLOAT NULL DEFAULT 0,
						UNIQUE(location_id, date, party_code)
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createAnnouncementsTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS announcements (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						username VARCHAR(32) NOT NULL, 
						date VARCHAR(11) NULL DEFAULT '',
						timestamp INT NULL DEFAULT NULL,
						title VARCHAR(32) NOT NULL DEFAULT '',
						category VARCHAR(64) NOT NULL DEFAULT '',
						message VARCHAR(128) NOT NULL DEFAULT ''
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var createThreadsTable = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `CREATE TABLE IF NOT EXISTS threads (
						id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, 
						username VARCHAR(32) NOT NULL, 
						date VARCHAR(11) NULL DEFAULT '',
						timestamp INT NULL DEFAULT NULL,
						user_message_1 VARCHAR(500) NULL DEFAULT '',
						user_message_2 VARCHAR(500) NULL DEFAULT '',
						admin_message_1 VARCHAR(500) NULL DEFAULT '',
						admin_message_2 VARCHAR(500) NULL DEFAULT '',
						status boolean NULL DEFAULT 0
					);`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

const createTables = async () =>{
	return new Promise((resolve, reject)=>{
		console.log("[*] Creating neccessary tables (if not exists)")
		Promise.all([	createAdminTable(),
						createIWSTable(),
						createSalaryTable(),
						createBranchTable(),
						createHolidaysTable(),
						createIncentivesTable(),
						createLeavesTable(),
						createAttendanceTable(),
						createMSGPTable(),
						createMSGATable(),
						createCustomerwiseTable(),
						createAnnouncementsTable(),
						createThreadsTable(),
						// alterLeavesTable()
		]).then(()=>{
			resolve()			
		}).catch((err)=>{
			reject(err)
		})
	})
}

const createDatabase = async () =>{
	return new Promise((resolve, reject)=>{
		console.log("[*] Creating neccessary database (if not exists)")
		let database_name = process.env.TS_MYSQL_DBNAME
		let query = `CREATE DATABASE IF NOT EXISTS ${database_name}`
		sqlQuery.executeQuery([query]).then((result)=>{
			createTables().then(()=>{
				resolve()				
			})
		}).catch((err)=>{
			reject(err)
		})
	})
}

module.exports = {
	createDatabase: createDatabase,
	createTables: createTables,
	insertAdminValues: insertAdminValues
}