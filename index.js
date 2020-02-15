"use strict";
// Load External Modules
require('dotenv').config();
const figlet = require('figlet');
// Load Project Modules
const { formatDailyReport, saveDailyReport, askDailyReportQuestions, sendDailyReport } = require("./dailyReport");
const { logError, logSuccess } = require("./terminal");


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

	// send report
	const result = await sendDailyReport(filepath, dailyReport);
	if (!result.send) {
		// TODO - retry - log and call function again - call delete explicitly
	}

};

const welcomeMessage = async () => {
	return new Promise ((resolve, reject) => {
		figlet.text('Elecctro Daily Report', {
			font: 'Big',
			horizontalLayout: 'default',
			verticalLayout: 'default'
		}, function(err, data) {
			if (err)  {
				logError(`Something went wrong with the welcome Message`);
				reject(err);
			}
			logSuccess(data);
			resolve();
		});
	});
};

main().catch((error) => { logError(error.stack); });