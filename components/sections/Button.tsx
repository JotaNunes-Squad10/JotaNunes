"use client";

interface ButtonProps {
    children: string
    color?: 'green' | 'red' | 'default'
    onClick: () => void
}

export default function Button({ children, color = "default", onClick }: ButtonProps) {
    const colorClasses = {
    green: 'bg-[var(--green-button)] hover:bg-green-700',
    red: 'bg-[var(--red-button)] hover:bg-red-600',
    default: 'bg-blue-600 hover:bg-blue-700',
  };

  // Classes base do botão
  const baseClasses = 'px-6 py-1 rounded-lg font-bold text-white shadow-md cursor-pointer min-w-[12rem] transition-colors';

  // Combine as classes base com as classes de cor
  const finalClasses = `${baseClasses} ${colorClasses[color]}`;

  return(
    <button className={finalClasses} onClick={onClick}>
        {children}
    </button>
  )
}