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

/*
TODO - fazer com que o script executado pelo cmd seja sempre em modo de producao
e quando e executado no webstorm e executado em modo de DEBUG -
1 forma. adicionar a variable de ambiente no .bat e no webstorm nas configs de execucao.
2. injectar diferentes ficheiros de config para o sistema

Todo - verify if there is internet, if not save immediatly and do not allow override of files
 */

/*
TODO - Refactoring cold to new rep.
TODO - MVP
TODO - ENV File
TODO -
 4. caso o email nao seja enviado com successo, guarda a mensagem e volta a tentar enviar mais tarde
 5. before send an email, present the email and ask if everything is ok..
 6. quando iniciar o programa, verifica se existe algum report para enviar..
 1. quando a mensagem for construida - guardar a mensagem numa pasta do projecto
 2. quando enviar a mensagem com sucesso apaga o ficheiro com a mensagem
 3. caso haja algum ficheiro entao, no inicio do programa pergunta se quero enviar a mensagem ou elimina-la/discarta-la
 4. antes de enviar a mensagem perguntar se esta tudo ok, e se quero guardar ou enviar.
 7. quando perguntar se e preciso editar ou se esta bom e pode enviar, permitir
 selecionar qual o issue que é preciso modificar, e depois que campo é preciso modificar.

TODO - if in .env file receives DEBUG=TRUE - entao o logo.debug imprime! - o que posso fazer é modificar o valor da funcao,
in debug mode, debug is a empty function, so there is no need to very everytime if the env is debug
 */
/*
 const m = checkForMessagesToSend();
 if (m) {
 askWhatToDoWithOldMessages();
 act();
 askIfIsNecessaryToSendANewReport();
 }
 askDailyReportQuestions(); // TODO save on file Finish
 checkIfEverythingIsCorrectToSendEmail();
 SendEmail();
 */