// Button.tsx
"use client";

// 1. Adicione a prop disabled à interface
interface ButtonProps {
  children: string;
  color?: "green" | "red" | "default";
  onClick: () => void;
  disabled?: boolean; // <-- Adicionado
}

// 2. Desestruture a prop disabled
export default function Button({
  children,
  color = "default",
  onClick,
  disabled = false, // <-- Desestruturado com valor padrão
}: ButtonProps) {
  const colorClasses = {
    green: "bg-[var(--green-button)] hover:bg-green-700",
    red: "bg-[var(--red-button)] hover:bg-red-600",
    default: "bg-blue-600 hover:bg-blue-700",
  }; // 3. Adicione um estilo condicional para o estado desabilitado

  const disabledClasses = disabled
    ? "opacity-50 cursor-not-allowed hover:opacity-50" // Estilo para desabilitado
    : colorClasses[color]; // Classes base do botão

  const baseClasses =
    "px-6 py-1 rounded-lg font-bold text-white shadow-md transition-colors min-w-[12rem] "; // Combine as classes base com as classes de cor/disabled

  const finalClasses = `${baseClasses} ${disabledClasses}`;

  return (
    // 4. Passe a prop disabled para o elemento HTML nativo
    <button className={finalClasses} onClick={onClick} disabled={disabled}>
            {children}   {" "}
    </button>
  );
}
