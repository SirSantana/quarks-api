const nodemailer = require('nodemailer')

 function getTemplate(name, token) {
    return `
      <head>
      <link rel="stylesheet" href="./style.css">
  </head>
  
  <div id="email___content">
      <img src="/images/logo_colmotors.png" alt="">
      <h2>Bienvenido a colMotors ${name}</h2>
      <p>Para confirmar tu cuenta, ingresa al siguiente enlace</p>
      <a
          href="https://col-motors21-04.vercel.app/auth/confirm/${token}"
          target="_blank"
      >Confirmar Cuenta</a>
  </div>
      `;
  }

   function getTemplate2(codigo) {
    return `
      <head>
      <link rel="stylesheet" href="./style.css">
  </head>
  
  <div id="email___content">
      <h2>Quarks, tu vehículo a la mano</h2>
      <p>Digita el siguiente codigo en la aplicacion</p>
      <b>${codigo}</b>

      
  </div>
      `;
  }


 async function sendMail(mailOptions, template) {

    mailOptions.html = template


    let transporter = nodemailer.createTransport({
        tls: {
            rejectUnauthorized: false
        },
        secure: false, // true for 465, false for other ports
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user:process.env.NEXT_PUBLIC_MAIL_USERNAME,
          pass:process.env.NEXT_PUBLIC_MAIL_PASSWORD,
          clientId:process.env.NEXT_PUBLIC_OAUTH_CLIENTID,
          clientSecret:process.env.NEXT_PUBLIC_OAUTH_CLIENT_SECRET,
          refreshToken:process.env.NEXT_PUBLIC_OAUTH_REFRESH_TOKEN,
        },
        
      });
      await new Promise((resolve, reject) => {
        // verify connection configuration
        transporter.verify(function (error, success) {
            if (error) {
                console.log(error);
                reject(error);
            } else {
                console.log("Server is ready to take our messages");
                resolve(success);
            }
        });
    });

    
    await new Promise((resolve, reject) => {
        // send mail
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                console.log(info);
                resolve(info);
            }
        });
    });
    

}

module.exports={getTemplate2,sendMail}