'use client';
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { z } from 'zod';

type Props = {
  onAddExpense?: () => void;
  selectedUser: string;
  setSelectedUser: (name: string) => void;
};

const expenseSchema = z.object({
  user: z.string().min(1, "Debes ingresar un usuario"),
  category: z.string().min(1, "Debes ingresar una categoría"),
  quantity: z.number().min(1, "Cantidad mínima 1"),
  unit_price: z.number().min(0, "Precio mínimo 0"),
  type: z.enum(['fijo', 'variable']),
});

export default function BudgetForm({ onAddExpense, selectedUser, setSelectedUser }: Props) {
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(0);
  const [type, setType] = useState<'fijo' | 'variable'>('fijo');
  const [expenseDate, setExpenseDate] = useState<string>(''); // ✅ estado agregado
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    const parsed = { user: selectedUser, category, quantity, unit_price: unitPrice, type };
    const validation = expenseSchema.safeParse(parsed);

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    if (!expenseDate) {
      setError('Debes seleccionar una fecha para el gasto');
      return;
    }

    // Buscar o crear usuario
    let { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('name', selectedUser)
      .single();

    let user_id = userData?.id;

    if (!user_id) {
      const { data, error: userError } = await supabase
        .from('users')
        .insert([{ name: selectedUser }])
        .select()
        .single();
      if (userError) { setError(userError.message); return; }
      user_id = data.id;
    }

    // Insertar gasto con fecha seleccionada
    const { error: expenseError } = await supabase.from('expenses').insert([{
      user_id,
      category,
      quantity,
      unit_price: unitPrice,
      type,
      date: expenseDate
    }]);

    if (expenseError) setError(expenseError.message);
    else {
      setMessage('Gasto agregado correctamente!');
      setCategory('');
      setQuantity(1);
      setUnitPrice(0);
      setType('fijo');
      setExpenseDate('');
      onAddExpense?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Agregar gasto</h2>

      <div>
        <label className="block mb-1 text-gray-700">Usuario</label>
        <input
          type="text"
          className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          placeholder="Ingresa nombre de usuario"
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-700">Fecha del gasto</label>
        <input
          type="month"
          className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={expenseDate ? expenseDate.slice(0, 7) : ''}
          onChange={(e) => setExpenseDate(e.target.value + '-01')}
        />
      </div>

      <div>
        <label className="block mb-1 text-gray-700">Categoría</label>
        <input
          type="text"
          className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <label className="block mb-1 text-gray-700">Cantidad</label>
          <input
            type="number"
            min={1}
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
        </div>
        <div className="flex-1">
          <label className="block mb-1 text-gray-700">Precio unitario</label>
          <input
            type="number"
            min={0}
            step="0.01"
            className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={unitPrice}
            onChange={(e) => setUnitPrice(parseFloat(e.target.value))}
          />
        </div>
      </div>

      <div>
        <label className="block mb-1 text-gray-700">Tipo</label>
        <select
          className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={type}
          onChange={(e) => setType(e.target.value as any)}
        >
          <option value="fijo">Fijo</option>
          <option value="variable">Variable</option>
        </select>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      {message && <p className="text-green-500">{message}</p>}

      <button
        type="submit"
        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded transition-colors"
      >
        Agregar
      </button>
    </form>
  );
}
