import { transport } from "../config/nodemailer.config";

type EmailType = {
  name: string;
  lastname: string;
  email: string;
  token: string;
};

export class AuthEmail {
  static sendConfirmationEmail = async ({
    email,
    name,
    lastname,
    token,
  }: EmailType) => {
    await transport
      .sendMail({
        from: "CashTrackr <admin@cashtrackr.com>",
        to: email,
        subject: "CashTrackr - Confirma tú Cuenta ",
        html: `
        <h1>Hola ${name} ${lastname}!</h1>
        <p>Gracias por registrarte en CashTrackr.</p>
        <p>Para confirmar tu cuenta, por favor haz click en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a>
        <p>E ingresa el código: <b>${token}</b></p>
      `,
        sandbox: true,
      })
      .then(console.log, console.error);
  };

  static sendPasswordResetToken = async ({
    email,
    name,
    lastname,
    token,
  }: EmailType) => {
    await transport
      .sendMail({
        from: "CashTrackr <admin@cashtrackr.com>",
        to: email,
        subject: "CashTrackr - Restablece tú Password",
        html: `
        <h1>Hola ${name} ${lastname}!</h1>
        <p>Has solicitado reestablecer tú password.</p>
        <p>Por favor haz click en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
        <p>E ingresa el código: <b>${token}</b></p>
      `,
        sandbox: true,
      })
      .then(console.log, console.error);
  };
}
