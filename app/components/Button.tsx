'use client';

type Props = React.PropsWithChildren<{
  onClick?: () => void;
  className?: string;
}>;

export function Button({ children, onClick, className }: Props) {
  return (
    <button
      onClick={onClick}
      className={`bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded ${className || ''}`}
    >
      {children}
    </button>
  );
}
