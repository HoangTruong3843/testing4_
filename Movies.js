var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

mongoose.Promise = global.Promise;

try {
    mongoose.connect( process.env.DB, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
        console.log("connected - movies"));
}catch (error) {
    console.log("could not connect - movies");
}
mongoose.set('useCreateIndex', true);

var MovieSchema = new Schema({
    title: {type: String, required: true, index: { unique: true }},
    year: {type: String, required: true},
    genre: {type: String, required: true},
    cast: [{
        actorName: {type: String, required: true},
        characterName: {type: String, required: true}
    }]
});

MovieSchema.pre('save', function(next) {
    var movie = this;

    if (movie.cast.length < 3) {
        var err = new ValidationError(this);
        err.errors.movie = new ValidatorError('need 3 or more actors');
        next(err);
    } else {
        next();
    }
});

module.exports = mongoose.model('Movie', MovieSchema);
