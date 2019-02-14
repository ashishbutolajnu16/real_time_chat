var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
    type :{type:String},
    coordinates: [{type:Number}],
    
});

var AdminPaymentSchema = new Schema({
    transaction_id:{type:String},
    transaction_object:{type:String},
    transaction_amount:{type:Number},
    connected_cust_id:{type:String},
    source_id:{type:String},
    source_object:{type:String},
    status:{type:String},
    txn_date: {type : Date, default : Date.now}
    
});

var WorkerPaymentSchema = new Schema({
    transaction_id:{type:String},
    transaction_object:{type:String},
    transaction_amount:{type:Number},
    source_charge_id:{type:String},
    connected_stripe_id:{type:String},
    user_id:{type: Schema.Types.ObjectId, ref: 'users'},
    status:{type:String},
    txn_date: {type : Date, default : Date.now}
    
});

var jobsSchema = new mongoose.Schema({
  title : {type:String, unique: true, required : 'Please enter the job title.'},
  description : {type:String, required : 'Please enter the job description.'},
  creator:[{type: Schema.Types.ObjectId, ref: 'users'}],
  image:{type:String},
  address:{type:String},
  address_var:[],
  latitude:{type:Number},
  longitude:{type:Number},
  location:[LocationSchema],
  jobtype:[{type: Schema.Types.ObjectId, ref: 'jobtypes'}],
  skill:[{type: Schema.Types.ObjectId, ref: 'skills'}],
  budget:{type:Number, required : 'Please enter budget for the job.'},
  contract_type:{type:Number, default : 0},//[fixed(0), hourly(1)]
  offers:[{type: Schema.Types.ObjectId, ref: 'offers'}],
  comments:[{type: Schema.Types.ObjectId, ref: 'comments'}],
  winner:[{type: Schema.Types.ObjectId, ref: 'users'}],
  winner_offer:[{type: Schema.Types.ObjectId, ref: 'offers'}],
  job_status: {type: Number, enum: [1,2,3], default : 1},//[1=>open, 2=>assigned,3=>competed]
  work_status: {type: Number, enum: [1,2,3,4]},//[1=>Todo ,2=> In Progress,3=>to verify,4=>completed]
  due_date : {type : Date},
  is_deleted : {type : Boolean, default : false},
  enable : {type : Boolean, default : true},
  created_date : {type : Date, default : Date.now},
  admin_payment:[AdminPaymentSchema],
  worker_payment:[WorkerPaymentSchema],
  admin_commission: {
    job_poster: Number,
    job_finder: Number
  },
  status_logs:{type:Array}

});


//custom validations

jobsSchema.path('title').validate(function(value) {
  var validateExpression = /^[a-zA-Z0-9 ]*$/;
  return validateExpression.test(value);
}, "Please enter valid job title");

jobsSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    }).populate({
                path:'creator',select: 'first_name last_name email  prof_image'
                
              })
              .populate({
                path:'winner',select: 'first_name last_name email  prof_image'
                
              })
              .populate({
                path:'winner_offer'
                
              })
              .populate({
                path:'comments'
                
              })
              .populate({
                path:'jobtype',select: 'name'
                
              })
              .populate({
                path:'skill',select: 'skill image cover_image'
                
              })
    .exec(cb);
};

//jobsSchema.plugin(uniqueValidator, {message:'Job already exists'});

var jobObj = mongoose.model('jobs' , jobsSchema);
module.exports = jobObj;