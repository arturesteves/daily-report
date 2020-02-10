const inquirer = require('inquirer');

const internals = {};

internals.askHowManyIssuesTouched = async () => {
	const key = 'issuesToReport';
	const numberOfIssues = await inquirer.prompt([	{
		type: 'input',
		name: key,
		message: 'How many issues to report?',
		validate: async (input) => {
			if (isNaN(input)) {
				return 'Not a number';
			} else if (input == 0) {
				return 'You must report issues.';
			}
			return true;
		}
	}]);
	return numberOfIssues[key];
};

internals.askDailyReportQuestions = async (numberOfIssueToReport) => {
	const questions = [
		{
			type: 'input',
			name: 'issue',
			message: 'What is the issue ID?'
		},
		{
			type:'list',
			name: 'state',
			message: 'What is the state of the issue?',
			choices: [
				{
					key: 1,
					name: 'Development',
					value: 'development'
				},
				{
					key: 2,
					name: 'Test',
					value: 'test',
				},
				{
					key: 3,
					name: 'Review',
					value: 'review'
				} ]
		},
		{
			type: (prev) => prev !== 'review' ? 'list' : null,
			name: 'estimation',
			default: '---',
			//choices: [{'+8h'}]
		}
	];
	let answers = [];
	for (let i = 0; i < numberOfIssueToReport; i++) {
		const response = await inquirer.prompt(questions);
		console.log(`Responses: ${i}: ${JSON.stringify(response)}`);
		answers.push(response);
	}
	return answers;
};

module.exports = {
	askHowManyIssuesTouched: internals.askHowManyIssuesTouched,
	askDailyReportQuestions: internals.askDailyReportQuestions
};