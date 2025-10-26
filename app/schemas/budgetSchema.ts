import { z } from "zod";

export const expenseSchema = z.object({
  category: z.string().min(1, "Ingresa la categoría"),
  amount: z.number().min(0.01, "El monto debe ser mayor a 0"),
  type: z.enum(["fijo", "variable"]),
});

export type Expense = z.infer<typeof expenseSchema>;
