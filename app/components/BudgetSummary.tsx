'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import BudgetHeader from './BudgetHeader';
import ExpenseTable from './ExpenseTable';
import ChecklistSummary from './ChecklistSummary';
import ConfirmationModal from './modals/ConfirmationModal';
import MobileExpenseCard from './MobileExpenseCard';
import ViewToggle from './ViewToggle';

type Props = {
  refresh?: number;
  monthlyBudget: number;
  selectedUser: string;
};

type ViewMode = 'table' | 'cards';

export default function BudgetSummary({ refresh, monthlyBudget, selectedUser }: Props) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(new Set());
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table'); // Default siempre tabla

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Obtener gastos
  useEffect(() => {
    if (!selectedUser) return;

    async function fetchExpenses() {
      setLoading(true);
      setError('');

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('name', selectedUser)
        .single();

      if (userError || !userData) {
        setExpenses([]);
        setLoading(false);
        return;
      }

      const firstDay = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
      const lastDay = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

      const { data: expensesData, error: expenseError } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userData.id)
        .in('type', ['fijo', 'variable'])
        .gte('date', firstDay)
        .lte('date', lastDay)
        .order('date', { ascending: true });

      if (expenseError) {
        console.error(expenseError);
        setError('Error al obtener los gastos');
        setExpenses([]);
      } else {
        setExpenses(expensesData || []);
      }

      setLoading(false);
    }

    fetchExpenses();
  }, [refresh, selectedUser, selectedMonth, selectedYear]);

  const closeModal = () => setShowModal(false);
  
  const showMessage = (message: string) => {
    setModalMessage(message);
    setShowModal(true);
  };

  // Totales
  const fixedExpenses = expenses.filter(e => e.type === 'fijo');
  const variableExpenses = expenses.filter(e => e.type === 'variable');
  const totalFijo = fixedExpenses.reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalVariable = variableExpenses.reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalGastos = totalFijo + totalVariable;
  const totalPaid = expenses.reduce((a, b) => a + Number(b.paid_amount || 0), 0);
  const ahorro = Math.max(monthlyBudget - totalGastos, 0);

  // Determinar qué vista renderizar
  const currentViewMode = isMobile ? viewMode : 'table';

  // Renderizar contenido según el modo de vista
  const renderExpenses = (expensesList: any[], type: 'fijo' | 'variable') => {
    if (currentViewMode === 'cards') {
      return (
        <div className="space-y-3">
          {expensesList.map(expense => (
            <MobileExpenseCard
              key={expense.id}
              expense={expense}
              isSelected={selectedExpenses.has(expense.id)}
              onSelect={() => {
                const newSet = new Set(selectedExpenses);
                if (newSet.has(expense.id)) newSet.delete(expense.id);
                else newSet.add(expense.id);
                setSelectedExpenses(newSet);
              }}
              onUpdateExpenses={setExpenses}
              allExpenses={expenses}
              onShowMessage={showMessage}
            />
          ))}
        </div>
      );
    }

    return (
      <ExpenseTable
        expenses={expensesList}
        type={type}
        selectedExpenses={selectedExpenses}
        onExpenseSelect={setSelectedExpenses}
        onUpdateExpenses={setExpenses}
        allExpenses={expenses}
        selectedUser={selectedUser}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onShowMessage={showMessage}
        isMobile={isMobile}
      />
    );
  };

  return (
    <div className="p-4 md:p-6 bg-white rounded-lg shadow-md border border-gray-200 space-y-4">
      <BudgetHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={setSelectedMonth}
        onYearChange={setSelectedYear}
        selectedUser={selectedUser}
        totalGastos={totalGastos}
        totalPaid={totalPaid}
        ahorro={ahorro}
        isMobile={isMobile}
      />

      {/* Toggle de vista SOLO en móvil */}
      {isMobile && (
        <ViewToggle
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      )}

      <ChecklistSummary
        selectedExpenses={selectedExpenses}
        expenses={expenses}
        onToggleSelectAll={() => {
          const newSet = new Set(selectedExpenses);
          const allSelected = expenses.every(exp => newSet.has(exp.id));
          expenses.forEach(exp => {
            if (allSelected) newSet.delete(exp.id);
            else newSet.add(exp.id);
          });
          setSelectedExpenses(newSet);
        }}
        isMobile={isMobile}
        viewMode={currentViewMode}
      />

      {loading ? (
        <p className="text-gray-500 italic">Cargando gastos...</p>
      ) : !selectedUser ? (
        <p className="text-gray-500">Selecciona un usuario para ver sus gastos</p>
      ) : (
        <>
          <div>
            <div className="flex justify-between items-center mb-3">
              {currentViewMode === 'cards' && (
                <span className="text-sm text-gray-500">
                  {fixedExpenses.filter(exp => selectedExpenses.has(exp.id)).length}/{fixedExpenses.length} selec.
                </span>
              )}
            </div>
            {fixedExpenses.length ? (
              renderExpenses(fixedExpenses, 'fijo')
            ) : (
              <p className="text-gray-500 text-center py-4">No hay gastos fijos</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              {currentViewMode === 'cards' && (
                <span className="text-sm text-gray-500">
                  {variableExpenses.filter(exp => selectedExpenses.has(exp.id)).length}/{variableExpenses.length} selec.
                </span>
              )}
            </div>
            {variableExpenses.length ? (
              renderExpenses(variableExpenses, 'variable')
            ) : (
              <p className="text-gray-500 text-center py-4">No hay gastos variables</p>
            )}
          </div>

          {error && <p className="text-red-500">{error}</p>}
        </>
      )}

      <ConfirmationModal
        isOpen={showModal}
        onClose={closeModal}
        message={modalMessage}
      />
    </div>
  );
}