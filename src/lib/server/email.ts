import { env } from '$env/dynamic/private';

/**
 * Minimal email abstraction.
 *
 * The template ships with a console transport so magic-link / verification
 * flows work locally with zero configuration. Swap `sendEmail` for a real
 * provider (Resend, Postmark, SES, SMTP via nodemailer…) in production.
 */

export interface EmailMessage {
	to: string;
	subject: string;
	html: string;
	text: string;
}

async function consoleTransport(message: EmailMessage): Promise<void> {
	console.info(
		`\n📧 [email:dev] To: ${message.to}\n   Subject: ${message.subject}\n   ${message.text}\n`
	);
}

export async function sendEmail(message: EmailMessage): Promise<void> {
	// Example wiring for a real provider — enable by setting the env vars.
	// if (env.RESEND_API_KEY) { ...call Resend here... ; return; }
	await consoleTransport(message);
}

export async function sendMagicLinkEmail(email: string, url: string): Promise<void> {
	const appName = env.APP_NAME || 'SvelteKit Template';
	await sendEmail({
		to: email,
		subject: `${appName} — your sign-in link`,
		text: `Sign in to ${appName}: ${url}`,
		html: `
			<div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
				<h2>Sign in to ${appName}</h2>
				<p>Click the button below to sign in. This link expires shortly and can be used once.</p>
				<p style="margin: 24px 0;">
					<a href="${url}" style="background:#2563eb;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block;">Sign in</a>
				</p>
				<p style="color:#666;font-size:14px;">If you didn't request this, you can safely ignore this email.</p>
			</div>
		`
	});
}
