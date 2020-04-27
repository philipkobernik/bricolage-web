//console.log({
  //PRIVATE_KEY_ID: process.env.PRIVATE_KEY_ID,
  //PRIVATE_KEY: process.env.PRIVATE_KEY,
  //CLIENT_ID: process.env.CLIENT_ID,
  //CLIENT_EMAIL: process.env.CLIENT_EMAIL,
  //CLIENT_X509_CERT_URL: process.env.PRIVATE_KEY
//})

module.exports = {
  env: {
    PRIVATE_KEY_ID: process.env.PRIVATE_KEY_ID,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    PROJECT_ID: process.env.PROJECT_ID,
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_EMAIL: process.env.CLIENT_EMAIL,
    CLIENT_X509_CERT_URL: process.env.PRIVATE_KEY,
  },
}
