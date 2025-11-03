import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import EditableCell from './EditableCell';

type ExpenseRowProps = {
  expense: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateExpenses: (expenses: any[]) => void;
  allExpenses: any[];
  editingCell: {id: string, field: string} | null;
  onEditCell: (cell: {id: string, field: string} | null) => void;
  isMobile?: boolean;
};

export default function ExpenseRow({
  expense,
  isSelected,
  onSelect,
  onUpdateExpenses,
  allExpenses,
  editingCell,
  onEditCell,
  isMobile = false
}: ExpenseRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateField = async (field: string, value: any) => {
    setIsUpdating(true);
    const { error } = await supabase
      .from('expenses')
      .update({ [field]: value })
      .eq('id', expense.id);

    if (!error) {
      const { data: updatedExpense } = await supabase
        .from('expenses')
        .select('*')
        .eq('id', expense.id)
        .single();
      
      if (updatedExpense) {
        onUpdateExpenses(allExpenses.map(e => 
          e.id === expense.id ? updatedExpense : e
        ));
      }
    }

    setIsUpdating(false);
    onEditCell(null);
  };

  const updateQuantity = async (delta: number) => {
    const newQuantity = Math.max(1, expense.quantity + delta);
    await updateField('quantity', newQuantity);
  };

  const updatePaidAmount = async (paid: number) => {
    const totalAmount = Number(expense.amount) || 0;
    const isPaid = paid >= totalAmount;

    onUpdateExpenses(allExpenses.map(e => 
      e.id === expense.id ? { 
        ...e, 
        paid_amount: paid,
        is_paid: isPaid
      } : e
    ));

    const { error } = await supabase
      .from('expenses')
      .update({ paid_amount: paid, is_paid: isPaid })
      .eq('id', expense.id);

    if (error) console.error('Error updating paid amount:', error);
  };

  const togglePaymentStatus = async () => {
    const totalAmount = Number(expense.amount) || 0;
    const newPaidAmount = expense.is_paid ? 0 : totalAmount;
    await updatePaidAmount(newPaidAmount);
  };

  const deleteExpense = async () => {
    const { error } = await supabase.from('expenses').delete().eq('id', expense.id);
    if (!error) {
      onUpdateExpenses(allExpenses.filter(e => e.id !== expense.id));
    }
  };

  const getPaymentProgress = () => {
    const total = Number(expense.amount) || 0;
    const paid = Number(expense.paid_amount) || 0;
    if (total === 0) return 0;
    return Math.min((paid / total) * 100, 100);
  };

  const progress = getPaymentProgress();

  // 🔹 En móvil: ahora también permite editar la categoría con EditableCell
  return (
    <tr className={expense.is_paid ? 'bg-green-50' : 'bg-red-50'}>
      {/* Checkbox */}
      <td className="border px-2 py-1 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
          className="mx-auto"
        />
      </td>

      {/* Categoría editable (en todos los dispositivos) */}
      <EditableCell
        value={expense.category}
        field="category"
        expenseId={expense.id}
        editingCell={editingCell}
        onEdit={onEditCell}
        onSave={updateField}
        type="text"
        className="text-left"
      />

      {/* Cantidad editable */}
      <EditableCell
        value={expense.quantity}
        field="quantity"
        expenseId={expense.id}
        editingCell={editingCell}
        onEdit={onEditCell}
        onSave={updateField}
        type="number"
      />

      {/* Precio unitario editable */}
      <EditableCell
        value={Number(expense.unit_price).toFixed(2)}
        field="unit_price"
        expenseId={expense.id}
        editingCell={editingCell}
        onEdit={onEditCell}
        onSave={updateField}
        type="number"
      />

      {/* Total */}
      <td className="border px-2 py-1 text-center">
        ${Number(expense.amount).toFixed(2)}
      </td>

      {/* Pagado + barra de progreso */}
      <td className="border px-2 py-1 text-center">
        <input
          type="text"
          inputMode="decimal"
          className="border border-gray-300 rounded p-1 w-20 text-center"
          value={expense.paid_amount ?? ''}
          onChange={(e) => {
            const value = e.target.value;
            if (/^\d*\.?\d*$/.test(value)) {
              onUpdateExpenses(allExpenses.map(e => 
                e.id === expense.id ? { 
                  ...e, 
                  paid_amount: value,
                  is_paid: Number(value) >= Number(expense.amount)
                } : e
              ));
            }
          }}
          onBlur={() => updatePaidAmount(Number(expense.paid_amount) || 0)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updatePaidAmount(Number(expense.paid_amount) || 0);
            }
          }}
        />
        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
          <div 
            className="bg-blue-600 h-1 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="text-xs text-gray-500">{progress.toFixed(0)}%</span>
      </td>

      {/* Estado */}
      <td className="border px-2 py-1 text-center">
        <button
          onClick={togglePaymentStatus}
          disabled={isUpdating}
          className={`px-3 py-1 rounded text-white font-medium ${
            expense.is_paid 
              ? 'bg-green-600 hover:bg-green-700' 
              : 'bg-red-600 hover:bg-red-700'
          } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {expense.is_paid ? '✅ Pagado' : '❌ Pendiente'}
        </button>
      </td>

      {/* Acciones */}
      <td className="border px-2 py-1 text-center space-x-1">
        <button
          onClick={() => updateQuantity(1)}
          disabled={isUpdating}
          className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:opacity-50"
        >
          +
        </button>
        <button
          onClick={() => updateQuantity(-1)}
          disabled={isUpdating}
          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          -
        </button>
        <button
          onClick={deleteExpense}
          disabled={isUpdating}
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 disabled:opacity-50"
        >
          🗑
        </button>
      </td>
    </tr>
  );
}
