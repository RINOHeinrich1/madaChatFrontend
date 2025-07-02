import { CheckCircle } from "lucide-react";
export default function FormInput({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
  focused,
  onFocus,
  onBlur,
  placeholder,
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`w-full px-4 py-3 rounded-xl border-2 transition-all duration-300 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none ${
            focused
              ? "border-indigo-500 ring-4 ring-indigo-500/20 shadow-lg scale-[1.02]"
              : value
              ? "border-green-400 dark:border-green-500"
              : "border-gray-300 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-400"
          }`}
        />
        {value && !focused && (
          <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-fade-in" />
        )}
      </div>
    </div>
  );
}

