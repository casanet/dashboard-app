import fse from 'fs-extra';

// Get the store from environment variable as BASE64 string
const casanetKeyStoreBuffer = Buffer.from(process.env.CASANET_KEY_STORE, 'base64');
// Save it as binary file
fse.writeFileSync('casanet-key-store.jks', casanetKeyStoreBuffer);
