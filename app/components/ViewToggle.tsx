type ViewToggleProps = {
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
};

export default function ViewToggle({ viewMode, onViewModeChange }: ViewToggleProps) {
  return (
    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border border-gray-200">
      <span className="text-sm font-medium text-gray-700">
        Vista: 
      </span>
      
      <div className="flex space-x-1 bg-white rounded-lg p-1 border border-gray-300">
        <button
          onClick={() => onViewModeChange('table')}
          className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-all ${
            viewMode === 'table'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span>📊</span>
          <span>Tabla</span>
        </button>
        
        <button
          onClick={() => onViewModeChange('cards')}
          className={`flex items-center space-x-2 px-3 py-2 rounded text-sm font-medium transition-all ${
            viewMode === 'cards'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <span>🃏</span>
          <span>Tarjetas</span>
        </button>
      </div>
    </div>
  );
}