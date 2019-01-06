var xlsx = require('node-xlsx');
var fs = require('fs');
var csv=require('csvtojson');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
let mysqlOps = require("../store/mysqlOps")
var json2xls = require('json2xls');

var generateLocationReport = (employee_id, from_date, to_date)=>{
    return new Promise((resolve, reject)=>{
        console.log(employee_id, from_date, to_date)
        if(employee_id == null || employee_id == 'null' || employee_id == undefined){
            employee_id = ''
        }
        let query = `SELECT e.employee_id, e.first_name, e.last_name, b.code, b.name, b.latitude AS branch_latitude, b.longitude AS branch_longitude, a.timestamp, a.latitude, a.longitude, a.accuracy, a.approved FROM employees e LEFT OUTER JOIN branches b ON (e.location_id=b.id) LEFT OUTER JOIN locations a ON (e.employee_id = a.employee_id) WHERE e.employee_id LIKE '%${employee_id}%' ORDER BY e.employee_id ASC, a.timestamp ASC`
        console.log(query)
        let start_timestamp = moment(from_date, "DD MMM YYYY").unix()
        let end_timestamp = moment(to_date, "DD MMM YYYY").unix()
        sqlQuery.executeQuery([query]).then((result)=>{
            result[0] = _.filter(result[0], (res)=>{
                return res.timestamp > start_timestamp && res.timestamp <= end_timestamp
            })
            _.each(result[0], (res)=>{
                res.date = moment.unix(res.timestamp).format("DD MMM YYYY")
                res.time = moment.unix(res.timestamp).format("HH:mm:ss")
            })
            var xls = json2xls(result[0]);
            let filename = `location_report_${employee_id}(${from_date}).xlsx`
            fs.writeFileSync(`reports/${filename}`, xls, 'binary');
            resolve(filename)
        }).catch((err)=>{
            console.log(err)
            reject(err)
        })
    })
}

function getAmountOfWeekDaysInMonth(date, weekday) {
        date.date(1);
        var dif = (7 + (weekday - date.weekday())) % 7 + 1;
        console.log("weekday: " + weekday + ", FirstOfMonth: " + date.weekday() + ", dif: " + dif);
        return Math.floor((date.daysInMonth() - dif) / 7) + 1;
}

var redoGenerateOverallReport = (groups, employee_ids, overall_report, from_date, total_days, count)=>{
    return new Promise((resolve, reject)=>{
        if(count < employee_ids.length){
            let query = `SELECT e.employee_id, e.first_name, e.last_name, b.code, b.name FROM employees e INNER JOIN branches b ON (e.location_id=b.id) WHERE e.employee_id='${employee_ids[count]}'`
            console.log(query)
            sqlQuery.executeQuery([query]).then((result)=>{
                let data = {
                    'employee_id': result[0][0].employee_id,
                    'first_name': result[0][0].first_name,
                    'last_name': result[0][0].last_name,
                    'branch_code': result[0][0].code,
                    'branch_name': result[0][0].name,
                    'total_days': total_days,
                    'total_sundays': 0,
                    'total_sundays_worked': 0,
                    'total_weekdays': 0,
                    'total_weekdays_worked': 0,
                    'total_hours_worked': 0,
                    'total_days_worked': 0,
                    'average_working_hours': 0
                }  
                let current_employee = groups[employee_ids[count]]
                _.each(current_employee, (e)=>{
                    if(e.is_sunday == 1){
                        data.total_sundays++
                    }else if(e.is_weekday == 1){
                        data.total_weekdays++
                    }
                    data.total_hours_worked += e.total_working_hours
                    if(e.total_working_hours > 0){
                       if(e.is_sunday == 1){
                            data.total_sundays_worked++
                        }else if(e.is_weekday == 1){
                            data.total_weekdays_worked++
                        }
                    }
                })

                data.total_days_worked = data.total_sundays_worked + data.total_weekdays_worked
                data.average_working_hours = data.total_hours_worked / data.total_days_worked
                if(isNaN(data.average_working_hours)){
                    data.average_working_hours = 0
                }

                console.log(data)
                overall_report.push(data)
                count++
                redoGenerateOverallReport(groups, employee_ids, overall_report, from_date, total_days, count).then((overall_report)=>{
                    resolve(overall_report)
                }).catch((err)=>{
                    reject(err)
                })
            })
        }else{
            resolve(overall_report)
        }
    })
}

var redoEveryDayAttendance = (result, employee_ids, overall_data, start_date, total_days, count)=>{
    return new Promise((resolve, reject)=>{
        console.log("----------------DAY START--------------------")
        if(count < total_days){
            var current_date_start = moment(start_date, "DD MMM YYYY").add(count, 'days').startOf('day').unix()
            var current_date_end = moment(start_date, "DD MMM YYYY").add(count, 'days').endOf('day').unix()
            var current_date = moment(start_date, "DD MMM YYYY").add(count, 'days')

            console.log(current_date_start, current_date_end)

            let filtered_result = _.filter(result, (res)=>{
                return res.timestamp > current_date_start && res.timestamp <= current_date_end
            })

            console.log(filtered_result.length)

            redoEmployeeAttendance(filtered_result, employee_ids, overall_data, current_date, 0).then((overall_data)=>{
                count++
                console.log("----------------DAY END--------------------")
                redoEveryDayAttendance(result, employee_ids, overall_data, start_date, total_days, count).then((overall_data)=>{
                    console.log(overall_data + "")
                    resolve(overall_data)
                }).catch((err)=>{
                    reject(err)
                })
            }).catch((err)=>{
                console.log(err)
                reject(err)
            })
        }else{

            var groups = _.groupBy(overall_data, function(value){
                return value.employee_id
            });
            redoGenerateOverallReport(groups, employee_ids, [], start_date, total_days, 0).then((overall_report)=>{
                resolve({overall_data: overall_data, overall_report: overall_report})                
            }).catch((err)=>{
                reject(err)
            })
        }
    })
}

var redoEmployeeAttendance = (result, employee_ids, overall_data, current_date, count)=>{
    return new Promise((resolve, reject)=>{
        console.log("----------------EMPLOYEE START----------------")
        if(count < employee_ids.length){
            let employee_data = _.sortBy(_.filter(result, (res)=>{
                return res.employee_id == employee_ids[count] && res.approved == 1
            }), 'timestamp')
            let data = {
                'employee_id': employee_ids[count],
                'date': moment(current_date).format("DD MMM YYYY"),
                'is_weekday': moment(current_date).day()==0?0:1,
                'is_sunday': moment(current_date).day()==0?1:0,
                'first_punch_timestamp':  0,
                'last_punch_timestamp': 0,
                'first_punch': '',
                'last_punch': '',
                'total_working_hours': 0,
            }

            if(employee_data.length > 0){
                data.first_punch_timestamp = employee_data[0].timestamp
                data.first_punch = moment.unix(employee_data[0].timestamp).format("DD MMM YYYY HH:mm")

                data.last_punch_timestamp = employee_data[employee_data.length -1].timestamp
                data.last_punch = moment.unix(employee_data[employee_data.length -1].timestamp).format("DD MMM YYYY HH:mm")
                
                data.total_working_hours = parseFloat(((data.last_punch_timestamp - data.first_punch_timestamp)/60/60).toFixed(2))
            }

            count++
            overall_data.push(data)
            
            console.log("----------------EMPLOYEE END----------------")
            redoEmployeeAttendance(result, employee_ids, overall_data, current_date, count).then((overall_data)=>{
                resolve(overall_data)
            }).catch((err)=>{
                console.log(err)
                reject(err)
            })
        }else{
            resolve(overall_data)
        }
    })
}

var generateAttendanceReport = (employee_id, from_date, to_date)=>{
    return new Promise((resolve, reject)=>{
        console.log(employee_id, from_date, to_date)
        if(employee_id == null || employee_id == 'null' || employee_id == undefined){
            employee_id = ''
        }
        let query = `SELECT e.employee_id, e.first_name, e.last_name, b.code, b.name, b.latitude AS branch_latitude, b.longitude AS branch_longitude, a.timestamp, a.latitude, a.longitude, a.accuracy, a.approved FROM employees e LEFT OUTER JOIN branches b ON (e.location_id=b.id) LEFT OUTER JOIN attendance a ON (e.employee_id = a.employee_id) WHERE e.employee_id LIKE '%${employee_id}%' ORDER BY e.employee_id ASC, a.timestamp ASC`
        console.log(query)
        
        let start = moment(from_date, "DD MMM YYYY")
        let end = moment(to_date, "DD MMM YYYY")
        let total_number_of_days = moment.duration(end.diff(start)).asDays();

        console.log("total_number_of_days", total_number_of_days)

        let start_timestamp = moment(from_date, "DD MMM YYYY").startOf().unix()
        let end_timestamp = moment(to_date, "DD MMM YYYY").endOf().unix()

        sqlQuery.executeQuery([query]).then((result)=>{
            let employee_ids = _.uniq(_.pluck(result[0], 'employee_id'))
            console.log("employee_ids", employee_ids + "", employee_ids.length)
            redoEveryDayAttendance(result[0], employee_ids, [], from_date, total_number_of_days, 0).then((data)=>{
                var xls1 = json2xls(data.overall_data);
                var xls2 = json2xls(data.overall_report);
                let filename1 = `attendance_details_${employee_id}(${from_date}_${to_date}).xlsx`
                let filename2 = `attendance_report_${employee_id}(${from_date}_${to_date}).xlsx`
                fs.writeFileSync(`reports/${filename1}`, xls1, 'binary');
                fs.writeFileSync(`reports/${filename2}`, xls2, 'binary');
                resolve(filename2)
            }).catch((err)=>{
                console.log(err)
                reject(err)
            })
        }).catch((err)=>{
            console.log(err)
            reject(err)
        })
    })
}

var convertToCSV = (option, filename)=>{
    return new Promise((resolve, reject)=>{
        var obj = xlsx.parse(filename);
        var rows = [];
        var writeStr = "";

        for(var i = 0; i < obj.length; i++){
            var sheet = obj[i];
            for(var j = 0; j < sheet['data'].length; j++){
                    rows.push(sheet['data'][j]);
            }
        }

        for(var i = 0; i < rows.length; i++){
            writeStr += rows[i].join(",") + "\n";
        }

        fs.writeFile(filename.split(".")[0] + ".csv", writeStr, function(err) {
            if(err) {
                reject(err)
            }
            importCSV(option, filename.split(".")[0] + ".csv").then(()=>{
                resolve()                
            }).catch((err)=>{
                reject(err)
            })
        });
    })
}

var importCSV = (option, filename)=>{
    return new Promise((resolve, reject)=>{
        let lines
        fs.readFile(filename, 'utf8', function(err, contents) {
            lines = contents.split("\n")
            console.log(lines[0]);
            console.log(lines[1]);
        });
        csv()
        .fromFile(filename)
        .then((jsonObj)=>{
            if(option == 'MSGP_Retail_Target'){
                importMSGPList(lines).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }else if(option == 'MSGA_Retail_Target'){
                importMSGAList(lines).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }else if(option == 'Customerwise_Targets'){
                importCustomerwiseList(lines).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }else if(option == 'Employees'){
                importEmployeesList(lines).then(()=>{
                    resolve()
                }).catch((err)=>{
                    reject(err)
                })
            }else{
                reject(`Invalid Upload option`)
            }
        })
    })
}

var importEmployeesList = (lines)=>{
    return new Promise((resolve, reject)=>{
        let columns = lines[0].split(",")
        console.log(lines.length)
        if(columns.length != 9){
            reject('Invalid Employees List File')
        }else{
            let query = `SELECT * FROM branches`;
            sqlQuery.executeQuery([query]).then((result)=>{
                let branches = result[0]
                console.log(branches)
                let queries = []
                for(i=1;i<lines.length-1;i++){
                    let columns = lines[i].split(",")
                    let location_id = _.filter(branches, (b)=>{return b.code == columns[4]})
                    console.log("location_id", location_id, columns[4], columns[2])
                    queries.push(`INSERT INTO employees (employee_id, first_name, last_name, location_id, designation) VALUES('${columns[2]}', '${columns[0]}', '${columns[1]}', ${location_id[0].id?location_id[0].id:0}, '${columns[5]}')`)
                    queries.push(`INSERT INTO salaries (employee_id, uan_number, epf_number, esic_number, bank_name) VALUES('${columns[2]}', '${columns[6]}', '${columns[7]}', '${columns[8]?columns[8]:''}', 'Karnataka Bank')`)
                }
                console.log(queries.length, lines.length)
                if(queries.length == (lines.length-2)*2){
                    sqlQuery.executeQuery(queries).then(()=>{
                        resolve()
                    }).catch((err)=>{
                        console.log(err)
                        reject(err)
                    })
                }
            })
        }
    }) 
}


var importMSGPList = (lines)=>{
    return new Promise((resolve, reject)=>{
        let columns = lines[0].split(",")
        console.log(lines.length)
        if(columns.length != 13){
            reject('Invalid MSGP Retail Target File')
        }else{
            let queries = []
            let date = moment().format("DD MMM YYYY")
            let timestamp = moment().startOf('day').unix()
            for(i=1;i<lines.length-1;i++){
                let columns = lines[i].split(",")
                queries.push(`INSERT INTO msgp (location_id, date, timestamp, target, as_on, balance, per_day) VALUES('${columns[0]}', '${date}', ${timestamp}, ${parseFloat(columns[9])}, ${parseFloat(columns[10])}, ${parseFloat(columns[11])}, ${parseFloat(columns[12])})`)
            }
            console.log(queries)
            if(queries.length == lines.length-2){
                sqlQuery.executeQuery(queries).then(()=>{
                    resolve()
                }).catch((err)=>{
                    console.log(err)
                    reject(err)
                })
            }
        }
    }) 
}

var importMSGAList = (lines)=>{
    return new Promise((resolve, reject)=>{
        console.log("inside importMSGAList", lines)
        let columns = lines[0].split(",")
        console.log(lines.length, columns.length)
        if(columns.length != 17){
            reject('Invalid MSGA Retail Target File')
        }else{
            let queries = []
            let date = moment().format("DD MMM YYYY")
            let timestamp = moment().startOf('day').unix()
            for(i=1;i<lines.length-1;i++){
                let columns = lines[i].split(",")
                queries.push(`INSERT INTO msga (location_id, date, timestamp, target, as_on, balance, per_day) VALUES('${columns[0]}', '${date}', ${timestamp}, ${parseFloat(columns[13])}, ${parseFloat(columns[14])}, ${parseFloat(columns[15])}, ${parseFloat(columns[16])})`)
            }
            if(queries.length == lines.length-2){
                console.log(queries)
                sqlQuery.executeQuery(queries).then(()=>{
                    resolve()
                }).catch((err)=>{
                    console.log(err)
                    reject(err)
                })
            }
        }
    }) 
}

var importCustomerwiseList = (lines)=>{
    return new Promise((resolve, reject)=>{
        console.log("inside importCustomerwiseList", lines)
        let columns = lines[0].split(",")
        console.log(lines.length, columns.length)
        if(columns.length != 31){
            reject('Invalid Customerwise Target File')
        }else{
            let queries = []
            let date = moment().format("DD MMM YYYY")
            let timestamp = moment().startOf('day').unix()
            for(i=1;i<lines.length;i++){
                let columns = lines[i].split(",")
                queries.push(`INSERT INTO customerwise (location_id, date, timestamp, party_code, party_name, mobile_number, type, monthly_target, target_as_on) VALUES('${columns[0]}', '${date}', ${timestamp}, '${columns[1]}', '${columns[2]}', '${columns[3]}', '${columns[4]}', ${parseFloat(columns[23])}, ${parseFloat(columns[24])})`)
            }
            if(queries.length == lines.length-1){
                console.log(queries)
                sqlQuery.executeQuery(queries)
                resolve()
            }
        }
    }) 
}

module.exports = {
    convertToCSV: convertToCSV,
    generateLocationReport: generateLocationReport,
    generateAttendanceReport: generateAttendanceReport
}