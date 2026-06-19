import { env } from '$env/dynamic/private';

/**
 * Email abstraction with pluggable transports.
 *
 * Transport is chosen by env (EMAIL_PROVIDER):
 *   - "resend" → Resend HTTP API (RESEND_API_KEY)
 *   - "smtp"   → SMTP via nodemailer (SMTP_HOST/PORT/USER/PASS)
 *   - unset / "console" → logs to the console (zero-config local dev)
 *
 * Providers are imported lazily so unused SDKs aren't bundled into the server
 * start path. Add a transport by writing one async function and wiring it in
 * `getTransport()`.
 */

export interface EmailMessage {
	to: string;
	subject: string;
	html: string;
	text: string;
}

type Transport = (message: EmailMessage) => Promise<void>;

function fromAddress(): string {
	return env.EMAIL_FROM || 'SvelteKit Template <onboarding@example.com>';
}

const consoleTransport: Transport = async (message) => {
	console.info(
		`\n📧 [email:dev] To: ${message.to}\n   Subject: ${message.subject}\n   ${message.text}\n`
	);
};

const resendTransport: Transport = async (message) => {
	const { Resend } = await import('resend');
	const resend = new Resend(env.RESEND_API_KEY);
	const { error } = await resend.emails.send({
		from: fromAddress(),
		to: message.to,
		subject: message.subject,
		html: message.html,
		text: message.text
	});
	if (error) throw new Error(`Resend error: ${error.message}`);
};

const smtpTransport: Transport = async (message) => {
	const nodemailer = await import('nodemailer');
	const transporter = nodemailer.createTransport({
		host: env.SMTP_HOST,
		port: Number(env.SMTP_PORT || 587),
		secure: env.SMTP_SECURE === 'true',
		auth:
			env.SMTP_USER && env.SMTP_PASS
				? { user: env.SMTP_USER, pass: env.SMTP_PASS }
				: undefined
	});
	await transporter.sendMail({
		from: fromAddress(),
		to: message.to,
		subject: message.subject,
		html: message.html,
		text: message.text
	});
};

function getTransport(): Transport {
	switch ((env.EMAIL_PROVIDER || '').toLowerCase()) {
		case 'resend':
			return resendTransport;
		case 'smtp':
			return smtpTransport;
		default:
			return consoleTransport;
	}
}

export async function sendEmail(message: EmailMessage): Promise<void> {
	await getTransport()(message);
}

// ── Templated emails ────────────────────────────────────────────────────────

function appName(): string {
	return env.APP_NAME || 'SvelteKit Template';
}

/** Minimal branded button email layout shared by all templates. */
function layout(title: string, body: string, cta?: { label: string; url: string }): string {
	const button = cta
		? `<p style="margin:24px 0;"><a href="${cta.url}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">${cta.label}</a></p>`
		: '';
	return `
		<div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
			<h2>${title}</h2>
			${body}
			${button}
			<p style="color:#666;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
		</div>`;
}

export async function sendMagicLinkEmail(email: string, url: string): Promise<void> {
	await sendEmail({
		to: email,
		subject: `${appName()} — your sign-in link`,
		text: `Sign in to ${appName()}: ${url}`,
		html: layout(`Sign in to ${appName()}`, '<p>Click below to sign in. This link expires shortly and can be used once.</p>', {
			label: 'Sign in',
			url
		})
	});
}

export async function sendVerificationEmail(email: string, url: string): Promise<void> {
	await sendEmail({
		to: email,
		subject: `${appName()} — verify your email`,
		text: `Verify your email for ${appName()}: ${url}`,
		html: layout('Verify your email', '<p>Confirm your email address to finish setting up your account.</p>', {
			label: 'Verify email',
			url
		})
	});
}

export async function sendPasswordResetEmail(email: string, url: string): Promise<void> {
	await sendEmail({
		to: email,
		subject: `${appName()} — reset your password`,
		text: `Reset your password for ${appName()}: ${url}`,
		html: layout('Reset your password', '<p>Click below to choose a new password. This link expires shortly.</p>', {
			label: 'Reset password',
			url
		})
	});
}
