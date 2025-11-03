import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

type MobileExpenseCardProps = {
  expense: any;
  isSelected: boolean;
  onSelect: () => void;
  onUpdateExpenses: (expenses: any[]) => void;
  allExpenses: any[];
  onShowMessage: (message: string) => void;
};

export default function MobileExpenseCard({
  expense,
  isSelected,
  onSelect,
  onUpdateExpenses,
  allExpenses,
  onShowMessage
}: MobileExpenseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const updateQuantity = async (delta: number) => {
    setIsUpdating(true);
    const newQuantity = Math.max(1, expense.quantity + delta);
    
    const { error } = await supabase
      .from('expenses')
      .update({ quantity: newQuantity })
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
  };

  const updatePaidAmount = async (paid: number) => {
    const totalAmount = Number(expense.amount) || 0;
    const isPaid = paid >= totalAmount;

    // Optimistic update
    onUpdateExpenses(allExpenses.map(e => 
      e.id === expense.id ? { 
        ...e, 
        paid_amount: paid,
        is_paid: isPaid
      } : e
    ));

    const { error } = await supabase
      .from('expenses')
      .update({ paid_amount: paid })
      .eq('id', expense.id);

    if (error) {
      console.error('Error updating paid amount:', error);
    }
  };

  const togglePaymentStatus = async () => {
    const totalAmount = Number(expense.amount) || 0;
    const newPaidAmount = expense.is_paid ? 0 : totalAmount;
    await updatePaidAmount(newPaidAmount);
  };

  const deleteExpense = async () => {
    if (confirm('¿Estás seguro de que quieres eliminar este gasto?')) {
      const { error } = await supabase.from('expenses').delete().eq('id', expense.id);
      if (!error) {
        onUpdateExpenses(allExpenses.filter(e => e.id !== expense.id));
        onShowMessage('✅ Gasto eliminado correctamente');
      }
    }
  };

  const getPaymentProgress = () => {
    const total = Number(expense.amount) || 0;
    const paid = Number(expense.paid_amount) || 0;
    if (total === 0) return 0;
    return Math.min((paid / total) * 100, 100);
  };

  const progress = getPaymentProgress();

  return (
    <div className={`border rounded-lg p-3 shadow-sm ${
      expense.is_paid ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      
      {/* Header de la card */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 flex-1">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            className="h-4 w-4 text-blue-600 rounded"
          />
          <span className="font-semibold text-gray-800 truncate">
            {expense.category}
          </span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? '▲' : '▼'}
        </button>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-2 gap-2 text-sm mb-2">
        <div>
          <span className="text-gray-600">Cantidad:</span>
          <div className="flex items-center space-x-1 mt-1">
            <button
              onClick={() => updateQuantity(-1)}
              disabled={isUpdating}
              className="w-6 h-6 bg-yellow-500 text-white rounded text-xs disabled:opacity-50"
            >
              -
            </button>
            <span className="font-medium">{expense.quantity}</span>
            <button
              onClick={() => updateQuantity(1)}
              disabled={isUpdating}
              className="w-6 h-6 bg-green-500 text-white rounded text-xs disabled:opacity-50"
            >
              +
            </button>
          </div>
        </div>
        
        <div>
          <span className="text-gray-600">P. Unitario:</span>
          <p className="font-medium">${Number(expense.unit_price).toFixed(2)}</p>
        </div>
      </div>

      {/* Estado de pago */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-gray-600 text-sm">Pagado:</span>
          <span className={`text-xs font-medium ${
            expense.is_paid ? 'text-green-600' : 'text-red-600'
          }`}>
            {expense.is_paid ? '✅ Pagado' : '❌ Pendiente'}
          </span>
        </div>
        <input
          type="text"
          inputMode="decimal"
          className="w-full border border-gray-300 rounded p-2 text-center text-sm"
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
          placeholder="0.00"
        />
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div 
            className="bg-blue-600 h-2 rounded-full" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Progreso</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
      </div>

      {/* Información expandida */}
      {isExpanded && (
        <div className="border-t pt-2 mt-2 space-y-2">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Total:</span>
              <p className="font-bold text-lg">${Number(expense.amount).toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-600">Tipo:</span>
              <p className="font-medium capitalize">{expense.type}</p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex space-x-2 pt-2">
            <button
              onClick={togglePaymentStatus}
              disabled={isUpdating}
              className={`flex-1 py-2 px-3 rounded text-white text-sm font-medium ${
                expense.is_paid 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } disabled:opacity-50`}
            >
              {expense.is_paid ? 'Marcar Pendiente' : 'Marcar Pagado'}
            </button>
            <button
              onClick={deleteExpense}
              disabled={isUpdating}
              className="py-2 px-3 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 text-sm"
            >
              🗑
            </button>
          </div>
        </div>
      )}
    </div>
  );
}