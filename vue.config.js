const fs = require('fs');

module.exports = {
    transpileDependencies: [
        'vuetify'
    ],
    devServer: {
        port: 8081,
        https: {
            key: fs.readFileSync('./certs/localhost+2-key.pem'),
            cert: fs.readFileSync('./certs/localhost+2.pem'),
        },
        public: 'https://localhost:8081/'
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
