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

var MovieSchema  = new Schema({
    Title: {type:String, required:true},
    Year: {type:Date, required:true},
    Genre: {type:String, required:true, enum:["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror", "Mystery", "Thriller", "Western"]},
    Actors: {type:[{ActorName:String, CharacterName:String}], required:true},
    ImageUrl: {type:String, required: false},
    averageRating: {type:Number, required: false}
});

/*
MovieSchema.pre('save', function(next) {
    var movie = this;

    if (movie.cast.length < 3) {
        var err = new ValidationError(this);
        err.errors.movie = new ValidatorError('need 3 or more actors in cast');
        next(err);
    } else {
        next();
    }
});
*/
//return the model to server
module.exports = mongoose.model('Movie', MovieSchema);