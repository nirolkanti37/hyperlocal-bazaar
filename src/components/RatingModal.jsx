import React, { useState } from 'react';
import Modal from './Modal';
import StarRating from './StarRating';
import Button from './Button';
import toast from 'react-hot-toast';

const RatingModal = ({ isOpen, onClose, sellerName, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('স্টার রেটিং দিন'); return; }
    setLoading(true);
    const result = await onSubmit(rating, review);
    setLoading(false);
    if (result.success) { toast.success('রেটিং দেওয়া হয়েছে!'); onClose(); setRating(0); setReview(''); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="রেটিং দিন" size="sm">
      <div className="text-center py-2">
        <p className="text-sm text-gray-500 mb-4">{sellerName} কে রেট করুন</p>
        <div className="flex justify-center mb-4">
          <StarRating rating={rating} onRate={setRating} size="lg" showValue={false} />
        </div>
        <textarea value={review} onChange={(e) => setReview(e.target.value)}
          placeholder="রিভিউ লিখুন (ঐচ্ছিক)" rows={3}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm mb-4 bg-white dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          maxLength={500} />
        <Button variant="primary" className="w-full" onClick={handleSubmit} loading={loading}>সাবমিট করুন</Button>
      </div>
    </Modal>
  );
};

export default RatingModal;
