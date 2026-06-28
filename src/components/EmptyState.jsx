import React from 'react';
import { PackageSearch } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ 
  icon = <PackageSearch size={64} className="text-gray-300" />,
  title = 'কোনো তথ্য পাওয়া যায়নি',
  description = 'এখানে এখনো কিছু নেই',
  actionLabel = '',
  onAction = null
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-4 p-4 bg-gray-50 rounded-full">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 max-w-xs">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
