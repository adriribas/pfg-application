import nodemailer from 'nodemailer';
import config from 'config';
import createDebugger from 'debug';

const debug = createDebugger('pfgs:email');

const transporter = nodemailer.createTransport({
  ...config.get('email.server'),
  secure: false,
  auth: config.get('email.auth')
});

const mapParams = (msg, params) =>
  Object.entries(params).reduce((accum, [key, value]) => accum.replaceAll(`%${key}%`, value), msg);

export const sendEmail = (to, { subject, text, html }, params) => {
  debug('Sending an email to %s', to);
  debug('Subject: %s', subject);
  debug('Text body: %s', text && mapParams(text, params));
  debug('HTML body: %s', html && mapParams(html, params));

  /*transporter.sendMail({
    from: config.get('email.user'),
    to,
    subject,
    text: mapParams(text, params),
    html: mapParams(html, params)
  });*/
};
