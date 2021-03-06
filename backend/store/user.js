var hash = require('bcryptjs');
var otplib = require('otplib').default;
var jwt = require('jwt-simple');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var otplib = require('otplib').default;
var request = require('request');

if (!String.prototype.padStart) {
    String.prototype.padStart = function padStart(targetLength, padString) {
        targetLength = targetLength >> 0; //truncate if number, or convert non-number to 0;
        padString = String(typeof padString !== 'undefined' ? padString : ' ');
        if (this.length >= targetLength) {
            return String(this);
        } else {
            targetLength = targetLength - this.length;
            if (targetLength > padString.length) {
                padString += padString.repeat(targetLength / padString.length); //append to original to ensure we are longer than needed
            }
            return padString.slice(0, targetLength) + String(this);
        }
    };
    console.log(String.prototype.padStart)
}

var UserDetails = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT e.id, e.employee_id, e.first_name, e.last_name, e.date_of_birth, e.email, e.aadhar_number, e.pan_number, e.primary_mobile, e.secondary_mobile, e.bank_name, e.account_number FROM employees e WHERE e.employee_id='${username}'`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0][0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var AdminDetails = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT id, username, name, email, primary_mobile, secondary_mobile, admin_type FROM admin where username='${username}'`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			console.log(result)
			resolve(result[0][0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getBranches = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * from branches`;
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getAllAnnouncements = (username)=>{
	return new Promise((resolve, reject)=>{
		console.log("getAllAnnouncements", username)
		let query 
		if(username == 'admin'){
			query = `SELECT * FROM announcements a INNER JOIN employees e ON(a.username = e.employee_id) WHERE category='admin' OR category='All' ORDER BY timestamp DESC`
		}else{
			query = `SELECT * from announcements a INNER JOIN employees e ON (a.category = e.employee_id) WHERE e.employee_id='${username}' ORDER BY a.timestamp DESC`;			
		}
		console.log("query", query)
		sqlQuery.executeQuery([query]).then((result)=>{
			console.log(result)
			resolve(result[0])
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

var getLeaves = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * from leaves WHERE employee_id='${username}' ORDER BY timestamp DESC`;
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getAllLeaves = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT l.*, e.first_name, e.last_name, e.employee_id from leaves l INNER JOIN employees e WHERE e.employee_id=l.employee_id ORDER BY l.timestamp DESC`;
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			_.each(result[0], (res)=>{
				res.reason = reescapeHtml(res.reason)
				res.description = reescapeHtml(res.description)
			})
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}


var getIncentives = (username)=>{
	return new Promise((resolve, reject)=>{
		let current_date = moment().format("MMM YYYY")
		let query = `SELECT * from incentives i INNER JOIN employees e WHERE i.employee_id=e.employee_id AND i.date LIKE '%${current_date}'`;
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getAllCategory = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT DISTINCT(designation) FROM employees`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getEmployees = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT e.*, b.id AS branch_id, b.code, b.name, b.address, b.pin_code, b.latitude, b.longitude from employees e INNER JOIN branches b WHERE e.location_id = b.id`;
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getHolidays = (username)=>{
	return new Promise((resolve, reject)=>{
		// let current_year = moment().format("YYYY")
		let query = `SELECT * from holidays`;
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getSalaries = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * from salaries s INNER JOIN employees e WHERE s.employee_id = e.employee_id`;
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getThreads = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * from threads WHERE username='${username}' ORDER BY timestamp DESC`;
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getAllThreads = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * from threads t INNER JOIN employees e ON(t.username=e.employee_id) ORDER BY timestamp DESC`;
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var addBranch = (branch)=>{
	return new Promise((resolve, reject)=>{
		let query = `INSERT INTO branches (code, name, address, pin_code, latitude, longitude) VALUES('${branch.code.toUpperCase()}', '${branch.name}', '${branch.address}', ${branch.pin_code}, ${branch.latitude}, ${branch.longitude})`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

var addIncentive = (incentive)=>{
	return new Promise((resolve, reject)=>{
		let date = moment().format("DD MMM YYYY")
		let query = `INSERT INTO incentives (employee_id, amount, reason, date) VALUES('${incentive.employee_id}', ${incentive.amount}, '${incentive.reason}', '${date}')`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

var addHoliday = (holiday)=>{
	return new Promise((resolve, reject)=>{
		let current_year = holiday.from_date.split(" ")[2]
		let query = `INSERT INTO holidays (year, from_date, to_date, occassion) VALUES('${current_year}', '${holiday.from_date}', '${holiday.to_date}', '${holiday.occassion}')`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function reescapeHtml(unsafe) {
    return unsafe
         .replace(/&amp;/g, "&")
         .replace(/&lt;/g, "<")
         .replace(/&gt;/g, ">")
         .replace(/&quot;/g, "\"")
         .replace(/&#039;/g, "\'");
}

var addLeave = (username, leave)=>{
	return new Promise((resolve, reject)=>{
		let current_year = leave.from_date.split(" ")[2]
		let timestamp = moment().unix()
		let query = `INSERT INTO leaves (employee_id, year, from_date, to_date, reason, description, number_of_days, timestamp) VALUES('${username}', '${current_year}', '${leave.from_date}', '${leave.to_date}', '${escapeHtml(leave.reason)}', '${escapeHtml(leave.description)}', ${leave.number_of_days}, ${timestamp})`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

var addThread = (username, thread)=>{
	return new Promise((resolve, reject)=>{
		let date = moment().format("DD MMM YYYY")
		let timestamp = moment().unix()
		let query = `INSERT INTO threads (username, date, timestamp, user_message_1) VALUES('${username}', '${date}', ${timestamp}, '${escapeHtml(thread.user_message_1)}')`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

var updateThread = (username, thread)=>{
	return new Promise((resolve, reject)=>{
		let date = moment().format("DD MMM YYYY")
		let timestamp = moment().unix()
		let query = `UPDATE threads SET admin_message_1='${escapeHtml(thread.admin_message_1)}', user_message_2='${escapeHtml(thread.user_message_2)}', admin_message_2='${escapeHtml(thread.admin_message_2)}', status=${thread.status} where id=${thread.id}`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

var addEmployee = (employee)=>{
	return new Promise((resolve, reject)=>{
		console.log("Came herer")
		employee.number = "EA" + employee.number.toString()
		console.log(employee)
		let query1 = `INSERT INTO employees (employee_id, first_name, last_name, designation, location_id) VALUES('${employee.number}', '${employee.first_name}',  '${employee.last_name}', '${employee.designation}', ${employee.location})`
		let query2 = `INSERT INTO salaries (employee_id) VALUES('${employee.number}')`
		console.log(query1, query2)
		sqlQuery.executeQuery([query1, query2]).then((result)=>{
			resolve()
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

var updateEmployee = (employee)=>{
	return new Promise((resolve, reject)=>{
		console.log(employee)
		let query1 = `UPDATE employees SET first_name='${employee.first_name}', last_name='${employee.last_name}', designation='${employee.designation}', location_id=${employee.location_id} WHERE employee_id='${employee.employee_id}'`
		console.log(query1)
		sqlQuery.executeQuery([query1]).then((result)=>{
			resolve()
		}).catch((err)=>{
			console.log(err)
			reject(err)
		})
	})
}

var deleteBranch = (id)=>{
	return new Promise((resolve, reject)=>{
		let query = `DELETE FROM branches WHERE id=${id}`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var deleteVehicles = (id)=>{
	return new Promise((resolve, reject)=>{
		let query = `DELETE FROM vehicles WHERE vehicle_number='${id}'`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}


var deleteLeave = (id)=>{
	return new Promise((resolve, reject)=>{
		let query = `DELETE FROM leaves WHERE id=${id}`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var deleteEmployee = (id)=>{
	return new Promise((resolve, reject)=>{
		let query = `DELETE FROM employees WHERE id=${id}`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var deleteHoliday = (id)=>{
	return new Promise((resolve, reject)=>{
		let query = `DELETE FROM holidays WHERE id=${id}`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var deleteIncentive = (id)=>{
	return new Promise((resolve, reject)=>{
		let query = `DELETE FROM incentives WHERE id=${id}`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var updateSalary = (salary)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE salaries SET gross_income=${salary.gross_income}, basic=${salary.basic}, bank_name='${salary.bank_name}', account_number='${salary.account_number}', epf_number='${salary.epf_number}', uan_number='${salary.uan_number}', esic_number='${salary.esic_number}' WHERE employee_id='${salary.employee_id}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(`Salary updated successfully`)
		}).catch((err)=>{
			reject(err)
		})
	})
}

var updateLeave = (id, status)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE leaves SET approved=${status} WHERE id=${id}`
		sqlQuery.executeQuery([query]).then((result)=>{
			query = `SELECT * FROM leaves WHERE id=${id}`
			sqlQuery.executeQuery([query]).then((result)=>{
				resolve(result[0][0])				
			}).catch((err)=>{
				reject(err)
			})
		}).catch((err)=>{
			reject(err)
		})
	})
}

var approveAttendance = (username, position)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM employees e INNER JOIN branches b WHERE e.location_id = b.id AND e.employee_id = '${username}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			if(result[0].length > 0){
				let lat_diff = Math.abs(result[0][0].latitude - position.coords.latitude)
				let lon_diff = Math.abs(result[0][0].longitude - position.coords.longitude)
				if(lat_diff > 0.001 || lon_diff > 0.001){
					resolve(0)
				}else{
					resolve(1)
				}
			}else{
				resolve(0)
			}
		})
	})
}

var punchAttendance = (username, position)=>{
	return new Promise((resolve, reject)=>{
		approveAttendance(username, position).then((approved)=>{
			console.log(username, position)
			position.timestamp = parseInt(position.timestamp / 1000)
			let query = `INSERT INTO attendance (employee_id, timestamp, accuracy, altitude, altitudeAccuracy, heading, latitude, longitude, speed, approved) VALUES('${username}', ${position.timestamp}, ${position.coords.accuracy}, ${position.coords.altitude}, ${position.coords.altitudeAccuracy}, ${position.coords.heading}, ${position.coords.latitude}, ${position.coords.longitude}, ${position.coords.speed}, ${approved})`
			console.log(query)
			sqlQuery.executeQuery([query]).then((result)=>{
				resolve()
			}).catch((err)=>{
				reject(err)
			})
		})
	})
}

var punchLocation = (username, position)=>{
	return new Promise((resolve, reject)=>{
		approveAttendance(username, position).then((approved)=>{
			console.log(username, position)
			// position.timestamp = parseInt(position.timestamp / 1000)
			let query = `INSERT INTO locations (employee_id, timestamp, accuracy, altitude, altitudeAccuracy, heading, latitude, longitude, speed, approved) VALUES('${username}', ${position.timestamp}, ${position.coords.accuracy}, ${position.coords.altitude}, ${position.coords.altitudeAccuracy}, ${position.coords.heading}, ${position.coords.latitude}, ${position.coords.longitude}, ${position.coords.speed}, ${approved})`
			console.log(query)
			sqlQuery.executeQuery([query]).then((result)=>{
				resolve()
			}).catch((err)=>{
				reject(err)
			})
		})
	})
}

var updateProfile = (employee_id, profile)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE employees SET first_name='${profile.first_name}', last_name='${profile.last_name}', date_of_birth='${profile.date_of_birth}', secondary_mobile='${profile.secondary_mobile}', pan_number='${profile.pan_number}', aadhar_number='${profile.aadhar_number}', email='${profile.email}',bank_name='${profile.bank_name}', account_number='${profile.account_number}' WHERE employee_id='${employee_id}'`
		console.log(query)
		sqlQuery.executeQuery([query]).then(()=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var redoFetchAllTargets = (date, count)=>{
	return new Promise((resolve, reject)=>{
		if(count < 10){
			query1 = `SELECT * FROM msgp WHERE date='${date}'`
			query2 = `SELECT * FROM msga WHERE date='${date}'`
			query3 = `SELECT * FROM customerwise WHERE date='${date}'`

			sqlQuery.executeQuery([query1, query2, query3]).then((result)=>{
				console.log(result)
				result.location = 'ALL'
				if(result[0].length > 0){
					resolve(result)					
				}else{
					count++
					date = moment(date, "DD MMM YYYY").subtract(1, 'days').format("DD MMM YYYY")
					redoFetchAllTargets(date, count).then((res)=>{
						resolve(res)
					}).catch((err)=>{
						reject(err)
					})
				}
			}).catch((err)=>{
				console.log(err)
				reject(err)
			})
		}else{
			resolve(result)
		}
	})
}

var redoFetchTargets = (date, location_id, count)=>{
	return new Promise((resolve, reject)=>{
		if(count < 10){
			console.log(location_id, date)
			query1 = `SELECT * FROM msgp WHERE date='${date}' AND location_id='${location_id}'`
			query2 = `SELECT * FROM msga WHERE date='${date}' AND location_id='${location_id}'`
			query3 = `SELECT * FROM customerwise WHERE date='${date}' AND location_id='${location_id}'`

			sqlQuery.executeQuery([query1, query2, query3]).then((result)=>{
				if(result[0].length > 0){
					console.log({targets: result, as_on: date, location: location_id})
					resolve({targets: result, as_on: date, location: location_id})
				}else{
					count++
					date = moment(date, "DD MMM YYYY").subtract(1, 'days').format("DD MMM YYYY")
					redoFetchTargets(date, location_id, count).then((res)=>{
						resolve(res)
					}).catch((err)=>{
						reject(err)
					})
				}
			}).catch((err)=>{
				console.log(err)
				reject(err)
			})
		}else{
			resolve({targets: [[],[],[]], as_on: date, location: location_id})
		}
	})
}

var getAllTargets = (username, access_level)=>{
	return new Promise((resolve, reject)=>{
		console.log(username, access_level)
		let date = moment().format("DD MMM YYYY")
		let query1, query2, query3
		if(access_level == 'admin'){
			redoFetchAllTargets(date, 0).then((result)=>{
				resolve(result)
			}).catch((err)=>{
				reject(err)
			})
		}else{
			let query = `SELECT b.code FROM branches b INNER JOIN employees e WHERE e.location_id = b.id AND e.employee_id='${username}'`
			console.log(query)
			sqlQuery.executeQuery([query]).then((res)=>{
				console.log(res)
				let location_id = res[0][0].code
				redoFetchTargets(date, location_id, 0).then((result)=>{
					resolve(result)
				}).catch((err)=>{
					reject(err)
				})
			}).catch((err)=>{
				console.log(err)
				reject(err)
			})
		}
	})
}

var getLocWiseTargets = (username, access_level)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT b.name FROM branches b INNER JOIN employees e WHERE e.employee_id='${username}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			let loc = result[0][0].name
			let query1, query2, query3
			let date = moment().format("DD MMM YYYY")
			query1 = `SELECT * FROM msga WHERE date='${date}' AND location_id='${loc}'`
			query2 = `SELECT * FROM msgp WHERE date='${date} AND location_id='${loc}'`
			query3 = `SELECT * FROM customerwise WHERE date='${date}' AND location_id='${loc}'`
			sqlQuery.executeQuery([query1, query2, query3]).then((result)=>{
				resolve(result)
			}).catch((err)=>{
				reject()
			})
		}).catch((err)=>{
			reject(err)
		})
		
	})
}

var getAllBlockedUsers = ()=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT employee_id, first_name, last_name, designation, failed_login_attempts FROM employees WHERE failed_login_attempts > 2`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])			
		}).catch((err)=>{
			reject(err)
		})
	})
}

var unblockUser = (employee_id)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE employees SET failed_login_attempts=0 WHERE employee_id='${employee_id}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])			
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getDashboardData = (username, access_level)=>{
	return new Promise((resolve, reject)=>{
		let prev_month = moment().subtract(1, 'month').format("MMM YYYY")
		let query = [
			`SELECT COUNT(*) AS total_employees FROM employees WHERE status='ACTIVE'`,
			`SELECT COUNT(*) AS total_branches FROM branches`,
			`SELECT sum(gross_income) AS total_salary FROM salaries WHERE payroll_month='${prev_month}'`,
			`SELECT COUNT(*) AS total_blocked FROM employees WHERE failed_login_attempts >= 3`,
			`SELECT COUNT(*) AS total_vehicles FROM vehicles`
		]
		console.log(query)
		sqlQuery.executeQuery(query).then((result)=>{
			resolve({
				'total_employees': result[0][0].total_employees,
				'total_branches': result[1][0].total_branches,
				'payroll_month': prev_month,
				'total_salary': result[2][0].total_salary,
				'total_blocked': result[3][0].total_blocked,
				'total_vehicles': result[4][0].total_vehicles
			})
		}).catch((err)=>{
			reject(err)
		})
	})
}

var unblockUser = (employee_id)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE employees SET failed_login_attempts=0 WHERE employee_id='${employee_id}'`
		sqlQuery.executeQuery([query]).then(()=>{
			getAllBlockedUsers().then((result)=>{
				resolve(result)
			}).catch((err)=>{
				reject(err)
			})
		}).catch((err)=>{
			reject(err)
		})
	})
}

var addVehicle = (vehicle)=>{
	return new Promise((resolve, reject)=>{
		let query = `INSERT INTO vehicles VALUES('${vehicle.vehicle_number}', '${vehicle.model}', '${vehicle.color}', ${vehicle.branch_id}, ${vehicle.oil_change_kms}, ${vehicle.last_service_kms}, '${vehicle.last_service_date}')`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getVehicles = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * FROM vehicles v LEFT OUTER JOIN (select vehicle_number, opening_km, timestamp FROM vehicles_track t WHERE t.timestamp=(select max(t1.timestamp) FROM vehicles_track t1 WHERE t.vehicle_number=t1.vehicle_number GROUP BY vehicle_number)) v1 ON v.vehicle_number=v1.vehicle_number`
		sqlQuery.executeQuery([query]).then((result)=>{
			_.each(result[0], (r)=>{
				if(r.opening_km){
					r.current_kms = r.opening_km
				}else{
					r.current_kms = r.last_service_kms > r.oil_change_kms?r.last_service_kms:r.oil_change_kms
				}
				r.next_oil_change_kms = r.oil_change_kms + 1800
				r.next_service_kms = r.last_service_kms + 1800
				r.next_service_date = moment(r.last_service_date, 'DD MMM YYYY').add(75, 'days').format("DD MMM YYYY")
			})
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getAllVehicles = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT location_id, designation FROM employees WHERE employee_id='${username}'`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			console.log(result[0])
			let location_id = result[0][0].location_id
			let designation = result[0][0].designation
			query = `SELECT * FROM vehicles v LEFT OUTER JOIN (select vehicle_number, opening_km, timestamp FROM vehicles_track t WHERE t.timestamp=(select max(t1.timestamp) FROM vehicles_track t1 WHERE t.vehicle_number=t1.vehicle_number GROUP BY vehicle_number)) v1 ON v.vehicle_number=v1.vehicle_number WHERE v.branch_id=${location_id}`
			console.log(query)
			sqlQuery.executeQuery([query]).then((result)=>{
				_.each(result[0], (r)=>{
					if(r.opening_km){
						r.current_kms = r.opening_km
					}else{
						r.current_kms = r.last_service_kms > r.oil_change_kms?r.last_service_kms:r.oil_change_kms
					}
					r.designation = designation
					r.next_oil_change_kms = r.oil_change_kms + 1800
					r.next_service_kms = r.last_service_kms + 1800
					r.next_service_date = moment(r.last_service_date, 'DD MMM YYYY').add(75, 'days').format("DD MMM YYYY")
				})
				resolve(result[0])
			}).catch((err)=>{
				reject(err)
			})	
		})
	})
}

var updateFuel = (fuel)=>{
	return new Promise((resolve, reject)=>{
		let timestamp = moment(fuel.date, 'DD MMM YYYY').unix()
		let query = `INSERT INTO vehicles_refuel VALUES(NULL, '${fuel.vehicle_number}', ${timestamp}, ${fuel.kms}, ${fuel.litres})`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var updateOilChange = (oil_change)=>{
	return new Promise((resolve, reject)=>{
		let timestamp = moment(oil_change.date, 'DD MMM YYYY').unix()
		let query = `UPDATE vehicles SET oil_change_kms=${oil_change.kms} WHERE vehicle_number='${oil_change.vehicle_number}'`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var updateService = (service)=>{
	return new Promise((resolve, reject)=>{
		let timestamp = moment(service.date, 'DD MMM YYYY').unix()
		let query = `UPDATE vehicles SET last_service_kms=${service.kms}, last_service_date='${service.date}' WHERE vehicle_number='${service.vehicle_number}'`
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var updateKms = (kms)=>{
	return new Promise((resolve, reject)=>{
		let timestamp = moment().unix()
		let query = `INSERT INTO vehicles_track VALUES(NULL, '${kms.vehicle_number}', ${timestamp}, ${kms.kms})`
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

module.exports = {
	UserDetails: UserDetails,
	AdminDetails: AdminDetails,
	getBranches: getBranches,
	addBranch: addBranch,
	deleteBranch: deleteBranch,
	getEmployees: getEmployees,
	addEmployee: addEmployee,
	deleteEmployee: deleteEmployee,
	getSalaries: getSalaries,
	updateSalary: updateSalary,
	getHolidays: getHolidays,
	deleteHoliday: deleteHoliday,
	addHoliday: addHoliday,
	addIncentive: addIncentive,
	deleteIncentive: deleteIncentive,
	getIncentives: getIncentives,
	getLeaves: getLeaves,
	addLeave: addLeave,
	deleteLeave: deleteLeave,
	getAllLeaves: getAllLeaves,
	updateLeave: updateLeave,
	punchAttendance: punchAttendance,
	updateProfile: updateProfile,
	getAllTargets: getAllTargets,
	getLocWiseTargets: getLocWiseTargets,
	getAllAnnouncements: getAllAnnouncements,
	addThread: addThread,
	getThreads: getThreads,
	getAllThreads: getAllThreads,
	updateThread: updateThread,
	punchLocation: punchLocation,
	updateEmployee: updateEmployee,
	getAllCategory:getAllCategory,
	getAllBlockedUsers: getAllBlockedUsers,
	getDashboardData: getDashboardData,
	unblockUser: unblockUser,
	addVehicle: addVehicle,
	getVehicles: getVehicles,
	getAllVehicles: getAllVehicles,
	updateFuel: updateFuel,
	updateOilChange: updateOilChange,
	updateService: updateService,
	updateKms: updateKms,
	deleteVehicles: deleteVehicles
}