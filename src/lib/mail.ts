import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: "910217001@smtp-brevo.com",
    pass: "zABVHXqOgMCLYJ7N",
  },
});

export async function sendMail(
  dest: string,
  subject: string,
  htmlContent: string,
  sender?: string
) {
  try {
    await transporter.sendMail({
      from:
        (sender ? `"${sender} via Conflow"` : '"Conflow"') +
        " <aymanderrouich3@gmail.com>",
      to: dest,
      subject: subject,
      html: htmlContent,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return error;
  }
}

export async function sendVerificationMail(
  dest: string,
  token: string,
  from: string
) {
  const verificationURL = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email/${token}?from=${from}`;
  try {
    await transporter.sendMail({
      from: '"Conflow" <aymanderrouich3@gmail.com>',
      to: dest,
      subject: "Verify your email address",
      html: `
          <p>Click the link below to verify your email address:</p>
          <a href="${verificationURL}" target="_blank" rel="noopener noreferrer">
            Verify Email
          </a>
          <p>If you did not request this, you can ignore this email.</p>
        `,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return error;
  }
}