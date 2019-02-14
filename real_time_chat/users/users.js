var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var RatingSchema = new Schema({
    job_id :{type: Schema.Types.ObjectId, ref: 'jobs'},
    job_author_id: {type: Schema.Types.ObjectId, ref: 'users'},
    value: {type:Number},
    max: {type:Number},
    review:{type:String},
    created_date:{type:Date, default: Date.now}  
});


var userSchema = new mongoose.Schema({
  first_name: {type:String},
  last_name: {type:String},
  email: { type: String, lowercase: true , unique: true, required: 'Please enter the email.'},
  user_name: {type: String, unique: 'User name already exists.'},
  password: { type: String, required: 'Please enter the password.' },
  display_name: String,
  phone:String,
  role:[],//[postjob(1), findjob(2)]
  prof_image:String,
  cover_image:String,
  provider_image:String,
  about_me:String,
  provider:String,
  enable: {type: Boolean, default:false},
  status: {type: Boolean, default:false},
  is_deleted:{type:Boolean, default:false},
  skill: [{type: Schema.Types.ObjectId, ref: 'skills'}],
  zipcode:String,
  rating:[RatingSchema],
  created_date:{type:Date, default: Date.now},
  connected_account_status:{type: Boolean, default:false},
  connected_stripe_id:{type:String}, 
  connected_cust_id:{type:String},
  connected_account_secret_key:{type:String},
  device_id:{type:String},
  plateform:{type:String},
  timezone:{type:String},  
  logged_status:{type: Boolean, default:false},
  socketid:{type:String},
  last_seen:{type:Date, default: Date.now}  
});

userSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate({
                path:'skill',select: 'skill'
                
              })
    .exec(cb);
};


//custom validations

// userSchema.path('first_name').validate(function(value) {
//   var validateExpression = /^[a-zA-Z ]*$/;
//   return validateExpression.test(value);
// }, "Please enter a valid first name.");


// userSchema.path("last_name").validate(function(value) {
//   var validateExpression = /^[a-zA-Z]*$/;
//   return validateExpression.test(value);
// }, "Please enter a valid last name.");

userSchema.path("email").validate(function(value) {
   var validateExpression = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
   return validateExpression.test(value);
}, "Please enter a valid email address.");

// userSchema.path("user_name").validate(function(value) {
//   validateExpression = /^[a-zA-Z0-9]*$/;
//   return validateExpression.test(value);
// }, "Please enter a valid user name"); 


userSchema.plugin(uniqueValidator, {message: "Email already exists."});

userSchema.statics.serializeUser = function(user, done){
  //console.log("serializeUser");
    done(null, user);
};

userSchema.statics.deserializeUser = function(obj, done){
  //console.log("deserializeUser");
    done(null, obj);
};




var userObj = mongoose.model('users', userSchema);
module.exports = userObj;