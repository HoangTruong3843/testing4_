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
                    return res.json({ success: false, message: 'movie name already exists.'});
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
    .post(function(req, res) {
            if (!req.body.title || !req.body.year || !req.body.genre || !req.body.cast) {
                res.json({success: false, msg: 'Please include all data.'});
                return;
            }
            var new_movie = new Movie();
            new_movie.title = req.body.title;
            new_movie.year = req.body.year;
            new_movie.genre = req.body.genre;
            new_movie.cast = req.body.cast;

            new_movie.save(function(err){
                if (err) {
                    if (err.code == 11000)
                        return res.json({ success: false, message: 'movie name already exists.'});
                    else
                        return res.json(err);
                }

                res.json({success: true, msg: 'Successfully created new movie.'})
            });
        }
    )
    .get(function(req, res) {
            console.log(req.body);
            

            let id = " ";
            if (req.body.movie) {
                id = req.body.movie;
            }
            if (req.headers.movie) {
                id = req.headers.movie;
            }

            if (req.headers.movie) {
                Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
                    
                    if (movie) {
                        Review.findOne({ movie: id }).select('reviewer_name rating movie review').exec(function(err, review) {
                            if(review) {
                                //var review_json = JSON.stringify(review);
                                res.json({status: 200, success: true, movies: movie, reviews: review});
                            } else {
                                return res.json({ success: true, movies: movie});
                            }
                        });
                    } else {
                        return res.json({ success: false, message: 'movie is not in database.'});
                    }
                })
            }
            else if (!req.body) {
                Movie.find(function (err, movies) {
                    if (err) res.send(err);
                    return res.json({status:200, success: true, size: movies.length, movies: movies});
                });
            }
            else if (!req.body.movie) {
                Movie.find(function (err, movies) {
                    if (err) res.send(err);
                    return res.json({status:200, success: true, size: movies.length, movies: movies});
                });
            } else if (req.body.movie && !req.body.reviews) {
                Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
                    
                    if (movie) {
                        return res.json({ success: true, movies: movie});
                    } else {
                        return res.json({ success: false, message: 'movie is not in database.'});
                    }
                })
            } else if (req.body.movie && req.body.reviews == false) {
                Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
                    
                    if (movie) {
                        return res.json({ success: true, movies: movie});
                    } else {
                        return res.json({ success: false, message: 'movie is not in database.'});
                    }
                })
            } else if (req.body.movie && req.body.reviews == true) {
                Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
                    
                    if (movie) {
                        Review.findOne({ movie: id }).select('reviewer_name rating movie review').exec(function(err, review) {
                            if(review) {
                                //var review_json = JSON.stringify(review);
                                res.json({status: 200, success: true, movies: movie, reviews: review});
                            } else {
                                return res.json({ success: true, movies: movie});
                            }
                        });
                    } else {
                        return res.json({ success: false, message: 'movie is not in database.'});
                    }
                })
            }
        }
    )
    .put(function(req, res) {
            
            
            console.log(req.body);

            let id = req.body.id;
            Movie.findOne({ title: id }).select('title year genre cast').exec(function(err, movie) {
                
                if (err) {
                    if (err.kind === "ObjectId") {
                        res.status(404).json({
                            success: false,
                            message: `Movie with id: ${id} not found in the database!`
                        }).send();
                    } else {
                        res.send(err);
                    }
                } else if (movie) {
                    if (req.body.title) {
                        movie.title = req.body.title;
                    }
                    if (req.body.year) {
                        movie.year = req.body.year;
                    }
                    if (req.body.genre) {
                        movie.genre = req.body.genre;
                    }
                    if (req.body.cast) {
                        movie.cast = req.body.cast;
                    }
                    movie.save(function (err) {
                        if (err) res.send(err);

                        res.status(200).json({
                            success: true,
                            message: 'Movie succesfully updated!'
                        });
                    });
                }
            })
        }
    )
    .delete(function(req, res) {
       
    
            console.log(req.body);

            let id = req.body.id;
            Movie.findOne({ title: id }).select('_id title year genre cast').exec(function(err, movie) {
                if (err) {
                    if (err.kind === "ObjectId") {
                        res.status(404).json({
                            success: false,
                            message: `Movie with id: ${id} not found in the database!`
                        }).send();
                    } else {
                        res.send(err);
                    }
                } else if (movie) {
                    Movie.remove({_id: movie._id}, function(err, movie) {
                        if (err) {
                            if (err.kind === "ObjectId") {
                                res.status(404).json({
                                    success: false,
                                    message: `Movie with id: ${id} not found in the database!`
                                }).send();
                            } else {
                                res.send(err);
                            }
                        } else {
                            res.status(200).json({
                                success: true,
                                message: 'Successfully deleted'
                            })
                        }
                    });
                }
            })
        }
    );
//////////NEW
router.route('/reviews')
    .post(function(req, res) {
            if (!req.body.movieID || !req.body.username || !req.body.review || !req.body.rating) {
                res.json({success: false, msg: 'Please include all review data.'});
                return;
            }

            var new_review = new Review();
            new_review.movieID = req.body.movieID;
            new_review.username = req.body.username;
            new_review.review = req.body.review;
            new_review.rating = req.body.rating;

            let id = req.body.movieID;

            ///////////////////////
            Movie.findOne({ title: id }).select('_id title year genre cast').exec(function(err, movie) {
                if (err) {
                    if (err.kind === "ObjectId") {
                        res.status(404).json({
                            success: false,
                            message: `Movie with id: ${id} not found in the database!`
                        }).send();
                    } else {
                        res.send(err);
                    }
                } else if (movie) {
                    new_review.save(function(err) {
                        if (err) {
                            if (err.code == 11000)
                                return res.json({ success: false, message: 'review already exists.'});
                            else
                                return res.json(err);
                        }

                        res.json({success: true, msg: 'Successfully created new review.'})
                    });
                }
            })
        }
    )
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
                    Review.findOne({movie: id}).select('reviewer_name rating movie review').exec(function(err,review) {
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


