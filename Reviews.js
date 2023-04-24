var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected-reviews"));
}catch (error) {
    console.log("could not connect reviews");
}
mongoose.set('useCreateIndex', true);

//user schema
var ReviewSchema  = new Schema({
    Name: {type:String, required:true},
    Review: {type:String, required:true},
    Rating: {type:Number, min: 0, max: 5, required:true},
    Movie_ID: {type:mongoose.Types.ObjectId, required:true}
});

ReviewSchema.pre('save', function(next) {
    next();
});

//return the model to server
module.exports = mongoose.model('Review', ReviewSchema);