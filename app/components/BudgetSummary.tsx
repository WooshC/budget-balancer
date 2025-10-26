'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

type Props = {
  refresh?: number;
  monthlyBudget: number;
  selectedUser: string;
};

export default function BudgetSummary({ refresh, monthlyBudget, selectedUser }: Props) {
  const [expenses, setExpenses] = useState<any[]>([]);

  useEffect(() => {
    if (!selectedUser) return;

    async function fetchExpenses() {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('name', selectedUser)
        .single();

      if (userError || !userData) {
        setExpenses([]);
        return;
      }

      const user_id = userData.id;

      const { data: expensesData, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user_id)
        .order('date', { ascending: true });

      if (expenseError) {
        console.error(expenseError);
        setExpenses([]);
      } else {
        setExpenses(expensesData || []);
      }
    }

    fetchExpenses();
  }, [refresh, selectedUser]);

  const updateQuantity = async (id: string, delta: number) => {
    const expense = expenses.find(e => e.id === id);
    if (!expense) return;

    const newQuantity = Math.max(1, expense.quantity + delta);
    const { error } = await supabase
      .from('expenses')
      .update({ quantity: newQuantity })
      .eq('id', id);

    if (error) console.error(error);
    else setExpenses(expenses.map(e => e.id === id ? { ...e, quantity: newQuantity, amount: newQuantity * e.unit_price } : e));
  };

  const deleteExpense = async (id: string) => {
    const { error } = await supabase.from('expenses').delete().eq('id', id);
    if (error) console.error(error);
    else setExpenses(expenses.filter(e => e.id !== id));
  };

  const fixedExpenses = expenses.filter(e => e.type === 'fijo');
  const variableExpenses = expenses.filter(e => e.type === 'variable');

  const totalFijo = fixedExpenses.reduce((a, b) => a + parseFloat(b.amount), 0);
  const totalVariable = variableExpenses.reduce((a, b) => a + parseFloat(b.amount), 0);
  const totalGastos = totalFijo + totalVariable;
  const ahorro = Math.max(monthlyBudget - totalGastos, 0);

  const renderTable = (list: any[]) => (
    <table className="w-full border border-gray-300">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-2 py-1 text-left">Categoría</th>
          <th className="border px-2 py-1">Cantidad</th>
          <th className="border px-2 py-1">Precio Unitario</th>
          <th className="border px-2 py-1">Total</th>
          <th className="border px-2 py-1">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {list.map(e => (
          <tr key={e.id} className="text-center">
            <td className="border px-2 py-1 text-left">{e.category}</td>
            <td className="border px-2 py-1">{e.quantity}</td>
            <td className="border px-2 py-1">${parseFloat(e.unit_price).toFixed(2)}</td>
            <td className="border px-2 py-1">${parseFloat(e.amount).toFixed(2)}</td>
            <td className="border px-2 py-1 space-x-1">
              <button
                onClick={() => updateQuantity(e.id, 1)}
                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
              >
                +
              </button>
              <button
                onClick={() => updateQuantity(e.id, -1)}
                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
              >
                -
              </button>
              <button
                onClick={() => deleteExpense(e.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
              >
                Eliminar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-800">Resumen mensual</h2>
        {selectedUser && (
          <div className="text-right space-y-1">
            <div className="text-red-600 font-bold text-lg">Total gastos: ${totalGastos.toFixed(2)}</div>
            <div className="text-green-600 font-bold text-lg">Ahorro restante: ${ahorro.toFixed(2)}</div>
          </div>
        )}
      </div>

      {!selectedUser ? (
        <p className="text-gray-500">Selecciona un usuario para ver sus gastos</p>
      ) : (
        <>
          <div>
            <strong>Gastos fijos:</strong>
            {fixedExpenses.length ? renderTable(fixedExpenses) : <p className="text-gray-500">No hay gastos fijos</p>}
          </div>

          <div>
            <strong>Gastos variables:</strong>
            {variableExpenses.length ? renderTable(variableExpenses) : <p className="text-gray-500">No hay gastos variables</p>}
          </div>
        </>
      )}
    </div>
  );
}
