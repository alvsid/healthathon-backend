// const Consent = require('./schema').Consent;
var axios = require('axios');
var AWS = require('aws-sdk');
AWS.config.update({ region: "ap-south-1" });

// Consent.create({
//     cust_id: 'asdkfjlakdsjf',
// }, handleCust);

// function handleCust(error, consent) {
//     if (error) return console.log(error);

//     var response = {
//         statusCode: 200,
//         headers: {
//             'Access-Control-Allow-Origin': '*',
//             'Access-Control-Allow-Credentials': true,
//         },
//         body: JSON.stringify(consent)
//     }

//     console.log(response);

//     // callback(null, response)
// }

const Consent = require('./schema').Consent;
var ClientOAuth2 = require('client-oauth2');
var axios = require('axios');

var finAuth = new ClientOAuth2({
    clientId: 'healthathon-d2-wing',
    clientSecret: '8fc111b1-5f76-462d-831b-a9d113633554',
    accessTokenUri: 'https://id.finarkein.com/auth/realms/finarkein/protocol/openid-connect/token',
    scopes: ['profile openid']
})

const sub = '7cfec3c2-dfec-4f34-ba69-ef5333e09be4';
var response;
var myUser;
var token;

Consent.get(sub, (error, data) => {
    if (error) {
        console.error(error);
    } else {
        console.log(data);
        myUser = data;

        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true,
            },
            body: JSON.stringify(data)
        }

        try {
            if (data.linked == 'REQUESTED') {
                getAccessToken();
            } else {
                console.log( response);
            }

            console.log('Completed Try');


        } catch (error) {
            console.log('in catch block');
            console.log( response);
        }
    }
});

function getAccessToken() {
    console.log('inside accesstoken');
    finAuth.credentials.getToken()
        .then(function (user) {
            token = user.data.access_token;
            checkConsentStatus();
        });
}

function checkConsentStatus() {
    console.log('inside checksonsentstatus');
    var data = JSON.stringify(JSON.parse(myUser.accessToken));

    var config = {
        method: 'post',
        url: 'https://api.finarkein.com/health/hiu/consent/status',
        headers: {
            'X-CM-ID': 'sbx',
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json',
            'Cookie': 'JSESSIONID=BEEC8FE27C35B8E79CFFDA9860511F73'
        },
        data: data
    };

    console.log(config);

    axios(config)
        .then(function (finResponse) {
            console.log(JSON.stringify(finResponse.data));

            Consent.update({ "cust_id": sub }, { "consentRequestId": finResponse.data.consentRequestId, "linked": finResponse.data.status }, (error, user) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log(user);
                    response.body = JSON.stringify(user);

                    console.log( response);
                }
            });
        })
        .catch(function (error) {
            console.log(error);
        });
}

