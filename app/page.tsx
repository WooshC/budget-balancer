'use client';
import { useState } from 'react';
import BudgetForm from './components/BudgetForm';
import BudgetSummary from './components/BudgetSummary';

export default function Page() {
  const [refresh, setRefresh] = useState(0);
  const [monthlyBudget, setMonthlyBudget] = useState<number>(0);
  const [selectedUser, setSelectedUser] = useState('');

  const triggerRefresh = () => setRefresh(prev => prev + 1);

  return (
    <main className="min-h-screen bg-gray-50 p-4 lg:p-8">
      <h1 className="text-4xl font-bold text-center text-indigo-700 mb-8">Balanceador de presupuesto</h1>

      <div className="flex flex-col lg:flex-row gap-4">
        {/* Panel izquierdo: Presupuesto + Formulario */}
        <div className="flex-none" style={{ marginLeft: '5px', width: '350px' }}>
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-800 mb-3">Presupuesto mensual</h2>
              <input
                type="number"
                step="0.01"
                className="border border-gray-300 p-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-indigo-400"
                placeholder="Ingresa tu presupuesto mensual"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(parseFloat(e.target.value))}
              />
            </div>

            <BudgetForm 
              onAddExpense={triggerRefresh} 
              selectedUser={selectedUser} 
              setSelectedUser={setSelectedUser} 
            />
          </div>
        </div>

        {/* Panel derecho: Resumen */}
        <div className="flex-1">
          <BudgetSummary 
            refresh={refresh} 
            monthlyBudget={monthlyBudget} 
            selectedUser={selectedUser} 
          />
        </div>
      </div>
    </main>
  );
}
