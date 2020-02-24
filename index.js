"use strict";
// Load External Modules
require('dotenv').config();
// Load Project Modules
const { formatDailyReport, saveDailyReport, askDailyReportQuestions, sendDailyReport } = require("./dailyReport");
const { logError, welcomeMessage, log } = require("./terminal");


const main = async () => {
	await welcomeMessage();
	if (!process.env.EMAIL_TO) {
		logError('Set the email recipients!');
		process.exit();
	}
	const reportAnswers =  await askDailyReportQuestions();

	// construct and save report
	const dailyReport = formatDailyReport(reportAnswers);
	const filepath = await saveDailyReport(dailyReport);

	// message preview
	log(`from: ${process.env.EMAIL_USER}
to: ${process.env.EMAIL_TO}
cc: ${process.env.EMAIL_CC}
subject: ${process.env.EMAIL_SUBJECT}
message: 
${dailyReport}`);

	// send report
	const result = await sendDailyReport(filepath, dailyReport);
	if (!result.send) {
		// TODO - retry - log and call function again - call delete explicitly
	}

};

main().catch((error) => { logError(error.stack); });