var xlsx = require('node-xlsx');
var fs = require('fs');
var csv=require('csvtojson');
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
let mysqlOps = require("../store/mysqlOps")
var json2xls = require('json2xls');

var generateAttendanceReport = (employee_id, date)=>{
    return new Promise((resolve, reject)=>{
        console.log(employee_id, date)
        let query = `SELECT e.employee_id, e.first_name, e.last_name, b.code, b.name, b.latitude AS branch_latitude, b.longitude AS branch_longitude, a.timestamp, a.latitude, a.longitude, a.accuracy FROM employees e LEFT OUTER JOIN branches b ON (e.location_id=b.id) LEFT OUTER JOIN attendance a ON (e.employee_id = a.employee_id) WHERE e.employee_id='${employee_id}'`
        console.log(query)
        sqlQuery.executeQuery([query]).then((result)=>{
            _.each(result[0], (res)=>{
                res.date = moment(res.timestamp).format("DD MMM YYYY")
                res.time = moment(res.timestamp).format("HH:mm:ss")
            })
            var xls = json2xls(result[0]);
            let filename = `attendance_report_${employee_id}(${date}).xlsx`
            fs.writeFileSync(`reports/${filename}`, xls, 'binary');
            resolve(filename)
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
            }else{
                reject(`Invalid Upload option`)
            }
        })
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
    generateAttendanceReport: generateAttendanceReport
}