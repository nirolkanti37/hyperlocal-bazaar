import { MESSAGES } from '../../constants/messages';

    export const validateProduct = (data) => {
    const errors = {};

    // Title validation
    if (!data.title || data.title.trim().length < 3) {
      errors.title = MESSAGES.product.titleRequired;
    } else if (data.title.length > 100) {
      errors.title = 'শিরোনাম ১০০ অক্ষরের বেশি হতে পারবে না';
    }

    // Price validation
    if (!data.price || isNaN(data.price) || parseFloat(data.price) <= 0) {
      errors.price = MESSAGES.product.priceRequired;
    }

    // Category validation
    if (!data.category) {
      errors.category = MESSAGES.product.categoryRequired;
    }

    // Description validation (optional but max length)
    if (data.description && data.description.length > 1000) {
      errors.description = 'বিবরণ ১০০০ অক্ষরের বেশি হতে পারবে না';
    }

    // Images — optional (max 5)
    if (data.images && data.images.length > 5) {
      errors.images = 'সর্বোচ্চ ৫টি ছবি যোগ করতে পারবেন';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
    };

    export const validatePrice = (price) => {
    const numPrice = parseFloat(price);
    return !isNaN(numPrice) && numPrice > 0 && numPrice <= 999999;
    };

    export const validatePhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 11 && digits.startsWith('01');
    };
    