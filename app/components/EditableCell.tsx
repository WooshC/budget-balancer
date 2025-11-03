import { useState } from 'react';

type EditableCellProps = {
  value: any;
  field: string;
  expenseId: string;
  editingCell: {id: string, field: string} | null;
  onEdit: (cell: {id: string, field: string} | null) => void;
  onSave: (field: string, value: any) => void;
  type?: 'text' | 'number';
  className?: string;
};

export default function EditableCell({
  value,
  field,
  expenseId,
  editingCell,
  onEdit,
  onSave,
  type = 'text',
  className = ''
}: EditableCellProps) {
  const [editValue, setEditValue] = useState(value);
  const isEditing = editingCell?.id === expenseId && editingCell?.field === field;

  const handleSave = () => {
    let finalValue = editValue;
    
    if (type === 'number') {
      finalValue = parseFloat(editValue);
      if (isNaN(finalValue)) {
        finalValue = 0;
      }
    }
    
    onSave(field, finalValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditValue(value);
      onEdit(null);
    }
  };

  if (isEditing) {
    return (
      <td className={`border px-2 py-1 ${className}`}>
        <input
        type={type === 'number' ? 'number' : 'text'}
        value={editValue ?? ''} // <- evita NaN
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-full border border-blue-500 rounded p-1 ${
          type === 'number' ? 'text-center' : 'text-left'
        }`}
        autoFocus
        step={type === 'number' ? "0.01" : undefined}
        min={type === 'number' ? "0" : undefined}
      />
      </td>
    );
  }

  return (
    <td 
      className={`border px-2 py-1 cursor-pointer hover:bg-blue-50 ${className} ${
        field === 'category' ? 'text-left' : 'text-center'
      }`}
      onClick={() => {
        setEditValue(value);
        onEdit({ id: expenseId, field });
      }}
    >
      {type === 'number' && field === 'unit_price' ? `$${Number(value).toFixed(2)}` : value}
    </td>
  );
}