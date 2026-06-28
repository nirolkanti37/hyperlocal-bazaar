import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Clock } from 'lucide-react';
import { useProductList } from '../modules/product/productHook';
import ProductGrid from '../components/ProductGrid';
import BottomNav from '../components/BottomNav';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [recentSearches, setRecentSearches] = useState(() => {
    const saved = localStorage.getItem('recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const { products, loading, hasMore, fetchProducts, refresh } = useProductList({
    search: query,
    limit: 20
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query) {
        refresh();
        saveRecentSearch(query);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  const saveRecentSearch = (term) => {
    const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="bg-white border-b sticky top-0 z-30 safe-area-top">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="পণ্য খুঁজুন..."
              className="flex-1 bg-transparent outline-none text-sm"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')}>
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-lg mx-auto px-4 py-4">
        {!query && recentSearches.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">সাম্প্রতিক খোঁজ</h3>
              <button onClick={clearRecent} className="text-xs text-primary-600">মুছুন</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentSearches.map(term => (
                <button
                  key={term}
                  onClick={() => setQuery(term)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 rounded-full text-sm hover:bg-gray-200"
                >
                  <Clock size={12} />{term}
                </button>
              ))}
            </div>
          </div>
        )}

        <ProductGrid
          products={products}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={fetchProducts}
        />
      </main>

      <BottomNav />
    </div>
  );
};

export default SearchPage;
