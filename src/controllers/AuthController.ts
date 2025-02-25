import type { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../utils/auth.util";
import { generateToken } from "../utils/token.util";
import { AuthEmail } from "../emails/AuthEmail";
import { generateJWT } from "../utils/jwt.util";

export class AuthController {
  static createAccount = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //? Prevenir duplicados
    const userExist = await User.findOne({ where: { email } });
    if (userExist) {
      res.status(409).json({ error: "El Email ya está registrado" });
      return;
    }

    try {
      //? Crear un nuevo usuario con los datos del request
      const user = await User.create(req.body);

      //? Hashear la contraseña antes de guardar
      user.password = await hashPassword(password);
      //? Generar un token para el usuario y confirmar la cuenta
      const token = generateToken();

      user.token = token;

      if (process.env.NODE_ENV !== "production") {
        globalThis.cashTrackrConfirmationToken = token;
      }

      //? Guardar el usuario en la base de datos y enviar el token al usuario
      await user.save();

      //? Enviar el email de confirmación
      await AuthEmail.sendConfirmationEmail({
        name: user.name,
        lastname: user.lastname,
        email: user.email,
        token: user.token,
      });

      res
        .status(201)
        .json(
          "Cuenta creada correctamente, revisa tú email para confirmar la cuenta"
        );
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Hubo un error" });
    }
  };

  static confirmAccount = async (req: Request, res: Response) => {
    //? Validar el token del usuario y confirmar la cuenta
    const { token } = req.body;

    //? Buscar el usuario en la base de datos con el token del request
    const user = await User.findOne({ where: { token } });

    //? Si el usuario no existe o no está confirmado, responder con un error
    if (!user) {
      const error = new Error("Token no válido");
      res.status(401).json({ error: error.message });
      return;
    }

    //? Confirmar la cuenta y eliminar el token
    user.confirmed = true;
    user.token = "";

    //? Guardar el usuario en la base de datos y responder con éxito
    await user.save();

    res.json("Cuenta confirmada correctamente");
  };

  static login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    //? Verificar que el usuario exista
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("El Usuario no esta registrado");

      res.status(404).json({ error: error.message });
      return;
    }

    //? Verificar que la cuenta este confirmada
    if (!user.confirmed) {
      const error = new Error("La cuenta no ha sido confirmada");

      res.status(403).json({ error: error.message });
      return;
    }

    //? Verificar que la contraseña sea correcta
    const isPasswordValid = await checkPassword(password, user.password);
    if (!isPasswordValid) {
      const error = new Error("Password Incorrecto");

      res.status(401).json({ error: error.message });
      return;
    }

    //? Generar un token para el usuario
    const token = generateJWT(user.id);

    //? responder con el token al usuario
    res.json(token);
  };

  static forgotPassword = async (req: Request, res: Response) => {
    const { email } = req.body;

    //? Verificar que el usuario exista
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const error = new Error("El Usuario no esta registrado");

      res.status(404).json({ error: error.message });
      return;
    }

    //? Generar un token de recuperación para el usuario
    user.token = generateToken();
    await user.save();

    AuthEmail.sendPasswordResetToken({
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      token: user.token,
    });

    res.json("Se ha enviado un mail a tú correo para recuperar tú password");
  };

  static validateToken = async (req: Request, res: Response) => {
    const { token } = req.body;

    const tokenExists = await User.findOne({ where: { token } });
    if (!tokenExists) {
      const error = new Error("Token no válido");
      res.status(404).json({ error: error.message });
      return;
    }

    res.json("Token válido, asigna un nuevo password");
  };

  static resetPasswordWithToken = async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    //? Verificar que el token exista y corresponda al usuario
    const user = await User.findOne({ where: { token } });
    if (!user) {
      const error = new Error("Token no válido");
      res.status(404).json({ error: error.message });
      return;
    }

    //? Asignar el nuevo password
    user.password = await hashPassword(password);
    user.token = "";

    //? Guardar el usuario en la base de datos
    await user.save();

    res.json("El password se actualizo correctamente");
  };

  static user = async (req: Request, res: Response) => {
    res.json(req.user);
  };

  static updateCurrentUserPassword = async (req: Request, res: Response) => {
    const { current_password, password } = req.body;
    const { id } = req.user;

    const user = await User.findByPk(id);

    const isPasswordValid = await checkPassword(
      current_password,
      user.password
    );

    if (!isPasswordValid) {
      const error = new Error("El Password actual es incorrecto");
      res.status(401).json({ error: error.message });
      return;
    }

    user.password = await hashPassword(password);
    await user.save();

    res.json("El password se actualizo correctamente");
  };

  static checkPassword = async (req: Request, res: Response) => {
    const { password } = req.body;
    const { id } = req.user;

    const user = await User.findByPk(id);

    const isPasswordValid = await checkPassword(password, user.password);

    if (!isPasswordValid) {
      const error = new Error("El Password actual es incorrecto");
      res.status(401).json({ error: error.message });
      return;
    }

    res.json("El password correcto");
  };
}
