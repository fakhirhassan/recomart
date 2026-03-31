const sizeClasses = {
  sm: 'h-6 w-6 border-2',
  md: 'h-10 w-10 border-3',
  lg: 'h-16 w-16 border-4',
};

const Loader = ({ size = 'md' }) => {
  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`${sizeClasses[size] || sizeClasses.md} rounded-full border-gray-200 border-t-blue-600 animate-spin`}
      />
    </div>
  );
};

export default Loader;
