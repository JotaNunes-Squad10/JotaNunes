"use client";

import { useState } from "react";

interface DropDownSubSelectionProps {
  options: string[];
  defaultLabel?: string;
  onSelect?: (selected: string) => void;
  className?: string;
  colorText?: string;
}

export default function DropBoxSubSelect({
  options = ["Opção 1", "Opção 2", "Opção 3"],
  defaultLabel = "Selecione o item",
  onSelect,
  className = "mb-2 w-60",
}: DropDownSubSelectionProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(defaultLabel);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);

    if (onSelect) {
      onSelect(option);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer flex justify-between items-center w-full px-3 py-2 text-left text-black text-sm hover:bg-gray-100 rounded-lg focus:outline-none ${
          selected === defaultLabel ? "text-gray-700" : "text-black"
        }`}
      >
        {selected}
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.584l3.71-4.354a.75.75 0 111.14.976l-4.25 5a.75.75 0 01-1.14 0l-4.25-5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <ul className="mt-1 pl-4 space-y-1">
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleSelect(option)}
              className={`cursor-pointer px-3 py-1 rounded-md text-sm ${
                selected === option
                  ? "bg-red-600 text-white font-medium"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
