const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');
const SendinblueTransport = require('nodemailer-sendinblue-transport');

module.exports = class Email {
	constructor(user, url) {
		this.to = user.email;
		this.name = user.name;
		this.url = url;
		this.from = process.env.EMAIL_FROM;
	}

	/**
	 * @desc create new transporter to send mail
	 * @return {nodemailer.Transporter}
	 */
	newTransport() {
		// FOR DEPLOYMENT -> BREVO
		if (process.env.NODE_ENV === 'production') {
			return nodemailer.createTransport(
				new SendinblueTransport({
					apiKey: process.env.BREVO_API_KEY,
				})
			);
		}

		// FOR DEV -> nodemailer. visit mailtrap.io to see
		if (process.env.NODE_ENV === 'development') {
			return nodemailer.createTransport({
				host: process.env.EMAIL_HOST,
				port: process.env.EMAIL_PORT,
				auth: {
					user: process.env.EMAIL_USERNAME,
					pass: process.env.EMAIL_PASSWORD,
				},
			});
		}
	}

	// send actual email with nice UI
	/**
	 * @desc send mail helper
	 *
	 * @param {String} template - name of template view in views/email folder
	 * @param {String} subject - Subject of sended email
	 * @return {Promise<void>}
	 */
	async send(template, subject, { ...other }) {
		// 1) Render Html based on pug template
		const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
			name: this.name,
			url: this.url,
			subject,
			...other,
		});

		// 2) Email options
		const mailOptions = {
			from: this.from,
			to: this.to,
			subject,
			html,
			text: htmlToText.fromString(html),
		};

		// 3) Create a new transport and send email
		await this.newTransport().sendMail(mailOptions);
	}

	async sendDesignInvitation(fromUser) {
		await this.send('invitation.design', 'You have received an invitation to join a design!', {
			fromUser,
		});
	}

	async sendTemplateInvitation(fromUser) {
		await this.send('invitation.template', 'You have received an invitation to access a template!', {
			fromUser,
		});
	}

	async sendPasswordReset() {
		await this.send('passwordReset', 'Your password reset token (valid for 10 minutes)');
	}
};
