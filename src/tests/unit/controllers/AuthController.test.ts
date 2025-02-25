import { createRequest, createResponse } from "node-mocks-http";
import { AuthController } from "../../../controllers/AuthController";
import User from "../../../models/User";
import { checkPassword, hashPassword } from "../../../utils/auth.util";
import { generateToken } from "../../../utils/token.util";
import { AuthEmail } from "../../../emails/AuthEmail";
import { generateJWT } from "../../../utils/jwt.util";

jest.mock("../../../models/User");
jest.mock("../../../utils/auth.util");
jest.mock("../../../utils/token.util");
jest.mock("../../../utils/jwt.util");

describe("AuthController.createAccount", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("Should return a 409 status and an error message if the email is already registerd", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(true);
    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@example.com",
        password: "password123",
      },
    });
    const res = createResponse();

    await AuthController.createAccount(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(409);
    expect(data).toHaveProperty("error", "El Email ya está registrado");
    expect(User.findOne).toHaveBeenCalled();
    expect(User.findOne).toHaveBeenCalledTimes(1);
  });

  it("Should register a new user and return a success message", async () => {
    const req = createRequest({
      method: "POST",
      url: "/api/auth/create-account",
      body: {
        email: "test@example.com",
        password: "password123",
        name: "Test Name",
        lastname: "Test Lastname",
      },
    });
    const res = createResponse();

    const mockUser = {
      ...req.body,
      save: jest.fn(),
    };

    (User.create as jest.Mock).mockResolvedValue(mockUser);
    (hashPassword as jest.Mock).mockResolvedValue("hashedPassword");
    (generateToken as jest.Mock).mockReturnValue("123456");
    jest
      .spyOn(AuthEmail, "sendConfirmationEmail")
      .mockImplementation(() => Promise.resolve());

    await AuthController.createAccount(req, res);

    const data = res._getJSONData();
    expect(User.create).toHaveBeenCalled();
    expect(User.create).toHaveBeenCalledTimes(1);
    expect(mockUser.password).toBe("hashedPassword");
    expect(mockUser.token).toBe("123456");
    expect(mockUser.save).toHaveBeenCalled();
    expect(mockUser.save).toHaveBeenCalledTimes(1);
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalled();
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledTimes(1);
    expect(AuthEmail.sendConfirmationEmail).toHaveBeenCalledWith({
      email: req.body.email,
      name: req.body.name,
      lastname: req.body.lastname,
      token: "123456",
    });
    expect(res.statusCode).toBe(201);
    expect(data).toEqual(
      "Cuenta creada correctamente, revisa tú email para confirmar la cuenta"
    );
  });
});

describe("AuthController.login", () => {
  it("should return 404 if user is not found", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(404);
    expect(data).toEqual({ error: "El Usuario no esta registrado" });
  });

  it("should return 403 if the account has not been confirmed", async () => {
    (User.findOne as jest.Mock).mockResolvedValue({
      id: 1,
      email: "test@test.com",
      password: "password",
      confirmed: false,
    });

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });
    const res = createResponse();

    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(403);
    expect(data).toEqual({ error: "La cuenta no ha sido confirmada" });
  });

  it("should return 401 if the password is incorrect", async () => {
    const userMock = {
      id: 1,
      email: "test@test.com",
      password: "password",
      confirmed: true,
    };
    (User.findOne as jest.Mock).mockResolvedValue(userMock);

    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "testpassword",
      },
    });
    const res = createResponse();

    (checkPassword as jest.Mock).mockResolvedValue(false);

    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(401);
    expect(data).toEqual({ error: "Password Incorrecto" });
    expect(checkPassword).toHaveBeenCalledWith(
      req.body.password,
      userMock.password
    );
    expect(checkPassword).toHaveBeenCalledTimes(1);
  });

  it("should return a JWT if authentication is successful", async () => {
    const userMock = {
      id: 1,
      email: "test@test.com",
      password: "hashed_password",
      confirmed: true,
    };
    const req = createRequest({
      method: "POST",
      url: "/api/auth/login",
      body: {
        email: "test@test.com",
        password: "password",
      },
    });
    const res = createResponse();

    const fakejwt = "fake_jwt";

    (User.findOne as jest.Mock).mockResolvedValue(userMock);
    (checkPassword as jest.Mock).mockResolvedValue(true);
    (generateJWT as jest.Mock).mockReturnValue(fakejwt);

    await AuthController.login(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toEqual(fakejwt);
    expect(generateJWT).toHaveBeenCalledTimes(1);
    expect(generateJWT).toHaveBeenCalledWith(userMock.id);
  });
});
