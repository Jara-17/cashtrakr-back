import express from "express";
import colors from "colors";
import morgan from "morgan";
import { db } from "./config/db.config";
import budgetRouter from "./routes/budget.routes";
import authRouter from "./routes/auth.routes";

export async function connectDB() {
  try {
    await db.authenticate();
    db.sync();
    console.log(colors.bold.blue("Conexión Exitosa a la DB"));
  } catch (error) {
    // console.log(error);
    console.log(colors.bold.red("Conexión Fallida a la DB"));
  }
}

connectDB();

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/budgets", budgetRouter);

export default app;
