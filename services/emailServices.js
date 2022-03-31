require('dotenv').config();
const sgMail = require('@sendgrid/mail');
const Handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
sgMail.setApiKey(process.env.SEND_GRID_API_SECRET_KEY);

// this helps in reading the html file
const readMyFileAndReturnPromise = (dirpath) => {
	return new Promise((resolve, reject) => {
		fs.readFile(dirpath, { encoding: 'utf-8' }, (err, fileRead) => {
			if (err) {
				reject(err);
			}
			resolve(fileRead);
		});
	});
};

//this helps in rendering the html document with the help of handle Bars... it takes four parameters User email, email title, datareplacement, and Html filename to render
const readFileAndSendEmail = async (
	toEmail,
	emailHeader,
	dataReplacement,
	filename
) => {
	let dirpath = path.join(__dirname, `../views/templates/${filename}.html`);
	let readTheFile = await readMyFileAndReturnPromise(dirpath);
	const template = Handlebars.compile(readTheFile);
	const result = template(dataReplacement);
	const msg = {
		to: toEmail,
		from: 'info@afriglobal.com.ng', // Use the email address or domain you verified above
		subject: emailHeader,
		html: result,
	};
	sgMail
		.send(msg)
		.then(() => {
			return 'sucesss';
		})
		.catch((err) => {
			console.log('error: ', JSON.stringify(err.response.body));
			return 'failed';
		});
};

module.exports = {
	readFileAndSendEmail,
};
