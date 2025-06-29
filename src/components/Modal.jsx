export default function Modal({ open, onClose, children }) {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 dark:text-gray-300 hover:text-red-500"
          >
            ✕
          </button>
          {children}
        </div>
      </div>
    );
  }
  