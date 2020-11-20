const Consent = require('../schema').Consent;
var ClientOAuth2 = require('client-oauth2');
var axios = require('axios');

var finAuth = new ClientOAuth2({
    clientId: 'healthathon-d2-wing',
    clientSecret: '8fc111b1-5f76-462d-831b-a9d113633554',
    accessTokenUri: 'https://id.finarkein.com/auth/realms/finarkein/protocol/openid-connect/token',
    scopes: ['profile openid']
})

exports.getCmId = (event, context, callback) => {
    const sub = String(event.requestContext.authorizer.claims.sub);
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
                    getAccessToken_req();
                } else {
                    callback(null, response)
                }

                console.log('Completed Try');


            } catch (error) {
                console.log('in catch block');
                callback(null, response);
            }
        }
    });

    function getAccessToken_req() {
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

                        callback(null, response);
                    }
                });
            })
            .catch(function (error) {
                console.log(error);
            });
    }

}