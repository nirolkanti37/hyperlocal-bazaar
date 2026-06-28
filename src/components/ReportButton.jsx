import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import toast from 'react-hot-toast';

const REPORT_REASONS = [
  'ভুয়া/অসত্য তথ্য',
  'অশ্লীল বিষয়বস্তু',
  'স্প্যাম',
  'অন্যায় দাম',
  'চুরি হওয়া পণ্য',
  'অন্যান্য'
];

const ReportButton = ({ targetId, targetType, onReport }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) { toast.error('কারণ সিলেক্ট করুন'); return; }
    setLoading(true);
    const result = await onReport(targetId, reason, details);
    setLoading(false);
    if (result.success) {
      toast.success('রিপোর্ট পাঠানো হয়েছে');
      setIsOpen(false); setReason(''); setDetails('');
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
        <Flag size={18} />
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="রিপোর্ট করুন" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-gray-500">কেন রিপোর্ট করছেন?</p>
          {REPORT_REASONS.map(r => (
            <button key={r} onClick={() => setReason(r)}
              className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${
                reason === r ? 'bg-primary-50 border-2 border-primary-500 text-primary-700' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }`}>
              {r}
            </button>
          ))}
          <textarea value={details} onChange={(e) => setDetails(e.target.value)}
            placeholder="বিস্তারিত (ঐচ্ছিক)" rows={2}
            className="w-full border border-gray-300 rounded-lg p-3 text-sm" />
          <Button variant="primary" className="w-full" onClick={handleSubmit} loading={loading}>রিপোর্ট পাঠান</Button>
        </div>
      </Modal>
    </>
  );
};

export default ReportButton;
