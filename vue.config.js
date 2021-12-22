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
    }
}
