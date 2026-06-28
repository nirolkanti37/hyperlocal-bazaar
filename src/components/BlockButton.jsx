import React from 'react';
import { Shield, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';

const BlockButton = ({ blocked, onToggle, size = 'sm' }) => {
  const handleClick = async () => {
    const result = await onToggle();
    if (result.success) {
      toast.success(blocked ? 'আনব্লক হয়েছে' : 'ব্লক হয়েছে');
    }
  };

  return (
    <button onClick={handleClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        blocked 
          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
          : 'bg-red-100 text-red-700 hover:bg-red-200'
      }`}>
      {blocked ? <ShieldOff size={14} /> : <Shield size={14} />}
      {blocked ? 'আনব্লক' : 'ব্লক'}
    </button>
  );
};

export default BlockButton;
