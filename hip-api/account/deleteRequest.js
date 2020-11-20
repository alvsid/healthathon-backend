const Consent = require('../schema').Consent;

exports.deleteRequest = (event, context, callback)=>{
    const sub = String(event.requestContext.authorizer.claims.sub);

    Consent.delete(sub, (error) => {
        if (error) {
            console.error(error);
        } else {
            console.log("Successfully deleted item");

            var response = {
                statusCode: 200,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Credentials': true,
                },
            };

            callback(null, response);
        }
    });
}