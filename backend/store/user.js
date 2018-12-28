var hash = require('bcryptjs');
var otplib = require('otplib').default;
var jwt = require('jwt-simple');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var rethinkOps = require('../store/rethinkOps');
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
		let query = `SELECT id, employee_id, first_name, last_name, email, pan_number, primary_mobile, secondary_mobile FROM employees where employee_id='${username}'`
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
		let query = `SELECT id, username, name, email, primary_mobile, secondary_mobile FROM admin where username='${username}'`
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
		let query = `SELECT * from announcements`;
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getLeaves = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * from leaves WHERE employee_id='${username}'`;
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
		let query = `SELECT * from leaves`;
		console.log(query)
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}


var getIncentives = (username)=>{
	return new Promise((resolve, reject)=>{
		let current_date = moment().format("MMM YYYY")
		let query = `SELECT * from incentives WHERE date LIKE '%${current_date}'`;
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getEmployees = (username)=>{
	return new Promise((resolve, reject)=>{
		let query = `SELECT * from employees`;
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
		let query = `SELECT * from threads WHERE username='${username}'`;
		sqlQuery.executeQuery([query]).then((result)=>{
			resolve(result[0])
		}).catch((err)=>{
			reject(err)
		})
	})
}

var addBranch = (branch)=>{
	return new Promise((resolve, reject)=>{
		let query = `INSERT INTO branches (name, address, pin_code, latitude, longitude) VALUES('${branch.name}', '${branch.address}', ${branch.pin_code}, ${branch.latitude}, ${branch.longitude})`
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

var addLeave = (username, leave)=>{
	return new Promise((resolve, reject)=>{
		let current_year = leave.from_date.split(" ")[2]
		let query = `INSERT INTO leaves (employee_id, year, from_date, to_date, reason, number_of_days) VALUES('${username}', '${current_year}', '${leave.from_date}', '${leave.to_date}', '${leave.reason}', ${leave.number_of_days})`
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
		let query = `INSERT INTO threads (username, date, timestamp, user_message_1) VALUES('${username}', '${date}', ${timestamp}, '${thread.user_message_1}')`
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
		let query = `UPDATE threads SET admin_message_1='${thread.admin_message_1}', user_message_2='${thread.user_message_2}', admin_message_2='${thread.admin_message_2}' where id=${thread.id}`
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
		employee.number = "EA" + (employee.number.toString()).padStart(3, "0")
		console.log(employee)
		let query1 = `INSERT INTO employees (employee_id, designation, department, location_id) VALUES('${employee.number}', '${employee.designation}', '${employee.department}', ${employee.location})`
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
			resolve()
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

var updateProfile = (employee_id, profile)=>{
	return new Promise((resolve, reject)=>{
		let query = `UPDATE employees SET first_name='${profile.first_name}', last_name='${profile.last_name}', secondary_mobile='${profile.secondary_mobile}', pan_number='${profile.pan_number}', email='${profile.email}' WHERE employee_id='${employee_id}'`
		console.log(query)
		sqlQuery.executeQuery([query]).then(()=>{
			resolve()
		}).catch((err)=>{
			reject(err)
		})
	})
}

var getAllTargets = (username, access_level)=>{
	return new Promise((resolve, reject)=>{
		let query1, query2, query3
		let date = moment().format("DD MMM YYYY")
		query1 = `SELECT * FROM msgp WHERE date='${date}'`
		query2 = `SELECT * FROM msga WHERE date='${date}'`
		query3 = `SELECT * FROM customerwise WHERE date='${date}'`
		sqlQuery.executeQuery([query1, query2, query3]).then((result)=>{
			console.log(result)
			resolve(result)
		}).catch((err)=>{
			console.log(err)
			reject()
		})
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
	updateThread: updateThread
}