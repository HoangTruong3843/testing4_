/*
CSC3916 HW2
File: Server.js
Description: Web API scaffolding for Movie API
 */

var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');
var authController = require('./auth');
var authJwtController = require('./auth_jwt');
var jwt = require('jsonwebtoken');
var cors = require('cors');
var User = require('./Users');
var Movie = require('./Movies');
//////////////////NEW
var Review = require('./Reviews');
/////////////////
var app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(passport.initialize());

var router = express.Router();

function getJSONObjectForMovieRequirement(req) {
    var json = {
        headers: "No headers",
        key: process.env.UNIQUE_KEY,
        body: "No body"
    };

    if (req.body != null) {
        json.body = req.body;
    }

    if (req.headers != null) {
        json.headers = req.headers;
    }

    return json;
}

router.post('/signup', function(req, res) {
    if (!req.body.username || !req.body.password) {
        res.json({success: false, msg: 'Please include both username and password to signup.'})
    } else {
        var user = new User();
        user.name = req.body.name;
        user.username = req.body.username;
        user.password = req.body.password;

        user.save(function(err){
            if (err) {
                if (err.code == 11000)
                    return res.json({ success: false, message: 'A user with that username already exists.'});
                else
                    return res.json(err);
            }
            res.json({success: true, msg: 'Successfully created new user.'})
        });
    }
});

router.post('/signin', function (req, res) {
    var userNew = new User();
    userNew.username = req.body.username;
    userNew.password = req.body.password;

    User.findOne({ username: userNew.username }).select('name username password').exec(function(err, user) {
        if (err) {
            res.send(err);
        }

        user.comparePassword(userNew.password, function(isMatch) {
            if (isMatch) {
                var userToken = { id: user.id, username: user.username };
                var token = jwt.sign(userToken, process.env.SECRET_KEY);
                res.json ({success: true, token: 'JWT ' + token});
            }
            else {
                res.status(401).send({success: false, msg: 'Authentication failed.'});
            }
        })
    })
});

router.route('/movies')
    .post(authJwtController.isAuthenticated, function (req, res) /*{
            if (!req.body.Title || !req.body.Year || !req.body.Genre || !req.body.Actors) {
                if (!req.body.Actors.length < 3){
                    res.status(400).json({message: "Need at least 3 actors"})
                    return;
                }
                res.json({success: false, msg: 'Please include all data.'});
                return;
            }
            else {
                Movie.find ({Title: req.body.Title},function(err,data) {
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
                            res.json({msg: "Movie already exists"});
                        }
                    });
            }})*/

        {
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
    })
    .get(authJwtController.isAuthenticated, function (req, res) {
        if(req.query.movieId != null){
            Movie.find({_id: mongoose.Types.ObjectId(req.query.movieId)}, function(err, data){
                if(err){
                    res.status(400).json({message: "Invalid query"});
                }else if(data.length == 0) {
                    res.status(400).json({message: "No entry found"});
                }else{
                    if(req.query.reviews == "True"){
                        Movie.aggregate([
                            {
                                $match: {'_id': mongoose.Types.ObjectId(req.query.movieId)}
                            },
                            {
                                $lookup:{
                                    from: 'reviews',
                                    localField: '_id',
                                    foreignField: 'Movie_ID',
                                    as: 'Reviews'
                                }
                            }],function(err, doc) {
                            if(err){
                                console.log("hi");
                                res.send(err);
                            }else{
                                console.log(doc);
                                res.json(doc);
                            }
                        });
                    }else{
                        res.json(data);
                    }
                }
            });
        }else{
            Movie.find({}, function(err, doc){
                if(err){
                    res.json({error: err});
                }else{
                    if(req.query.reviews == "True"){
                        Movie.aggregate([
                            {
                                $lookup:{
                                    from: 'reviews',
                                    localField: '_id',
                                    foreignField: 'Movie_ID',
                                    as: 'Reviews'
                                }
                            }],function(err, data) {
                            if(err){
                                res.send(err);
                            }else{
                                res.json(data);
                            }
                        });
                    }else{
                        res.json(doc);
                    }
                }
            })
        }

    })
    .put(authJwtController.isAuthenticated, function(req,res) {
        if(req.body.Title != null && req.body.Year != null && req.body.Genre != null && req.body.Actors != null && req.body.Actors.length >= 3){
            Movie.findOneAndUpdate({Title:req.body.Search},
                {
                    Title: req.body.Title,
                    Year: req.body.Year,
                    Genre: req.body.Genre,
                    Actors: req.body.Actors

                },function(err, doc){
                    if(err){
                        res.json({message: err});
                    }
                    else if (doc == null){
                        res.json({message:"Movie Not Found"})
                    }else{
                        res.json({data: doc, message:"Movie Updated"})
                    }
                });
        }else
        {
            res.status(400).json({message: "Please no null values"});
        }
    })
    .delete(authJwtController.isAuthenticated, function(req,res){
        Movie.findOneAndDelete({Title: req.body.Title}, function(err, doc){
            if(err){
                res.status(400).json({message:err});
            }
            else if (doc == null){
                res.json({message: "Movie not found"});
            }
            else{
                res.json({message: "Movie deleted"});
            }

        });
    });
//////////NEW
var mongoose = require('mongoose');
router.route('/movies/:movieId')
    .get(authJwtController.isAuthenticated, function (req, res) {
        var id = mongoose.Types.ObjectId(req.query.movieId);
        if (req.query.reviews == "true") {
            // If reviews query parameter is "true", include movie information and reviews
            Movie.aggregate([
                { $match: { '_id': mongoose.Types.ObjectId(req.query.movieId)} },
                { $lookup: { from: "reviews", localField: "_id", foreignField: "Movie_ID", as: "Reviews" } },
                { $sort: { "reviews.createdAt": -1 } }
            ], function (err, movie) {
                if (err) {
                    return res.status(400).json({ success: false, message: "Error retrieving movie and reviews." });
                } else {
                    return res.status(200).json({ success: true, movie: movie[0] });
                }
            });
        } else {
            // If reviews query parameter is not provided or is not "true", only include movie information
            Movie.findById(id, function (err, movie) {
                if (err) {
                    return res.status(400).json({ success: false, message: "Error retrieving movie." });
                } else {
                    return res.status(200).json({ success: true, movie: movie });
                }
            });
        }
    });
router.route('/reviews')
    .post(authJwtController.isAuthenticated, function(req,res){

        const usertoken = req.headers.authorization;
        const token = usertoken.split(' ');
        const decoded = jwt.verify(token[1], process.env.SECRET_KEY);

        Movie.find({_id: req.body.movieID}, function(err, data){
            if(err){
                res.status(400).json({message: "Invalid query"});
            }else if (data != null){
                let rev = new Review({
                    Name: decoded.username,
                    Review: req.body.Review,
                    Rating: req.body.Rating,
                    Movie_ID: req.body.movieID
                });

                console.log(req.body);

                rev.save(function(err){
                    if(err) {
                        res.json({message: err});
                    }else{
                        Review.find({Movie_ID: req.body.Movie_ID}, function (err, allReviews) {
                            if(err){
                                res.status(400).json({message: "It's broken!"});
                            }else{
                                var avg = 0;

                                allReviews.forEach(function (review) {
                                    avg += review.Rating;
                                    console.log(review);
                                });
                                avg = avg / allReviews.length;


                                Movie.update(
                                    { _id: req.body.Movie_ID},
                                    { $set: { averageRating: avg} }, function (err, doc){
                                        if (err){
                                            res.json({error: err});
                                        }else if(doc != null){
                                            res.json({msg: "Review successfully saved"});
                                        }
                                    });

                            }
                        });

                    }

                });
            }else{
                res.json({failure: "Movie does not exist"});
            }
        });
    })
    .get(function(req, res) {
            console.log(req.body);
            if (!req.body.id) {
                res.json({success: false, msg: 'Please include all data.'});
                return;
            }

            let id = req.body.id;
            ///////////////////////
            Movie.findOne({ title: id }).select('_id title year genre cast').exec(function(err, movie) {
                if (!movie) {
                    return res.json({success:false, message:'Movie does not exist.'});
                }
                else {
                    Review.findOne({movieID: id}).select('username rating movieID review').exec(function(err,review) {
                        if (review) {
                            res.json({status:200, success: true, reviews: review});
                        }
                        else{
                            res.json({status:false, message:'Review is not available'});
                        }
                    });
                }
            })
        }
    );

/////////

app.use('/', router);
app.listen(process.env.PORT || 8080);
module.exports = app; // for testing only


