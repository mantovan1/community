const express = require('express');
const router = express.Router();
require('dotenv').config({ path: require('find-config')('.env') });

var mongo = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = process.env.MONGODB_HOST;

router.get('/create/:title/:text', async (req, res) => {
	if(req.session.userName) {
		const author = req.session.userName;
		const date = Date.now();
		const title = req.params.title;
		const text = req.params.text;
		const myobj = {author: author, date: date, level: 'parent', childs: [], title: title, text: text}
		MongoClient.connect(url, function(err, db) {
  			if (err) {
				res.json({message: err});
				res.status(500);
				res.end();
			}
  			var dbo = db.db(process.env.MONGODB_DATABASE);
  			dbo.collection("threads").insertOne(myobj, function(err, response) {
    			if (err) {
					res.json({message: err});
					res.status(500);
					res.end();
				} else {
					res.json({message: 'Thread created', id: myobj._id, author: myobj.author, date: myobj.date, title: myobj.title, text: myobj.text});
                    res.status(201);
                    res.end();
					db.close();
				}
  			});
		});
	} else {
		res.status(307);
		res.redirect('/tempuser/join');
		res.end();
	}
});

router.get('/comment/:layer/:parentid/:title/:text', async (req, res) => {
	if(req.session.userName) {
        const author = req.session.userName;
        const date = Date.now();
        const title = req.params.title;
        const text = req.params.text;
		const layer = req.params.layer;
		const parentid = req.params.parentid;
		var parentObjectID;
		try {
			parentObjectID = new mongo.ObjectID(parentid);
		} catch (e) {}
        MongoClient.connect(url, async function(err, db) {
            if (err) {
                res.json({message: err});
                res.status(500);
                res.end();
            }
            var dbo = db.db(process.env.MONGODB_DATABASE);
            var parentdata;
            var myobj;
            var parentcollection;
            var collection;
            if(layer == 1) {
                parentdata = await dbo.collection('threads').findOne({_id: parentObjectID});
                myobj = {author: author, date: date, level: 'layer#1', parntid: parentObjectID, childs: [], title: title, text: text}
                collection = 'comments';
                parentcollection = 'threads';
            } else if (layer == 2) {
                parentdata = await dbo.collection('comments').findOne({_id: parentObjectID});
                myobj = {author: author, date: date, level: 'layer#2', parntid: parentObjectID, title: title, text: text}
                collection = 'subcomments';
                parentcollection = 'comments';
            } else {
                res.json({message: 'give a valid number for the layer (1 or 2)'});
                res.status(200);
                res.end();
            }
            if(parentdata == null) {
                res.json({message: 'parent object does not exist, please give an existing object id'});
                res.status(200);
                res.end()
            } else {
                dbo.collection(collection).insertOne(myobj, function(err, response) {
                    if (err) {
                        res.json({message: err});
                        res.status(500);
                        res.end();
                    }
                    if(parentdata.childs.length == 0) {
                        dbo.collection(parentcollection).updateOne({_id: parentObjectID}, {$set: {childs: [myobj._id]}});
                    } else {
                        dbo.collection(parentcollection).updateOne({_id: parentObjectID}, {$set: {childs: [...parentdata.childs, myobj._id]}});
                    }
                    res.json({message: "comment created", id: myobj._id, author: myobj.author, date: myobj.date, level: myobj.level, parentid: myobj.parentid, title: myobj.title, text: myobj.text});
                    res.status(201);
                    res.end();
                })
            }
        });
    } else {
        res.status(307);
        res.redirect('/tempuser/join');
        res.end();
    }
});

router.get('/resume/', async(req, res) => {
	try {
		MongoClient.connect(url, async function(err, db) {
            if (err) throw err;
            var dbo = db.db(process.env.MONGODB_DATABASE);
            const data = await dbo.collection('threads').find().toArray();
			for (let i = 0; i < data.length; i++) {
				delete data[i].childs;
			}
			res.json({thread: data});
			res.status(200);
			res.end();
		})
	} catch (err) {
		res.json({message: err});
		res.status(500);
		res.end();
	}
});

router.get('/search/:threadid', async (req, res) => {
	MongoClient.connect(url, async function(err, db) {
        if (err) throw err;
        var dbo = db.db(process.env.MONGODB_DATABASE);
		const threadid = req.params.threadid;
		var objectID;
		try {
			objectID = new mongo.ObjectID(threadid)
		} catch (e) {}
        const data = await dbo.collection('threads').findOne({_id: objectID});
        res.json({thread: data});
        res.status(200);
        res.end();
    })
});

module.exports = router;