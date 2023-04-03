var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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

// return the model
module.exports = mongoose.model('Review', ReviewSchema);