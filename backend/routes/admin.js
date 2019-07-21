var express = require('express');
var shortid = require('shortid');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var hash = require('bcryptjs');
var otplib = require('otplib').default;
var jwt = require('jwt-simple');
require('../routes/passport')(passport);
var sqlQuery = require('../database/sqlWrapper');
var fs = require('fs');
var moment = require('moment')
let _ = require("underscore");
var sql_wrapper = require('../database/sqlWrapper');
var store = require('../store/store')
var multer  = require('multer')
var fs = require('fs');
var path = require('path');
var thumbler = require('video-thumb');
var ffmpeg = require('fluent-ffmpeg');
var child_process = require('child_process')
const getDuration = require('get-video-duration');
var login = require('../store/login')
var convert = require('../store/convert')
var user = require('../store/user')
var notifications = require('../store/notifications');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    var option = req.query.option
    option = option.replace("/", "_")
    option = option.replace(" ", "_")
    option = option.replace(" ", "_")
    option = option.replace("&", "and")
    let dir = './uploads/'
    dir += option + "/"
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
    cb(null, dir)
  },
  filename: function (req, file, cb) {
    let admin_id =  req.user?req.user.username:'Admin';
    cb(null, admin_id + '_' + moment().format("DDMMMYYYY") + '.' + file.originalname.split('.').pop())
  }
})
var upload = multer({ storage: storage, limits: { fileSize: '150MB' } }).single('file')

router.post('/login', (req, res, next) => {
  let username = req.body.username
  let password = req.body.password
  new Promise((resolve, reject)=>{
    login.AdminLogin(username, password).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/report", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  let employee_id = req.query.employee_id
  let from_date = req.query.from_date
  let to_date = req.query.to_date
  let type = req.query.type
  new Promise((resolve, reject)=>{
    if(type == 'location'){
      convert.generateLocationReport(employee_id, from_date, to_date).then((filename)=>{
        resolve(filename)
      }).catch((err)=>{
        console.log(err)
        reject(err)
      })
    }else{
      convert.generateAttendanceReport(employee_id, from_date, to_date).then((filename)=>{
        resolve(filename)
      }).catch((err)=>{
        console.log(err)
        reject(err)
      })
    }
  }).then((filename)=>{
    console.log(filename)
    var filePath = path.join(__dirname, '..', 'reports', filename);
    var fileToSend = fs.readFileSync(filePath);
    var stat = fs.statSync(filePath);
    res.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.set('Content-Length', stat.size);
    res.set('Content-Disposition', filename);
    res.send(fileToSend);
  }).catch((err)=>{
    console.log(err)
    res.json({'status': false, 'message': err})
  })
})

router.get("/targets", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getAllTargets(username, "admin").then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/dashboard", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getDashboardData(username, "admin").then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/blocked_users", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getAllBlockedUsers(username, "admin").then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post("/unblock_user", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var employee_id =  req.body.employee_id;
  new Promise((resolve, reject)=>{
    user.unblockUser(employee_id).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})


router.get("/branches", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getBranches(username).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/category", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getAllCategory().then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/employees", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getEmployees(username).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/salaries", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getSalaries(username).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/holidays", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getHolidays(username).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get('/threads', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  let username = req.session.passport.user.username
  new Promise((resolve, reject)=>{
    user.getAllThreads(username).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post("/threads", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var thread = req.body
  new Promise((resolve, reject)=>{
    user.addThread(username, thread).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.put("/threads", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var thread = req.body
  new Promise((resolve, reject)=>{
    user.updateThread(username, thread).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/announcements", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getAllAnnouncements("admin").then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/leaves", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getAllLeaves(username).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.put("/leaves", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var id = req.query.id
  var status = req.query.status
  new Promise((resolve, reject)=>{
    user.updateLeave(id, status).then((data)=>{
      notifications.sendSpecificDeviceNotification(username, "admin", data.employee_id, {title: `Leave request ${status?'approved':'declined'}`, 'message': `Your leave request for ${data.number_of_days} day(s) with subject <b>${data.reason}</b> from <b>${data.from_date}</b> till <b>${data.to_date}</b> has been ${data.approved==2?'approved!':'declined!'}`})
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})


router.get("/incentives", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getIncentives(username).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post("/branches", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var branch = req.body
  new Promise((resolve, reject)=>{
    if(branch.name != '' && branch.address != '' && branch.latidtude != 0 && branch.longitude != 0){
      user.addBranch(branch).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }else{
      if(branch.latidtude > 90 || branch.latidtude < -90){
        reject(`Invalid Latidtude details`)
      }else if(branch.longitude > 180 || branch.longitude < -180){
        reject(`Invalid Longitude details`)
      }else{
        reject(`Please fill in all details`)        
      }
    }
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post("/announcements", function(req, res, next) {
  var username =  "EAC001";
  var message = req.body.message
  var title = req.body.title
  var category = req.body.category
  console.log(message, title)
  new Promise((resolve, reject)=>{
    if(category == 'ALL'){
      notifications.broadcastMessage(username, title, message, category).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        console.log(err)
        reject(err)
      })  
    }else{
      notifications.broadcastCategoryMessage(username, title, message, category).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        console.log(err)
        reject(err)
      })
    }
    
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    console.log(err)
    res.json({'status': false, 'message': err})
  })
})

router.post("/holidays", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var holiday = req.body
  new Promise((resolve, reject)=>{
    if(holiday.from_date != '' && holiday.to_date != '' && holiday.occassion != ''){
      user.addHoliday(holiday).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }else{
      reject(`Please fill in all details`)        
    }
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post("/salaries", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var salary = req.body
  new Promise((resolve, reject)=>{
    if(salary.gross_income != '' && salary.basic != ''){
      user.updateSalary(salary).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }else{
      reject(`Please fill in all details`)        
    }
  }).then((data)=>{
    res.json({'status': true, 'message': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post("/vehicles", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var vehicle = req.body
  new Promise((resolve, reject)=>{
    if(vehicle.vehicle_number != '' && vehicle.model != '' && vehicle.color != '' && vehicle.branch_id != ''){
      user.addVehicle(vehicle).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }else{
      reject(`Please fill in all details`)        
    }
  }).then((data)=>{
    res.json({'status': true, 'message': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/vehicles", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
      user.getVehicles(username).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post("/employees", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var employee = req.body
  console.log(employee)
  new Promise((resolve, reject)=>{
    if(employee.number != 0 && employee.designation != '' && employee.first_name != '' && employee.last_name != '' && employee.location != 0){
      user.addEmployee(employee).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }else{
      reject(`Please fill in all details`)        
    }
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.put("/employees", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var employee = req.body
  console.log(employee)
  new Promise((resolve, reject)=>{
    if(employee.number != 0 && employee.designation != '' && employee.first_name != '' && employee.last_name != '' && employee.location != 0){
      user.updateEmployee(employee).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }else{
      reject(`Please fill in all details`)        
    }
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.post("/incentives", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var incentives = req.body
  console.log(incentives)
  new Promise((resolve, reject)=>{
    if(incentives.employee_id != null && incentives.amount != 0 && incentives.reason != ''){
      user.addIncentive(incentives).then((data)=>{
        resolve(data)
      }).catch((err)=>{
        reject(err)
      })
    }else{
      reject(`Please fill in all details`)        
    }
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.delete("/branches", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var id = req.query.id
  new Promise((resolve, reject)=>{
    user.deleteBranch(id).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.delete("/vehicles", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var id = req.query.id
  new Promise((resolve, reject)=>{
    user.deleteVehicles(id).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.delete("/holidays", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var id = req.query.id
  new Promise((resolve, reject)=>{
    user.deleteHoliday(id).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.delete("/employees", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var id = req.query.id
  new Promise((resolve, reject)=>{
    user.deleteEmployee(id).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.delete("/incentives", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var id = req.query.id
  new Promise((resolve, reject)=>{
    user.deleteIncentive(id).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})


router.post("/upload", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var option = req.query.option
  option = option.replace("/", "_")
  option = option.replace("&", "and")
  option = option.replace(" ", "_")
  option = option.replace(" ", "_")
  var is_distributor = req.user.admin_type == 'DI'
  new Promise((resolve, reject)=>{
    upload(req,res,function(err){
      var file_name = req.file.filename
      if(err){
        reject(err)
      }else{
        resolve(file_name)
      }
    })
  }).then((file_name)=>{
    var folder_name = option;
    var relative_path = path.resolve("./uploads/" + folder_name) + '/' + file_name
    convert.convertToCSV(option, relative_path).then(()=>{
      res.json({'status': true, 'message' : 'File uploaded successfully'})      
    }).catch((err)=>{
      res.json({'status': false, 'message' : err})
    })
  }).catch((err)=>{
    res.json({'status': false, 'message' : 'File upload failed! Invalid file format'})
  })
})

router.post("/employee_upload", function(req, res, next) {
  var option = 'Employees'
  new Promise((resolve, reject)=>{
    resolve('employees.xlsx')
  }).then((file_name)=>{
    var folder_name = option;
    var relative_path = path.resolve("./uploads/" + file_name)
    convert.convertToCSV(option, relative_path).then(()=>{
      res.json({'status': true, 'message' : 'File uploaded successfully'})      
    }).catch((err)=>{
      res.json({'status': false, 'message' : err})
    })
  }).catch((err)=>{
    res.json({'status': false, 'message' : 'File upload failed! Invalid file format'})
  })
})

router.post("/salary_upload", function(req, res, next) {
  var option = req.query.payroll
  new Promise((resolve, reject)=>{
    upload(req,res,function(err){
      var file_name = req.file.filename
      if(err){
        reject(err)
      }else{
        resolve(file_name)
      }
    })
  }).then((file_name)=>{
    var folder_name = option;
    var relative_path = path.resolve("./uploads/Salary/" + file_name)
    convert.convertToCSV("salary_"+option, relative_path).then(()=>{
      res.json({'status': true, 'message' : 'File uploaded successfully'})      
    }).catch((err)=>{
      res.json({'status': false, 'message' : err})
    })
  }).catch((err)=>{
    res.json({'status': false, 'message' : 'File upload failed! Invalid file format'})
  })
})

module.exports = router;
