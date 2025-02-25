import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middlewares/validation.middleware";
import { limiter } from "../config/limiter.config";
import { autenticate } from "../middlewares/auth.middleware";

const router = Router();

router.use(limiter);

router.post(
  "/create-account",
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("lastname").notEmpty().withMessage("El apellido no puede ir vacio"),
  body("email").isEmail().withMessage("El email no es válido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("El password es muy corto, mínimo 8 caracteres"),
  handleInputErrors,
  AuthController.createAccount
);

router.post(
  "/confirm-account",
  body("token").isLength({ min: 6, max: 6 }).withMessage("Token no válido"),
  handleInputErrors,
  AuthController.confirmAccount
);

router.post(
  "/login",
  body("email").isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("El password es obligatorio"),
  handleInputErrors,
  AuthController.login
);

router.post(
  "/forgot-password",
  body("email").isEmail().withMessage("El email no es válido"),
  handleInputErrors,
  AuthController.forgotPassword
);

router.post(
  "/validate-token",
  body("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token no válido"),
  handleInputErrors,
  AuthController.validateToken
);

router.post(
  "/reset-password/:token",
  param("token")
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage("Token no válido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("El password es muy corto, mínimo 8 caracteres"),
  handleInputErrors,
  AuthController.resetPasswordWithToken
);

router.use(autenticate); // Todas las rutas que estén debajo de esta línea requerirán autenticación

router.get("/user", AuthController.user);
router.put(
  "/user",
  body("name").notEmpty().withMessage("El nombre no puede ir vacio"),
  body("lastname").notEmpty().withMessage("El apellido no puede ir vacio"),
  body("email").isEmail().withMessage("El email no es válido"),
  handleInputErrors,
  AuthController.updateProfile
);

router.post(
  "/update-password",
  body("current_password")
    .notEmpty()
    .withMessage("El password actual no puede estar vacio"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("El password nuevo es muy corto, mínimo 8 caracteres"),
  handleInputErrors,
  AuthController.updateCurrentUserPassword
);

router.post(
  "/check-password",
  body("password")
    .notEmpty()
    .withMessage("El password actual no puede estar vacio"),
  handleInputErrors,
  AuthController.checkPassword
);
export default router;
