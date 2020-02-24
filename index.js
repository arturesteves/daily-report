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

	log(dailyReport); // preview

	// send report
	const result = await sendDailyReport(filepath, dailyReport);
	if (!result.send) {
		// TODO - retry - log and call function again - call delete explicitly
	}

};

main().catch((error) => { logError(error.stack); });