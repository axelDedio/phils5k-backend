const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config()
const bodyParser = require('body-parser');
const app = express();
let accessToken = '';


app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'))
app.use(cors())
axios.interceptors.request.use(request => {
    console.log(JSON.stringify(request, null, 2))
    return request;
})

async function getActivities(token, before, after, per_page, page) {

    const config = {
        method: 'get',
        url: 'https://www.strava.com/api/v3/athlete/activities',
        params: {before, after, per_page, page},
        headers: { 'Authorization': 'Bearer ' + token}
    }

    let res = await axios(config);

    return res;
}

app.get('/exchange_token', function (req, res) {
    const code = req.query.code;

    axios({
        method: 'post',
        url: 'https://www.strava.com/oauth/token',
        data: {
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code'
        },
        headers: {
            accept: 'application/json'
        }
    }).then((response) => {
        accessToken = response.data.access_token;
        console.log(accessToken);
        res.redirect('http://localhost:4300/home');

    });

});

app.post('/getActivities', async function (req, res) {
    let after;
    let per_page;
    let before;
    let page;
    if (req.body.after) {
        after = req.body.after;
    }
    if (req.body.per_page) {
        per_page = req.body.per_page;
    }
    if (req.body.before) {
        per_page = req.body.before;
    }
    if (req.body.page) {
        per_page = req.body.page;
    }

    const activities = await getActivities(accessToken, before, after, per_page, page);
    await res.send(activities.data);
});

app.get('/auth', function (req, res) {+
    res.redirect(`http://www.strava.com/oauth/authorize?client_id=${process.env.CLIENT_ID}&response_type=code&redirect_uri=http://localhost:3000/exchange_token&approval_prompt=force&scope=activity:read_all`)
});

app.get('/test', function (req, res) {
    res.sendFile(__dirname + '/public/welcome.html')
});
app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
    console.log(process.env.CLIENT_ID);
});
