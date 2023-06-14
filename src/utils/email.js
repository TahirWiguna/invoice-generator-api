const nodemailer = require("nodemailer");
const { convert } = require("html-to-text");
const { logger } = require("./logger");
const Joi = require("joi");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const maxRetries = process.env.EMAIL_RETRIES_MAX;
const retryDelay = process.env.EMAIL_RETRIES_DELAY;

const sendEmail = async (to, subject, html) => {
  let retries = 0;
  let mailOptions = {
    from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject,
    html,
    text: convert(html),
  };
  const send = async () => {
    return new Promise((resolve, reject) => {
      const rulesEmail = Joi.string().required().email();
      const email = rulesEmail.validate(to);
      if (!email.error) {
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            logger.info(`Error sending email to ${to}: ${error.message}`);
            retries++;
            if (retries < maxRetries) {
              logger.info(`Retrying in ${retryDelay}ms...`);
              setTimeout(() => {
                send().then(resolve).catch(reject);
              }, retryDelay);
            } else {
              logger.info(`Max retries exceeded, giving up.`);
              reject(error);
            }
          } else {
            resolve(info);
          }
        });
      } else {
        reject("Client doesnt have email");
      }
    });
  };
  return send();
};

module.exports = sendEmail;
