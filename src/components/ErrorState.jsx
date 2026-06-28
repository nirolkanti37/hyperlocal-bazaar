import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from './Button';

const ErrorState = ({ 
  message = 'কিছু সমস্যা হয়েছে',
  onRetry = null 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 p-4 bg-red-50 rounded-full">
        <AlertTriangle size={48} className="text-red-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">উফ্!</h3>
      <p className="text-sm text-gray-500 mb-4">{message}</p>
      {onRetry && (
        <Button 
          variant="outline" 
          leftIcon={<RefreshCw size={16} />}
          onClick={onRetry}
        >
          আবার চেষ্টা করুন
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
