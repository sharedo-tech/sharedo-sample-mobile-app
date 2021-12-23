:: Build and run with Azure Functions
npm run build && swa start dist --api-location api --ssl --ssl-cert=".\certs\localdev-cert.pem" --ssl-key=".\certs\localdev-key.pem"