const nodemailer = require("nodemailer");
const imaps = require('imap-simple');
const mimemessage = require("mimemessage");
const { logError } = require("./terminal");

const internals = {};

internals.config = {
	imap: {
		port: 993,
		tls: true,
		authTimeout: 3000
	},
	smtp: {
		auth: {},
		port: 465,
		secure: true
	},
	report: {}
};

/**
 *
 * @param {EmailConfig} config
 */
const loadEmailConfig = (config) => {
	internals.config.imap.user = config.user;
	internals.config.imap.password = config.password;
	internals.config.imap.host = config.host || config.hostSMTP;
	internals.config.smtp.auth.user = config.user;
	internals.config.smtp.auth.pass = config.password;
	internals.config.smtp.host = config.host || config.hostIMAP;
	internals.config.report.from = config.user;
	internals.config.report.to = config.to;
	internals.config.report.cc = config.cc;
	internals.config.report.subject = config.subject;
};

// TODO
const sendEmailAndAppendMessageToSentEmailBox = async (dailyReport) => {
	/*await internals.sendEmail(internals.config.smtp, {
		from: internals.config.report.from,
		to: internals.config.report.to,
		cc: internals.config.report.cc,
		subject: internals.config.report.subject,
		html: dailyReport
	});*/
	const emailText = internals.constructEmailToIMAP(internals.config.report, dailyReport);
	await internals.addEmailToSentBox(internals.config.imap, emailText);
};

internals.sendEmail = async (config, message) => {
	try {
		const transporter = nodemailer.createTransport(config);
		return await transporter.sendMail(message);
	}
	catch(error) {
		logError('Error while sending email');
		throw error;
	}
};

internals.addEmailToSentBox = async (config, emailText) => {
	try{
		const connection = await imaps.connect({ imap: config });
		connection.append(emailText, { mailbox: 'Sent Items' });
		connection.end();
	}
	catch(error) {
		logError('Error while appending email to sent email box');
		throw error;
	}
};

// test the connection with the server responsible for sending emails using SMTP protocol
internals.verifySendEmailConnection = async () => {
};

// test the connection with the receiving email server using IMAP protocol
internals.verifyRetrievingEmailConnection = async () => {
	try {
		const connection = await imaps.connect(internals.config.imap);
		connection.end();
		// TODO - decide return true;
	}
	catch(error) {
		return null;
	}
};

internals.constructEmailToIMAP = (reportConfig, dailyReport) => {
	let msg, htmlEntity, plainEntity;
	msg = mimemessage.factory({
		contentType: 'multipart/alternate',
		body: []
	});
	htmlEntity = mimemessage.factory({
		contentType: 'text/html;charset=utf-8',
		body: dailyReport
	});
	/*plainEntity = mimemessage.factory({
		body: data.body
	});*/
	//msg.header('Message-ID', '<1234qwerty>');
	msg.header('From', reportConfig.from);
	msg.header('To', reportConfig.to);
	msg.header('CC', reportConfig.cc);
	msg.header('Subject', reportConfig.subject);
	msg.body.push(htmlEntity);
	return msg.toString();
};


module.exports= {
	sendEmailAndAppendMessageToSentEmailBox,
	loadEmailConfig
};