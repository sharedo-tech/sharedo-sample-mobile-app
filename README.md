# Sharedo sample mobile app
An example mobile app built in Vue/Vuetify using the [sharedo-mobile-core](https://github.com/sharedo-tech/sharedo-mobile-core)
package to interact with an existing sharedo instance.

## Building
```
npm ci          # alternative to `npm install` that doesn't rebuild package-lock.json
npm run build
npm run serve   # also builds & hot-reloads for development
npm run lint
```

## Configuring

1. In sharedo administration, create a new app registration using the "authorization code" flow. Make sure to set `https://localhost:8080/oAuthReply` as a valid redirect url, and also add `https://localhost:8080` as a valid CORS origin. Make a note of the client id and client secret (though the secret is considered to not be secret in this case).

    - Go to https://sharedo-url/admin/identity-server
    - Add App > Add authorisation code flow
    - Mobile PWA / mobile-app / not a secret / refresh=2592000
    - Redirect URL = https://localhost:8080/oAuthReply
    - CORS origin =  https://localhost:8080
    - Tick 'Local forms based login'

2. Edit src\app\settings.js\
Update settings.js to reflect your test sharedo instance.

```
var settings =
{
    identity: "https://[your-identity-url]",
    api: "https://[your-sharedo-url]",
    clientId: "[your-clientid]",
    clientSecret: "[your-clientsecret]",
    redirectUri: "https://localhost:8200/oAuthReply"
}
```

As an alternative you can also set the following environment variables:

```
$env:VUE_APP_IDENTITY="https://[your-identity-url]"
$env:VUE_APP_API="https://[your-sharedo-url]"
$env:VUE_APP_CLIENTID="[your-clientid]"
$env:VUE_APP_CLIENTSECRET="[your-clientsecret]"
$env:VUE_APP_REDIRECTURI="https://[your-oauth-redirect-url]"
```
