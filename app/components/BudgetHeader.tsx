type BudgetHeaderProps = {
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  selectedUser: string;
  totalGastos: number;
  totalPaid: number;
  ahorro: number;
  isMobile?: boolean;
};

export default function BudgetHeader({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  selectedUser,
  totalGastos,
  totalPaid,
  ahorro,
  isMobile = false
}: BudgetHeaderProps) {
  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Resumen Mensual</h2>
          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded p-1 text-sm"
              value={selectedMonth}
              onChange={(e) => onMonthChange(Number(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('es', { month: 'short' })}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded p-1 text-sm"
              value={selectedYear}
              onChange={(e) => onYearChange(Number(e.target.value))}
            >
              {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {selectedUser && (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-red-50 p-2 rounded border border-red-200">
                <div className="text-red-700 font-semibold">Total Gastos</div>
                <div className="text-red-800 font-bold">${totalGastos.toFixed(2)}</div>
              </div>
              <div className="bg-purple-50 p-2 rounded border border-purple-200">
                <div className="text-purple-700 font-semibold">Total Pagado</div>
                <div className="text-purple-800 font-bold">${totalPaid.toFixed(2)}</div>
              </div>
              <div className="bg-green-50 p-2 rounded border border-green-200 col-span-2">
                <div className="text-green-700 font-semibold">Ahorro Restante</div>
                <div className="text-green-800 font-bold text-lg">${ahorro.toFixed(2)}</div>
              </div>
            </div>

            {/* Hint para el toggle de vista */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
              <p className="text-yellow-700 text-sm text-center">
                💡 Usa el toggle arriba para cambiar entre Tabla y Tarjetas
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  // Versión desktop (igual que antes)
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <h2 className="text-2xl font-semibold text-gray-800">Resumen mensual</h2>

      <div className="flex gap-2">
        <select
          className="border border-gray-300 rounded p-2"
          value={selectedMonth}
          onChange={(e) => onMonthChange(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('es', { month: 'long' })}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded p-2"
          value={selectedYear}
          onChange={(e) => onYearChange(Number(e.target.value))}
        >
          {[2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
        </select>
      </div>

      {selectedUser && (
        <div className="text-right space-y-1">
          <div className="text-red-600 font-bold text-lg">
            Total gastos: ${totalGastos.toFixed(2)}
          </div>
          <div className="text-purple-600 font-bold text-lg">
            Total pagado: ${totalPaid.toFixed(2)}
          </div>
          <div className="text-green-600 font-bold text-lg">
            Ahorro restante: ${ahorro.toFixed(2)}
          </div>
        </div>
      )}
    </div>
  );
}