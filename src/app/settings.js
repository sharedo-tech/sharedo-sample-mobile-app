import App from "./App";

var settings =
{
    identity: "https://xyz-identity.sharedo.co.uk",
    api: "https://xyz.sharedo.co.uk",
    clientId: "mobile-app",
    clientSecret: "not a secret",
    redirectUri: "https://localhost:8080/oAuthReply",
}

// DO NOT commit actual configuration to git.
//
// Two ways to override the default environment variables above:
//
// 1. Locally - set VUE_APP_* from commandline
// e.g.: $env:VUE_APP_IDENTITY="https://my-sharedo-identity.local"
//       $env:VUE_APP_API="https://my-sharedo.local"
//       $env:VUE_APP_CLIENTID="my-id"
// 
// 2. When hosted in Azure Static Web Apps - set SHAREDO_* in application settings
// e.g.: SHAREDO_IDENTITY="https://my-sharedo-identity.local"
//       etc.
//
if (process && process.env) {
    settings.identity = process.env.VUE_APP_IDENTITY || settings.identity;
    settings.api = process.env.VUE_APP_API || settings.api;
    settings.clientId = process.env.VUE_APP_CLIENTID || settings.clientId;
    settings.clientSecret = process.env.VUE_APP_CLIENTSECRET || settings.clientSecret;
    settings.redirectUri = process.env.VUE_APP_REDIRECTURI || settings.redirectUri;
}

function get() {

    // Try to get config from Functions API, handling errors graceful
    return new Promise((resolve, reject) => {
        fetch("/api/settings")
            .then(function (response) {
                if (!response.ok)
                    throw new Error("Functions call failed: " + response.status);

                return response.json();
            })
            .then(function (response) {
                // Override default settings with result of Functions API call
                App.settings = { ...settings, ...response };
                resolve(App.settings);
            })
            .catch(function () {
                console.log("Functions not running? Using defaults");
                App.settings = settings;
                resolve(App.settings);
            });
    });
}

export default
    {
        get,
    };
