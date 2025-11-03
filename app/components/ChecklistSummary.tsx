type ChecklistSummaryProps = {
  selectedExpenses: Set<string>;
  expenses: any[];
  onToggleSelectAll: () => void;
  isMobile?: boolean;
  viewMode?: 'table' | 'cards';
};

export default function ChecklistSummary({ 
  selectedExpenses, 
  expenses, 
  onToggleSelectAll,
  isMobile = false,
  viewMode = 'table'
}: ChecklistSummaryProps) {
  const calculateSelectedTotal = () => {
    let total = 0;
    selectedExpenses.forEach(id => {
      const expense = expenses.find(e => e.id === id);
      if (expense) {
        total += Number(expense.amount) || 0;
      }
    });
    return total;
  };

  const selectedTotal = calculateSelectedTotal();

  if (selectedExpenses.size === 0) return null;

  if (isMobile) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-base font-semibold text-blue-800">
              📋 Gastos Seleccionados
            </h3>
            <p className="text-blue-600 text-sm">
              {selectedExpenses.size} seleccionados
            </p>
          </div>
          <button
            onClick={onToggleSelectAll}
            className="text-blue-600 hover:text-blue-800 text-sm bg-white px-2 py-1 rounded border border-blue-200"
          >
            {selectedExpenses.size === expenses.length ? 'Desel. todos' : 'Sel. todos'}
          </button>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-blue-800">
            Total: ${selectedTotal.toFixed(2)}
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-blue-800">
            📋 Checklist de Gastos Seleccionados
          </h3>
          <p className="text-blue-600">
            {selectedExpenses.size} gasto(s) seleccionado(s)
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-800">
            Total a gastar: ${selectedTotal.toFixed(2)}
          </p>
          <button
            onClick={onToggleSelectAll}
            className="text-sm text-blue-600 hover:text-blue-800 mt-1"
          >
            {selectedExpenses.size === expenses.length ? 'Deseleccionar todos' : 'Seleccionar todos'}
          </button>
        </div>
      </div>
    </div>
  );
}