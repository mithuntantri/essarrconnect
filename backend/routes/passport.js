var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var sqlQuery = require('../database/sqlWrapper');
var jwt = require('jwt-simple');
var _ = require('underscore');

module.exports = function(passport){
    var opts = {};
    let redis_key, query;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = 'eg[isfd-8axcewfgi43209=1dmnbvcrt67890-[;lkjhyt5432qi24';
    console.log(opts)
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
      if(jwt_payload.access_level == 'admin'){
        query = "SELECT * FROM `admin` WHERE username = '" + jwt_payload.username + "'";
      }else{
        query = "SELECT * FROM `employees` WHERE id = " + jwt_payload.id + "";
      }
      console.log(query, jwt_payload)
      sqlQuery.executeQuery([query]).then((results) => {
            if(!("type" in jwt_payload)){
                delete results[0][0].password;
                if(jwt_payload.access_level == 'user'){
                    redis_key = results[0][0].employee_id;
                }else{
                    redis_key = results[0][0].username;
                }

                if(Object.keys(results[0]).length > 0){
                    results[0][0]["access_level"] = jwt_payload.access_level?jwt_payload.access_level:"user";
                    if(jwt_payload.access_level == 'user' || results[0][0].employee_id){
                        results[0][0]['username'] = results[0][0].employee_id
                        results[0][0]['first_name'] = jwt_payload.first_name;
                        results[0][0]['last_name'] = jwt_payload.last_name;
                    }else{
                        results[0][0]['name'] = jwt_payload.name;
                    }
                    console.log("results[0][0]", results[0][0])
                    console.log("redis_key", redis_key)
                    redis_client.hgetall(redis_key, (err,reply) => {
                        done(null, results[0][0]);
                    })
                }else {
                    done(null, false);
                }
            }else if ("type" in jwt_payload && jwt_payload.type==="email_validation"){
                    // console.log("the email validation went successfully");
                    done(null, results[0][0]);
            }
        }).catch((error) => {
            return done(null, false);
        });
    }))
};
