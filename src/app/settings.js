
var settings =
{
    identity: "https://xyz-identity.sharedo.co.uk",
    api: "https://xyz.sharedo.co.uk",
    clientId: "mobile-app",
    clientSecret: "not a secret",
    redirectUri: "https://localhost:8080/oAuthReply",
}

// Default to environment variables (VUE_APP_*) if specified
// Set from command line before launching `npm run serve` or `npm run build`
// e.g.: $env:VUE_APP_IDENTITY="https://my-sharedo-identity.local"
//       $env:VUE_APP_API="https://my-sharedo.local"
//       $env:VUE_APP_CLIENTID="my-id"
// 
// This is here so we don't commit URLs or client id's to git.
//
// You can remove this if you've set the settings up above
// 
if( process && process.env )
{
    settings.identity = process.env.VUE_APP_IDENTITY || settings.identity;
    settings.api = process.env.VUE_APP_API || settings.api;
    settings.clientId = process.env.VUE_APP_CLIENTID || settings.clientId;
    settings.clientSecret = process.env.VUE_APP_CLIENTSECRET || settings.clientSecret;
    settings.redirectUri = process.env.VUE_APP_REDIRECTURI || settings.redirectUri;
}

export default settings;
