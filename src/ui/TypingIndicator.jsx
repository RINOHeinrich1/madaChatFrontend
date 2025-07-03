const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1 ml-2">
      <span className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-gray-400 dark:bg-gray-300 rounded-full animate-bounce" />
    </div>
  );
};

export default TypingIndicator;
