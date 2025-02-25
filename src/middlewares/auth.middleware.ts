import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const autenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    const error = new Error("No Autorizado");
    res.status(401).json({ error: error.message });
    return;
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    const error = new Error("Token no válido");
    res.status(401).json({ error: error.message });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    //? Validar que el token sea válido y tenga un id de usuario
    if (typeof decoded === "object" && decoded.id) {
      //? Buscar el usuario en la base de datos con el id del token
      req.user = await User.findByPk(decoded.id, {
        attributes: ["id", "name", "lastname", "email"],
      });

      next();
    }
  } catch (error) {
    res.status(500).json({ error: "Token no válido" });
  }
};
