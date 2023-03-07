const bodyParser = require('body-parser');
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const app = express();
require('dotenv').config({ path: require('find-config')('.env') });

const tempuser = require('./routes/tempuser.js'); 
const thread = require('./routes/thread.js');

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const halfDay = 1000 * 60 * 60 * 12;
app.use(sessions({
	secret: process.env.SESSION_SECRET,
    	saveUninitialized:true,
    	cookie: { maxAge: halfDay },
    	resave: false 
}));

app.get('/', async (req, res) => {
	res.json({api_name: 'api community', year_creation: 2022, see_more: 'https://github.com/mantovan1'});
	res.status(200);
	res.end();
})

app.use('/tempuser', tempuser);
app.use('/thread', thread);

app.listen(8080, function() {
	console.log('API rodando na porta :8080');
})

module.exports = app;
