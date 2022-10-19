import nodemailer from 'nodemailer';
import config from 'config';
import jsonfile from 'jsonfile';
import createDebugger from 'debug';

const debug = createDebugger('pfgs:email');

const transporter = nodemailer.createTransport({
  ...config.get('email.server'),
  secure: false,
  auth: config.get('email.auth')
});

const mapParams = (msg, params) =>
  Object.entries(params).reduce((accum, [key, value]) => accum.replaceAll(`%${key}%`, value), msg);

const sendEmail = async (to, resourceKey, params) => {
  const { subject, text, html } = await jsonfile.readFile(
    `resources/emailTemplates/${config.get(`email.templates.${resourceKey}`)}.json`
  );

  debug('Sending an email to %s', to);
  debug('Subject: %s', subject);
  debug('Text body: %s', text && mapParams(text, params));
  debug('HTML body: %s', html && mapParams(html, params));

  /* transporter.sendMail({
    from: config.get('email.auth.user'),
    to,
    subject,
    text: (text || '') && mapParams(text, params),
    html: (html || '') && mapParams(html, params)
  }); */
};

export const sendResetPasswordEmail = (user, origin) =>
  sendEmail(user.email, 'resetPassword', {
    link: `${origin}/new-password?reason=resetPassword&token=${user.generateResetPasswordJwt()}`,
    firstName: user.firstName,
    firstName: user.lastName
  });

export const sendEmailConfirmationEmail = (user, currentUser, school, origin) =>
  sendEmail(user.email, 'emailConfirmation', {
    link: `${origin}/new-password?reason=emailConfirmation&token=${user.generateEmailConfirmationJwt()}`,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    createdByFirstName: currentUser.firstName,
    createdByLastName: currentUser.lastName,
    schoolName: school.name
  });
