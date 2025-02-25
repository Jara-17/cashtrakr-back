import { createRequest, createResponse } from "node-mocks-http";
import Expense from "../../../models/Expense";
import { ExpensesController } from "../../../controllers/ExpensesController";
import { expenses } from "../../mocks/expenses";

jest.mock("../../../models/Expense", () => ({
  create: jest.fn(),
  findByPk: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
}));

describe("ExpensesController.create", () => {
  it("Should create a new expense", async () => {
    const mockExpense = {
      save: jest.fn(),
    };

    (Expense.create as jest.Mock).mockResolvedValue(mockExpense);

    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      body: { name: "Gasto de prueba", amount: 100 },
      budget: { id: 1 },
    });
    const res = createResponse();

    await ExpensesController.create(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(201);
    expect(data).toEqual("Gasto creado correctamente");
    expect(mockExpense.save).toHaveBeenCalled();
    expect(mockExpense.save).toHaveBeenCalledTimes(1);
    expect(Expense.create).toHaveBeenCalledWith(req.body);
  });

  it("Should handle expense cration error", async () => {
    const mockExpense = {
      save: jest.fn().mockResolvedValue(true),
    };

    (Expense.create as jest.Mock).mockRejectedValue(new Error());

    const req = createRequest({
      method: "POST",
      url: "/api/budgets/:budgetId/expenses",
      body: { name: "Gasto de prueba", amount: 100 },
      budget: { id: 1 },
    });
    const res = createResponse();

    await ExpensesController.create(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(500);
    expect(data).toEqual({ error: "Hubo un Error" });
    expect(mockExpense.save).not.toHaveBeenCalled();
    expect(Expense.create).toHaveBeenCalledWith(req.body);
  });
});

describe("ExpensesController.getById", () => {
  it("Should return the expense with ID 1", async () => {
    const req = createRequest({
      method: "GET",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: expenses[0],
    });
    const res = createResponse();

    await ExpensesController.getById(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toEqual(expenses[0]);
  });
});

describe("ExpensesController.updateById", () => {
  it("Should update expense and return a success message", async () => {
    const mockExpense = {
      ...expenses[0],
      update: jest.fn(),
    };

    const req = createRequest({
      method: "PUT",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: mockExpense,
      body: { name: "Gasto actualizado", amount: 500 },
    });
    const res = createResponse();

    await ExpensesController.updateById(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toEqual("Gasto actualizado correctamente");
    expect(mockExpense.update).toHaveBeenCalled();
    expect(mockExpense.update).toHaveBeenCalledWith(req.body);
    expect(mockExpense.update).toHaveBeenCalledTimes(1);
  });
});

describe("ExpensesController.deleteById", () => {
  it("Should delete expense and return a success message", async () => {
    const mockExpense = {
      ...expenses[0],
      destroy: jest.fn(),
    };

    const req = createRequest({
      method: "DELETE",
      url: "/api/budgets/:budgetId/expenses/:expenseId",
      expense: mockExpense,
    });
    const res = createResponse();

    await ExpensesController.deleteById(req, res);

    const data = res._getJSONData();
    expect(res.statusCode).toBe(200);
    expect(data).toEqual("Gasto eliminado correctamente");
    expect(mockExpense.destroy).toHaveBeenCalled();
    expect(mockExpense.destroy).toHaveBeenCalledTimes(1);
  });
});
