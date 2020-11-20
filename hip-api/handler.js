const Consent = require('./schema').Consent;
var ClientOAuth2 = require('client-oauth2');
var axios = require('axios');

var finAuth = new ClientOAuth2({
  clientId: 'healthathon-d2-wing',
  clientSecret: '8fc111b1-5f76-462d-831b-a9d113633554',
  accessTokenUri: 'https://id.finarkein.com/auth/realms/finarkein/protocol/openid-connect/token',
  scopes: ['profile openid']
})

exports.hello = (event, context, callback) => {

  var token;
  const cmId = event.pathParameters.cmId;

  finAuth.credentials.getToken()
    .then(function (user) {
      token = user.data.access_token;
      createConsentRequest();
    });

  function createConsentRequest() {

    var data = JSON.stringify({ "purposeText": "Care Management", "purposeCode": "CAREMGT", "patientId": cmId, "hiuId": "finarkein-001", "hipId": "lh-28", "requesterName": "Dr. Formatter", "requesterIdentifierType": "REGNO", "requesterIdentifierValue": "MH1001", "requesterIdentifierSystem": "https://www.mciindia.org", "hiTypes": ["DischargeSummary", "DiagnosticReport", "OPConsultation", "Prescription"], "permissionAccessModes": "VIEW", "dateRange": { "from": "2019-10-01T18:17:25.525Z", "to": "2021-10-13T18:17:25.525Z" }, "frequency": { "unit": "HOUR", "value": 0, "repeats": 2 }, "dataEraseAt": "2021-10-13T18:17:25.525Z" });

    var config = {
      method: 'post',
      url: 'https://api.finarkein.com/health/hiu/consent/init',
      headers: {
        'X-CM-ID': 'sbx',
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
        // 'Cookie': 'JSESSIONID=1898FACD28218BFE9387CF03D99BA650'
      },
      data: data
    };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));


        Consent.create({
          cust_id: String(event.requestContext.authorizer.claims.sub),
          cmId: cmId,
          requestId: response.data.requestId,accessToken: JSON.stringify(response.data),
        }, handleCust);

      })
      .catch(function (error) {
        console.log(error);
      });

  }


  function handleCust(error, consent) {
    if (error) return console.log(error);

    var response = {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
      },
      body: JSON.stringify(consent)
    }

    callback(null, response)
  }
}
