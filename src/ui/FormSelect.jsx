import React from "react";
import { CheckCircle, ChevronDown } from "lucide-react";

export default function FormSelect({
  label,
  name,
  required = false,
  value,
  onChange,
  focused,
  onFocus,
  onBlur,
  options = [],
  animationDelay,
  placeholder = "-- Sélectionnez une option --", // nouveau prop placeholder
}) {
  const isSelected = value && value !== "";

  return (
    <div className="space-y-2 animate-fade-in-up" style={{ animationDelay }}>
      <label
        htmlFor={name}
        className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          required={required}
          className={`w-full appearance-none pl-4 pr-20 py-3 rounded-xl border-2 bg-white/70 dark:bg-gray-700/70 backdrop-blur-sm text-gray-900 dark:text-white transition-all duration-300 focus:outline-none ${
            focused
              ? "border-indigo-500 ring-4 ring-indigo-500/20 shadow-md scale-[1.02]"
              : isSelected
              ? "border-green-400 dark:border-green-500"
              : "border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400"
          }`}
        >
          <option
            value=""
            disabled
            className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
          >
            {placeholder}
          </option>
          {options.map((opt) => (
            <option
              key={opt}
              value={opt}
              className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white"
            >
              {opt}
            </option>
          ))}
        </select>

        {isSelected && !focused && (
          <CheckCircle className="absolute right-9 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 pointer-events-none animate-fade-in" />
        )}

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-300 pointer-events-none" />
      </div>
    </div>
  );
}
