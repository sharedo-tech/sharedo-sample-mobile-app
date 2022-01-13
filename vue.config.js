const fs = require('fs');

module.exports = {
    transpileDependencies: [
        'vuetify'
    ],
    devServer: {
        https: {
            key: fs.readFileSync('./certs/localdev-key.pem'),
            cert: fs.readFileSync('./certs/localdev-cert.pem'),
        },
        public: 'https://localhost:8080/'
    },
    pwa: {
        name: 'Sharedo',
        themeColor: '#27aa5e',
        msTileColor: '#000000',
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'black-translucent',
        assetsVersion: '1'
    }
}
