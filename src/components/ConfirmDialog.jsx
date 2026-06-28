import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'নিশ্চিত করুন',
  message = 'আপনি কি নিশ্চিত?',
  confirmLabel = 'হ্যাঁ',
  cancelLabel = 'না',
  variant = 'danger'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" showCloseButton={false}>
      <div className="text-center py-2">
        <div className="mx-auto w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button 
            variant="ghost" 
            className="flex-1"
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button 
            variant={variant} 
            className="flex-1"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
