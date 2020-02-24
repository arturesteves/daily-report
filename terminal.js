"use strict";
// Load External Modules
const inquirer = require('inquirer');
const chalk = require('chalk');
const figlet = require('figlet');

const log = console.log;

/**
 *
 * @param {[Questions]} questions
 * @returns {Promise<void>}
 */
const ask = async (questions) => {
	const result = await inquirer.prompt(questions);
	log('');
	return result;
};

/**
 *
 * @param {string} message message
 */
const logSuccess = (message) => {
	console.log(chalk.green(message));
};

/**
 *
 * @param {string} message message
 */
const logError = (message) => {
	log(chalk.red(message));
};

/**
 *
 * @param {string} message message
 */
const logWarning = (message) => {
	log(chalk.yellow(message));
};

/**
 *
 * @param {string} message message
 */
const logDebug = (message) => {
	if (process.env.NODE_ENV === 'dev') {
		log(chalk.blue(message));
	}
};

/**
 * Log something to the terminal
 * @param {string} message
 */
const terminalLog = (message) => {
	log(chalk.cyan(message));

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

module.exports = {
	logSuccess,
	logDebug,
	logError,
	logWarning,
	log: terminalLog,
	ask,
	welcomeMessage
};
