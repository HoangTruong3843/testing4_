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


MovieSchema.pre('save', function(next) {
    var movie = this;

    if (movie.Actors.length < 3) {
        var err = new ValidationError(this);
        err.errors.movie = new ValidatorError('need 3 or more actors in cast');
        next(err);
    } else {
        next();
    }
});
/*{
        if(req.body.Actors.length < 3){
            res.status(400).json({message: "Need at least 3 actors"});
        }else {
            Movie.find({Title: req.body.Title}, function (err, data) {
                if (err) {
                    res.status(400).json({message: "Invalid query"});
                } else if (data.length == 0) {
                    let mov = new Movie({
                        Title: req.body.Title,
                        Year: req.body.Year,
                        Genre: req.body.Genre,
                        Actors: req.body.Actors,
                        ImageUrl: req.body.ImageUrl
                    });
                    console.log(req.body);
                    mov.save(function (err) {
                        if (err) {
                            res.json({message: err});
                        } else {
                            res.json({msg: "Successfully saved"});
                        }

                    });
                } else {
                    res.json({message: "Movie already exists"});
                }

            });
        }
    }*/
//return the model to server
module.exports = mongoose.model('Movie', MovieSchema);