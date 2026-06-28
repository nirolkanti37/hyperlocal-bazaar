import { useState, useCallback, useEffect } from 'react';
import { 
  createProduct, getProduct, getProducts, 
  getProductsBySeller, updateProduct, deleteProduct,
  markAsSold, toggleProductVisibility 
} from './productService';

export const useProduct = () => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProduct = useCallback(async (productId) => {
    setLoading(true);
    setError(null);
    const result = await getProduct(productId);
    if (result.success) {
      setProduct(result.data);
    } else {
      setError(result.error);
    }
    setLoading(false);
    return result;
  }, []);

  const addProduct = useCallback(async (data, userId) => {
    setLoading(true);
    setError(null);
    const result = await createProduct(data, userId);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    }
    return result;
  }, []);

  const editProduct = useCallback(async (productId, data) => {
    setLoading(true);
    const result = await updateProduct(productId, data);
    setLoading(false);
    return result;
  }, []);

  const removeProduct = useCallback(async (productId) => {
    setLoading(true);
    const result = await deleteProduct(productId);
    setLoading(false);
    return result;
  }, []);

  return {
    product,
    loading,
    error,
    fetchProduct,
    addProduct,
    editProduct,
    removeProduct,
  };
};

export const useProductList = (filters = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);

  const fetchProducts = useCallback(async (reset = false) => {
    setLoading(true);
    setError(null);

    const result = await getProducts(filters, reset ? null : lastDoc);

    if (result.success) {
      if (reset) {
        setProducts(result.data);
      } else {
        setProducts(prev => [...prev, ...result.data]);
      }
      setLastDoc(result.lastDoc);
      setHasMore(result.hasMore);
    } else {
      setError(result.error);
    }

    setLoading(false);
    return result;
  }, [filters, lastDoc]);

  const refresh = useCallback(() => {
    setLastDoc(null);
    setHasMore(true);
    fetchProducts(true);
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    hasMore,
    fetchProducts,
    refresh,
  };
};

export const useMyProducts = (userId) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyProducts = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const result = await getProductsBySeller(userId);
    if (result.success) {
      setProducts(result.data);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchMyProducts();
  }, [fetchMyProducts]);

  const handleMarkAsSold = async (productId) => {
    const result = await markAsSold(productId);
    if (result.success) {
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: 'sold' } : p
      ));
    }
    return result;
  };

  const handleToggleVisibility = async (productId, currentStatus) => {
    const result = await toggleProductVisibility(productId, currentStatus);
    if (result.success) {
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, status: currentStatus === 'active' ? 'hidden' : 'active' } : p
      ));
    }
    return result;
  };

  const handleDelete = async (productId) => {
    const result = await deleteProduct(productId);
    if (result.success) {
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
    return result;
  };

  return {
    products,
    loading,
    fetchMyProducts,
    handleMarkAsSold,
    handleToggleVisibility,
    handleDelete,
  };
};
