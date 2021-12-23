module.exports = async function (context, req) {

    // Inject configuration via Azure Static Web App front end,
    // returning via Functions API
    var response = {
        identity: process.env.SHAREDO_IDENTITY,
        api: process.env.SHAREDO_API,
        clientId: process.env.SHAREDO_CLIENTID,
        clientSecret: process.env.SHAREDO_CLIENTSECRET,
        redirectUri: process.env.SHAREDO_REDIRECTURL,
    };
    
    context.res.json(response);
};