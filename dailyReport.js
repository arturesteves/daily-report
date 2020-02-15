// Load External Modules
const fs = require('fs').promises;
// Load Project Modules
const { loadEmailConfig, sendEmailAndAppendMessageToSentEmailBox } = require("./email");
const { logSuccess, logError, logDebug, ask } = require("./terminal");

// declare private functions
const internals = {};

const questionsInfo = {
	numberOfIssuesToReport: {
		key: 'numberOfIssuesToReport',
		defaultValue: '1',
		validate: (input) => {
			if (isNaN(parseInt(input))) {
				return 'Not a number';
			} else if (parseInt(input) === 0) {
				return 'You must report issues.';
			}
			return true;
		},
		return: (input) => { return parseInt(input); }
	},
	id: {
		key: 'id',
		validate: (input) => {
			if (!input) {
				return 'You must define the issue ID';
			}
			return true;
		}
	},
	state: {
		key: 'state',
		options: ['Development', 'Test', 'Review', 'Paused'],
		defaultValue: 'Development'
	},
	description: {
		key: 'description',
		validate: (text) => {
			if (text.length < 6) {
				return 'Description is too short.'
			}
			return true;
		}
	},
	estimation:{
		key: 'estimation',
		options: ['---', '1h-3h', '2h-4h', '2h-6h', '3h-6h', '4h-8h', '8h+'],
		defaultValue: '---',
		askWhen: (state) => {
			return state === 'Development' || state === 'Test';
		}
	}
};

/**
 *
 * @returns {Promise<[Issue]>}
 */
const askDailyReportQuestions = async () => {
	const firstAnswer = await ask([
		{
			type: 'input',
			name: questionsInfo.numberOfIssuesToReport.key,
			message: 'How many issues to report?',
			default: questionsInfo.numberOfIssuesToReport.defaultValue,
			validate: questionsInfo.numberOfIssuesToReport.validate,
		}
	]);
	const numberOfIssuesToReport = questionsInfo.numberOfIssuesToReport.return(firstAnswer[questionsInfo.numberOfIssuesToReport.key]);
	logDebug(`numberOfIssueToReport: ${numberOfIssuesToReport}`);

	let answers = [];
	for (let i = 0; i < numberOfIssuesToReport; i++) {
		const secondAnswers = await ask([
			{
				type: 'input',
				name: questionsInfo.id.key,
				message: 'What is the issue ID?',
				validate: questionsInfo.id.validate
			},
			{
				type:'list',
				name: questionsInfo.state.key,
				message: 'What is the state of the issue?',
				choices: questionsInfo.state.options
			},
			{
				type: 'input',
				name: questionsInfo.description.key,
				message: 'Describe what was accomplished today.',
				validate: questionsInfo.description.validate
			},
			{
				type: 'list',
				name: questionsInfo.estimation.key,
				message: 'Time estimation to complete the issue in hours?',
				choices: questionsInfo.estimation.options,
				when: (answers) => {
					return questionsInfo.estimation.askWhen(answers.state);
				}
			}
		]);
		if (!secondAnswers.estimation) {
			secondAnswers.estimation = questionsInfo.estimation.defaultValue;
		}
		answers.push(secondAnswers);
	}

	logDebug(`Answers: ${JSON.stringify(answers)}`);
	return answers;
};

/**
 *
 * @param {Issue} issue
 * @returns {string} Report body
 */
internals.completeReportBodyTemplate = (issue) => {
	return `</br>
<b>Issue</b>: ${internals.reportConfig.youtrackURL}${issue.id} </br>
<b>State of the issue</b>: ${issue.state} </br>
<b>Description/Accomplished</b>: ${issue.description} </br>
<b>Estimation</b>: ${issue.estimation}</br>
`;
};

/**
 *
 * @returns {string} Report header
 */
internals.completeReportHeaderTemplate = () => {
	return `PDS ---| ${internals.formatDateOfToday()} |---`;
};

/**
 *
 * @param {string} [separator]
 * @returns {string} Date formatted in DD/MM/YYYY
 */
internals.formatDateOfToday = (separator='/') => {
	const date = new Date();
	const dayWithLeadingZero = (date.getDate() + '').padStart(2, '0');
	const mothWithLeadingZero = ((date.getMonth() + 1) + '').padStart(2, '0');
	return `${dayWithLeadingZero}${separator}${mothWithLeadingZero}${separator}${date.getFullYear()}`;
};

internals.completeReportFooterTemplate = () => { };

/**
 *
 * @param {[Issue]} issues
 * @returns {string} Daily report formatted
 */
const formatDailyReport = (issues) => {
	internals.reportConfig = { youtrackURL: process.env.YOUTRACK_URL };

	let reportFormatted = internals.completeReportHeaderTemplate();
	reportFormatted += '\n';
	issues.map((issue) => {
		reportFormatted += internals.completeReportBodyTemplate(issue);
	});

	logDebug(`Daily Report Formatted: \n${reportFormatted}`);
	return reportFormatted;
};

/**
 *
 * @param {DailyReport} dailyReport
 * @returns {Promise<string>} Report filepath
 */
const saveDailyReport = async (dailyReport) => {
	const filename = internals.formatDateOfToday('-');
	const directoryPath = './reports';
	const path = `${directoryPath}/${filename}.report`;

	try {
		await internals.saveDailyReportOnFile(path, dailyReport);
		return path;
	}
	catch (error) {
		// No such file or directory
		if (error.code === 'ENOENT') {
			await internals.createReportsDirectory(directoryPath);
			await internals.saveDailyReportOnFile(path, dailyReport);
			return;
		}
		logError(error);
	}
};

/**
 *
 * @param {string} filepath
 * @param {DailyReport} dailyReport
 * @returns {Promise<void>}
 */
internals.saveDailyReportOnFile = async (filepath, dailyReport) => {
	await fs.writeFile(filepath, dailyReport, 'utf8');
};

/**
 *
 * @param {string} path
 * @returns {Promise<void>}
 */
internals.createReportsDirectory = async (path = './reports') => {
	try {
		await fs.mkdir(path, { recursive: true });
	}
	catch(error) {
		logError(error);
	}
};

internals.deleteSavedDailyReport = async (filepath) => {
	await fs.unlink(filepath);
};

const sendDailyReport = async (filepath, dailyReport) => {
	try {
		loadEmailConfig({
			user: process.env.EMAIL_USER,
			password: process.env.EMAIL_PASSWORD,
			host: process.env.EMAIL_HOST,
			to: process.env.EMAIL_TO,
			cc: process.env.EMAIL_CC,
			subject: process.env.EMAIL_SUBJECT
		});
		logDebug(`Sending email to: ${process.env.EMAIL_TO} | from: ${process.env.EMAIL_USER}`);
		const result = await sendEmailAndAppendMessageToSentEmailBox(dailyReport);
		await internals.deleteSavedDailyReport(filepath);
		logSuccess('Email sent with success');
		return { send: true };
	} catch(error) {
		logError(error.stack);
		return { send: false };
	}
};


module.exports = {
	formatDailyReport,
	saveDailyReport,
	sendDailyReport,
	askDailyReportQuestions
};