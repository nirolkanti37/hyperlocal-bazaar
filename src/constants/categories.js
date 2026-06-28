export const CATEGORIES = [
  { id: 'C01', name: 'সবজি', slug: 'vegetables', icon: 'Leaf', color: '#22C55E', emoji: '🥬', type: 'product' },
  { id: 'C02', name: 'ফল', slug: 'fruits', icon: 'Apple', color: '#EF4444', emoji: '🍎', type: 'product' },
  { id: 'C03', name: 'পোশাক', slug: 'fashion', icon: 'Shirt', color: '#8B5CF6', emoji: '👗', type: 'product' },
  { id: 'C04', name: 'খাবার', slug: 'food', icon: 'UtensilsCrossed', color: '#F59E0B', emoji: '🍜', type: 'product' },
  { id: 'C05', name: 'হোমমেড', slug: 'homemade', icon: 'Home', color: '#EC4899', emoji: '🏠', type: 'product' },
  { id: 'C06', name: 'ইলেকট্রনিক্স', slug: 'electronics', icon: 'Smartphone', color: '#3B82F6', emoji: '📱', type: 'product' },
  { id: 'C07', name: 'ফার্নিচার', slug: 'furniture', icon: 'Sofa', color: '#92400E', emoji: '🪑', type: 'product' },
  { id: 'C08', name: 'বই', slug: 'books', icon: 'BookOpen', color: '#06B6D4', emoji: '📚', type: 'product' },
  { id: 'C09', name: 'খেলনা', slug: 'toys', icon: 'Gamepad2', color: '#F97316', emoji: '🧸', type: 'product' },
  { id: 'C10', name: 'অন্যান্য', slug: 'others', icon: 'Package', color: '#6B7280', emoji: '📦', type: 'product' },
];

export const getCategoryBySlug = (slug) => CATEGORIES.find(c => c.slug === slug);
export const getCategoryById = (id) => CATEGORIES.find(c => c.id === id);
