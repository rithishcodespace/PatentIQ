interface AlertProps {
  message: string;
  onRetry: () => void;
}

const Alert = ({ message, onRetry }: AlertProps) => {
  return (
    <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-center">

      <h2 className="text-xl font-semibold text-red-600">
        Something went wrong
      </h2>

      <p className="text-gray-600 mt-2">
        {message}
      </p>

      <button
        onClick={onRetry}
        className="mt-5 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
      >
        Try Again
      </button>

    </div>
  );
};

export default Alert;