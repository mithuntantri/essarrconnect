var express = require('express');
var router = express.Router();
var jwt = require('jwt-simple');
var passport = require('passport');
require('../routes/passport')(passport);
var sqlQuery = require('../database/sqlWrapper');
var moment = require('moment')
let _ = require("underscore");
var user = require('../store/user')
var path = require('path');
var fs = require('fs');
var payslip = require('../store/payslip')
var notifications = require('../store/notifications')

router.get('/userDetails', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  let username = req.session.passport.user.username
  console.log("username", username)
  new Promise((resolve, reject)=>{
    user.UserDetails(username).then((data)=>{
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

router.get('/leaves', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  let username = req.session.passport.user.username
  console.log("username", username)
  new Promise((resolve, reject)=>{
    user.getLeaves(username).then((data)=>{
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

router.post("/leaves", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var leave = req.body
  new Promise((resolve, reject)=>{
    if(leave.from_date != '' && leave.to_date != '' && leave.reason != '' && leave.description != '' && leave.number_of_days > 0){
      user.addLeave(username, leave).then((data)=>{
        console.log(data)
        let ndata = {
          'intent': 'leave',
          'title': `Employee Leave Request`,
          'message': `${username} has applied for ${leave.number_of_days} day(s) leave for ${leave.reason}.`
        }
        console.log(ndata)
        notifications.sendSpecificDeviceNotification(username, "user", "admin", ndata)
        resolve()
      }).catch((err)=>{
        reject(err)
      })
    }else{
      reject(`Please fill in all details`)        
    }
  }).then(()=>{
    res.json({'status': true, 'message': 'Leave requested successfully'})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get("/announcements", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  new Promise((resolve, reject)=>{
    user.getAllAnnouncements(username).then((data)=>{
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

// router.get("/targets", passport.authenticate('jwt', {session: true}), function(req, res, next) {
//   var username =  req.session.passport.user.username;
//   new Promise((resolve, reject)=>{
//     user.getLocWiseTargets(username, "user").then((data)=>{
//       resolve(data)
//     }).catch((err)=>{
//       reject(err)
//     })
//   }).then((data)=>{
//     res.json({'status': true, 'data': data})
//   }).catch((err)=>{
//     res.json({'status': false, 'message': err})
//   })
// })

router.post("/profile", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var profile = req.body
  new Promise((resolve, reject)=>{
    if(profile.first_name && profile.last_name && profile.date_of_birth && profile.aadhar_number && profile.secondary_mobile && profile.account_number){
      user.updateProfile(username, profile).then((data)=>{
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

router.post("/location", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var body = req.body[0]
  console.log(JSON.stringify(body))
  let position = {
    'coords': {
      'latitude': body.lat,
      'longitude': body.lon,
      'accuracy': body.acc,
      'altitude': body.alt,
      'altitudeAccuracy': null,
      'heading': null,
      'speed': body.speed,
    },
    'timestamp': moment().unix()
  }
  new Promise((resolve, reject)=>{
    user.punchLocation(username, position).then(()=>{
      resolve()      
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})


router.post("/attendance", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var position = req.body
  new Promise((resolve, reject)=>{
    user.punchAttendance(username, position).then((data)=>{
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


router.get("/payslip", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var month = req.query.month
  var year = req.query.year
  new Promise((resolve, reject)=>{
    payslip.GeneratePaylsip(username, month, year).then((result)=>{
      var filename = `${username}_${month}(${year}).pdf`
      resolve(filename)
    }).catch((err)=>{
      reject(err)
    })
  }).then((filename)=>{
    var filePath = path.join(__dirname, '..', 'payslips', filename);
    var fileToSend = fs.readFileSync(filePath);
    var stat = fs.statSync(filePath);
    res.set('Content-Type', 'application/pdf');
    res.set('Content-Length', stat.size);
    res.set('Content-Disposition', filename);
    res.send(fileToSend);
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})


router.delete("/leaves", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  var id = req.query.id
  new Promise((resolve, reject)=>{
    user.deleteLeave(id).then((data)=>{
      resolve(data)
    }).catch((err)=>{
      reject(err)
    })
  }).then((data)=>{
    res.json({'status': true, 'data': data, 'message': 'Leave Request deleted successfully'})
  }).catch((err)=>{
    res.json({'status': false, 'message': err})
  })
})

router.get('/adminDetails', passport.authenticate('jwt', {session: true}), (req, res, next) => {
  let username = req.session.passport.user.username
  console.log("username", username)
  new Promise((resolve, reject)=>{
    user.AdminDetails(username).then((data)=>{
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
    user.getThreads(username).then((data)=>{
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

router.get("/targets", passport.authenticate('jwt', {session: true}), function(req, res, next) {
  var username =  req.session.passport.user.username;
  console.log("username", username)
  new Promise((resolve, reject)=>{
    console.log("Getting all targets")
    user.getAllTargets(username, "user").then((data)=>{
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

module.exports = router;
