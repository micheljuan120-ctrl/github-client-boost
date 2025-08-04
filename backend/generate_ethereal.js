const nodemailer = require('nodemailer');

nodemailer.createTestAccount().then(account => {
  console.log(JSON.stringify(account));
}).catch(console.error);
