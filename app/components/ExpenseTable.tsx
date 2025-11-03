import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import ExpenseRow from './ExpenseRow';
import { Button } from './Button';

type ExpenseTableProps = {
  expenses: any[];
  type: 'fijo' | 'variable';
  selectedExpenses: Set<string>;
  onExpenseSelect: (selected: Set<string>) => void;
  onUpdateExpenses: (expenses: any[]) => void;
  allExpenses: any[];
  selectedUser: string;
  selectedMonth: number;
  selectedYear: number;
  onShowMessage: (message: string) => void;
  isMobile?: boolean;
};

export default function ExpenseTable({
  expenses,
  type,
  selectedExpenses,
  onExpenseSelect,
  onUpdateExpenses,
  allExpenses,
  selectedUser,
  selectedMonth,
  selectedYear,
  onShowMessage,
  isMobile = false
}: ExpenseTableProps) {
  const [editingCell, setEditingCell] = useState<{id: string, field: string} | null>(null);

  const toggleSelectAll = () => {
    const newSet = new Set(selectedExpenses);
    const allSelected = expenses.every(exp => newSet.has(exp.id));
    
    expenses.forEach(exp => {
      if (allSelected) {
        newSet.delete(exp.id);
      } else {
        newSet.add(exp.id);
      }
    });
    
    onExpenseSelect(newSet);
  };

  const toggleExpenseSelection = (id: string) => {
    const newSet = new Set(selectedExpenses);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    onExpenseSelect(newSet);
  };

  const copyExpensesToNextMonth = async () => {
    try {
      if (!selectedUser) return;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('name', selectedUser)
        .single();

      if (userError || !userData) throw userError;

      const nextMonth = new Date(selectedYear, selectedMonth, 1);
      const nextMonthText = nextMonth.toISOString().substring(0, 7);
      const nextMonthFirstDay = `${nextMonthText}-01`;

      const inserts = expenses.map((r: any) => ({
        user_id: r.user_id,
        category: r.category,
        quantity: r.quantity,
        unit_price: r.unit_price,
        type: r.type,
        date: nextMonthFirstDay,
        month_year: nextMonthText,
        paid_amount: 0
      }));

      const { error: insertError } = await supabase.from('expenses').insert(inserts);
      if (insertError) throw insertError;

      onShowMessage(`✅ Se copiaron ${inserts.length} gastos ${type}s al mes ${nextMonthText}`);
    } catch (err: any) {
      console.error(err);
      onShowMessage(`❌ Error al copiar los gastos ${type}s.`);
    }
  };

  const allSelected = expenses.length > 0 && expenses.every(exp => selectedExpenses.has(exp.id));
  const selectedCount = expenses.filter(exp => selectedExpenses.has(exp.id)).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <strong>Gastos {type}s</strong>
        <span className="text-sm text-gray-500">
          {selectedCount}/{expenses.length} seleccionados
        </span>
      </div>

      {expenses.length ? (
        <div className="overflow-x-auto mt-2">
          <table className="min-w-full border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                {/* Nueva columna solo para selección */}
                <th className="border px-2 py-1 text-center w-12">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="mx-auto"
                  />
                </th>
                <th className="border px-2 py-1 text-left">Categoría</th>
                <th className="border px-2 py-1">Cantidad</th>
                <th className="border px-2 py-1">Precio Unitario</th>
                <th className="border px-2 py-1">Total</th>
                <th className="border px-2 py-1">Pagado</th>
                <th className="border px-2 py-1">Estado</th>
                <th className="border px-2 py-1">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map(expense => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  isSelected={selectedExpenses.has(expense.id)}
                  onSelect={() => toggleExpenseSelection(expense.id)}
                  onUpdateExpenses={onUpdateExpenses}
                  allExpenses={allExpenses}
                  editingCell={editingCell}
                  onEditCell={setEditingCell}
                  isMobile={isMobile}
                />
              ))}
            </tbody>
          </table>
          
          {isMobile && (
            <div className="mt-2 text-center">
              <p className="text-gray-500 text-sm">
                ← Desliza para ver más columnas →
              </p>
            </div>
          )}
          
          <Button 
            onClick={copyExpensesToNextMonth} 
            className={`mt-3 ${type === 'variable' ? 'bg-yellow-500 hover:bg-yellow-600' : ''}`}
          >
            Copiar gastos {type}s al siguiente mes
          </Button>
        </div>
      ) : (
        <p className="text-gray-500">No hay gastos {type}s</p>
      )}
    </div>
  );
}