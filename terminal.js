"use strict";
// Load External Modules
const inquirer = require('inquirer');
const chalk = require('chalk');

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
	log(chalk.blue(message));
};


module.exports = {
	logSuccess,
	logDebug,
	logError,
	logWarning,
	ask
};
