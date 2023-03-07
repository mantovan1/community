const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const generateNickname = require('../helper/sortfunnynames.js');

router.get('/join', async (req, res) => {
	var date_of_creation;
	var date_of_expiration;
	const current_date = Date.now();
	if(!req.session.userName) {
		const userName = await generateNickname() + uuidv4();
		req.session.userName = userName;
		req.session.date_of_creation   = current_date;
		req.session.date_of_expiration = current_date + 11 * 60 * 60 * 1000;
		date_of_creation   = new Date(req.session.date_of_creation).toString();
		date_of_expiration = new Date(req.session.date_of_expiration).toString();
		res.json({message: 'temp user created, you can use this account for 12 hours. After that it will be deleted', username: req.session.userName, date_of_creation: date_of_creation, date_of_expiration: date_of_expiration});
		res.status(201);
		res.end();
	} else {
		date_of_creation   = new Date(req.session.date_of_creation);
        date_of_expiration = new Date(req.session.date_of_expiration);
		var timeleft = Math.abs(date_of_creation.getTime() - date_of_expiration.getTime()) / 3600000;
		res.json({message: 'temp user already created', username: req.session.userName, date_of_creation: date_of_creation.toString(), date_of_expiration: date_of_expiration.toString(), timeleft: timeleft});
		res.status(200);
		res.end();
	}	
});

router.get('/info', async(req, res) => {	
	if(!req.session.userName) {
		res.status(307);
		res.redirect('/tempuser/join');
		res.end();
	} else {
		res.json({username: req.session.userName});
        res.status(200);
        res.end();
	}
});

module.exports = router;