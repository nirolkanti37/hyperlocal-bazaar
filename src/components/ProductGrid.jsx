import React, { useRef, useEffect } from 'react';
import ProductCard from './ProductCard';
import SkeletonCard from './SkeletonCard';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { PackageSearch } from 'lucide-react';

const ProductGrid = ({ 
  products, 
  loading, 
  hasMore, 
  onLoadMore, 
  onProductClick,
  onFavoriteToggle
}) => {
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!loadMoreRef.current || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore?.();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  if (!loading && products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch size={64} className="text-gray-300" />}
        title="কোনো পণ্য পাওয়া যায়নি"
        description="এই এলাকায় এখনো কোনো পণ্য যোগ করা হয়নি"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {products.map(product => (
          <ProductCard
            key={product.id}
            image={product.images?.[0]?.url}
            title={product.title}
            price={product.price}
            location={product.location?.address || 'আশেপাশে'}
            distance={product.distance}
            category={product.category}
            onClick={() => onProductClick?.(product.id)}
            onFavoriteToggle={() => onFavoriteToggle?.(product.id)}
          />
        ))}

        {/* Loading skeletons */}
        {loading && Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-4 flex justify-center">
          {loading ? (
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <div className="h-4" />
          )}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
