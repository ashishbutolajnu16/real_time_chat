var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var Schema = mongoose.Schema;

var skillSchema = new mongoose.Schema({
	skill : {type:String, unique: true, required : 'Please enter the skill name.'},
  image : {type:String},
  cover_image : {type:String},
	is_deleted : {type : Boolean, default : false},
	enable : {type : Boolean},
	created_date : {type : Date, default : Date.now}
});


//custom validations

skillSchema.path('skill').validate(function(value) {
  var validateExpression = /^[a-zA-Z0-9 ]*$/;
  return validateExpression.test(value);
}, "Please enter valid skill name");

skillSchema.statics.load = function(id, cb) {
    this.findOne({
        _id: id
    })
    .exec(cb);
};

skillSchema.plugin(uniqueValidator, {message:'Skill already exists'});

var skillObj = mongoose.model('skills' , skillSchema);
module.exports = skillObj;