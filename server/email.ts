import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

const fromEmail = process.env.FROM_EMAIL || "info@revsboost.com";

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE !== "false";

  if (!host || !user || !pass) {
    return null;
  }

  const portNum = port ? parseInt(port, 10) : secure ? 465 : 587;
  return nodemailer.createTransport({
    host,
    port: portNum,
    secure: portNum === 465,
    auth: { user, pass },
  });
}

export function isEmailConfigured(): boolean {
  return getTransporter() !== null;
}

function getLogoAttachment(): { filename: string; content: Buffer; cid: string } | null {
  const candidates = [
    path.join(process.cwd(), "client", "public", "revsboost-logo.png"),
    path.join(process.cwd(), "public", "revsboost-logo.png"),
  ];
  for (const filePath of candidates) {
    try {
      if (fs.existsSync(filePath)) {
        return {
          filename: "revsboost-logo.png",
          content: fs.readFileSync(filePath),
          cid: "revsboost-logo",
        };
      }
    } catch {
      /* try next */
    }
  }
  return null;
}

export async function sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[email] SMTP not configured; password reset link (dev):", resetLink);
    return;
  }

  const logoAttach = getLogoAttachment();
  const logoHtml = logoAttach
    ? `<p style="margin: 0 0 1em 0;"><img src="cid:revsboost-logo" alt="RevsBoost" width="80" height="80" style="display: block; border-radius: 50%; object-fit: contain;" /></p>`
    : "";

  const footerHtml = `
    <div style="margin-top: 2em; padding-top: 1.5em; border-top: 1px solid #e5e7eb; font-family: sans-serif; font-size: 12px; color: #4b5563;">
      <p style="margin: 0 0 0.75em 0;"><a href="mailto:${fromEmail}" style="color: #2563eb; text-decoration: underline;">${fromEmail}</a></p>
      ${logoHtml}
      <p style="margin: 0 0 0.75em 0; line-height: 1.5;">The information contained in this electronic message may be confidential and is intended for the sole use of the intended recipient. Any use, distribution, transmission or forwarding of information contained in this email by persons who are not the intended recipients may be in violation of law and is strictly prohibited.</p>
      <p style="margin: 0; line-height: 1.5;">If you are not the intended recipient, please contact <a href="mailto:${fromEmail}" style="color: #2563eb; text-decoration: underline;">${fromEmail}</a> and delete all copies.</p>
    </div>
  `;

  const attachments = logoAttach ? [logoAttach] : [];

  try {
    await transport.sendMail({
      from: `RevsBoost <${fromEmail}>`,
      to,
      replyTo: fromEmail,
      subject: "Reset your RevsBoost password",
      text: `You requested a password reset. Click the link below to set a new password (valid for 1 hour):\n\n${resetLink}\n\nIf you didn't request this, you can ignore this email.`,
      html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <p>You requested a password reset for your RevsBoost account.</p>
        <p><a href="${resetLink}" style="color: #2563eb; text-decoration: underline;">Reset your password</a> (valid for 1 hour).</p>
        <p>If you didn't request this, you can ignore this email.</p>
        ${footerHtml}
      </div>
    `,
      attachments,
    });
  } catch (err: any) {
    const raw = err.response || err.message || String(err);
    console.error("[email] Send failed:", raw);
    throw new Error(
      err.message && /auth|login|credentials|invalid|disabled|535/i.test(err.message)
        ? "Email login failed. Use an app password if the account has 2FA, or check SMTP_USER and SMTP_PASS."
        : "Email could not be sent. Check SMTP settings."
    );
  }
}

export type ConcernPayload = {
  content?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  createdAt: Date | string;
};

export async function sendNewConcernNotification(
  to: string,
  businessName: string,
  concern: ConcernPayload
): Promise<void> {
  const transport = getTransporter();
  if (!transport) {
    console.warn("[email] SMTP not configured; new concern notification skipped for", to);
    return;
  }

  const dateStr = typeof concern.createdAt === "string" ? concern.createdAt : concern.createdAt.toISOString();
  const lines: string[] = [];
  if (concern.content) lines.push(`Message: ${concern.content}`);
  if (concern.customerName) lines.push(`From: ${concern.customerName}`);
  if (concern.customerEmail) lines.push(`Email: ${concern.customerEmail}`);
  if (concern.customerPhone) lines.push(`Phone: ${concern.customerPhone}`);
  lines.push(`Submitted: ${dateStr}`);
  const textBody = lines.join("\n");
  const htmlLines = lines.map((l) => `<p style="margin: 0 0 0.5em 0;">${escapeHtml(l)}</p>`).join("");

  try {
    await transport.sendMail({
      from: `RevsBoost <${fromEmail}>`,
      to,
      replyTo: fromEmail,
      subject: `New concern: ${businessName}`,
      text: `A customer left a concern for ${businessName}.\n\n${textBody}`,
      html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <p><strong>A customer left a concern for ${escapeHtml(businessName)}.</strong></p>
        ${htmlLines}
      </div>
      `,
    });
  } catch (err: any) {
    console.error("[email] New concern notification failed:", err?.message || err);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
