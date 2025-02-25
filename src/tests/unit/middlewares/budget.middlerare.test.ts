import { createRequest, createResponse } from "node-mocks-http";
import {
  hasAccess,
  validateBudgetExists,
} from "../../../middlewares/budget.middleware";
import Budget from "../../../models/Budget";
import { budgets } from "../../mocks/budgets";

jest.mock("../../../models/Budget", () => ({
  findByPk: jest.fn(),
}));

describe("budget.middleware - validateBudgetExists", () => {
  it("Should handle non-existend budget", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(null);
    const req = createRequest({
      params: {
        budgetId: 1,
      },
    });
    const res = createResponse();
    const next = jest.fn();

    await validateBudgetExists(req, res, next);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(404);
    expect(data).toEqual({ error: "Presupuesto no encontrado" });
    expect(next).not.toHaveBeenCalled();
  });

  it("Should proceed to next middleware if budget exist", async () => {
    (Budget.findByPk as jest.Mock).mockResolvedValue(budgets[0]);
    const req = createRequest({
      params: {
        budgetId: 1,
      },
    });
    const res = createResponse();
    const next = jest.fn();

    await validateBudgetExists(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.budget).toEqual(budgets[0]);
  });

  it("Should handle a error", async () => {
    (Budget.findByPk as jest.Mock).mockRejectedValue(new Error());
    const req = createRequest({
      params: {
        budgetId: 1,
      },
    });
    const res = createResponse();
    const next = jest.fn();

    await validateBudgetExists(req, res, next);

    const data = res._getJSONData();

    expect(res.statusCode).toBe(500);
    expect(data).toEqual({ error: "Hubo un error" });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("budget.middleware - hasAccess", () => {
  it("Should call next() if user has access to budget", async () => {
    const req = createRequest({
      budget: budgets[0],
      user: {
        id: 1,
      },
    });
    const res = createResponse();
    const next = jest.fn();

    await hasAccess(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("Should return 401 error if userId has access to budget ", async () => {
    const req = createRequest({
      budget: budgets[0],
      user: {
        id: 5,
      },
    });
    const res = createResponse();
    const next = jest.fn();

    await hasAccess(req, res, next);

    const data = res._getJSONData();
    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
    expect(data).toEqual({ error: "Acción no válida" });
  });
});
