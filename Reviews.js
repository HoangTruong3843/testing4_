var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
mongoose.Promise = global.Promise;
try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected - reviews"));
}catch (error) {
    console.log("could not connect - reviews");
}
mongoose.set('useCreateIndex', true);

// Movie schema
var ReviewSchema = new Schema({
    movieID: {type: String, required: true, index: {unique: true}},
    username:  {type:String, required: true},
    review:  {type:String, required: true},
    rating:  {type:String, required: true}
});
ReviewSchema.pre('save', function(next) {
    var review = this;

    if (review.review.length == 0) {
        var err = new ValidationError(this);
        err.errors.review = new ValidatorError('need at least one review');
        next(err);
    } else {
        next();
    }
});
// return the model
module.exports = mongoose.model('Review', ReviewSchema);