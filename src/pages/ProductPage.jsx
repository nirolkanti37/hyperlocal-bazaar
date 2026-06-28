import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Share2, Heart, MessageCircle, 
  Phone, CheckCircle, Calendar, Eye, Flag
} from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';
import { useProduct } from '../modules/product/productHook';
import { incrementViewCount } from '../modules/product/productService';
import { createChat } from '../modules/chat/chatService';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { bn } from 'date-fns/locale';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { product, loading, error, fetchProduct } = useProduct();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(id);
      incrementViewCount(id);
    }
  }, [id]);

  const handleShare = async () => {
    const shareData = {
      title: product?.title,
      text: `${product?.title} - ৳${product?.price}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('লিংক কপি হয়েছে!');
      }
    } catch (error) {
      console.log('Share cancelled');
    }
  };

  const handleChat = async () => {
    if (!user) {
      toast.error('লগইন করুন');
      navigate('/login');
      return;
    }

    if (user.uid === product.sellerId) {
      toast.error('নিজের পণ্যে চ্যাট করা যাবে না');
      return;
    }

    setChatLoading(true);
    try {
      const chatId = await createChat(user.uid, product.sellerId, product.id);
      navigate(`/chat/${chatId}`);
    } catch (error) {
      toast.error('চ্যাট শুরু করতে সমস্যা');
    } finally {
      setChatLoading(false);
    }
  };

  const handleCall = () => {
    if (product.sellerPhone) {
      window.location.href = `tel:${product.sellerPhone}`;
    } else {
      toast.error('ফোন নম্বর পাওয়া যায়নি');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <ErrorState 
          message="পণ্য পাওয়া যায়নি" 
          onRetry={() => fetchProduct(id)} 
        />
      </div>
    );
  }

  const isOwner = user?.uid === product.sellerId;
  const images = product.images?.length > 0 ? product.images : [{ url: '/assets/placeholder-product.jpg' }];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Image Gallery */}
      <div className="relative bg-gray-900">
        <div className="aspect-square max-h-[50vh]">
          <img
            src={images[currentImage]?.url}
            alt={product.title}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsFavorite(!isFavorite)}
              className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50"
            >
              <Heart size={20} className={isFavorite ? 'fill-red-500 text-red-500' : ''} />
            </button>
            <button 
              onClick={handleShare}
              className="p-2 bg-black/30 backdrop-blur-sm rounded-full text-white hover:bg-black/50"
            >
              <Share2 size={20} />
            </button>
          </div>
        </div>

        {/* Image Counter */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm">
          {currentImage + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto bg-white border-b">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                index === currentImage ? 'border-primary-500' : 'border-transparent'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Product Info */}
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Title & Price */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{product.title}</h1>
              <p className="text-sm text-gray-500 mt-1">
                {product.category && (
                  <span className="inline-block bg-gray-100 px-2 py-0.5 rounded text-xs mr-2">
                    {product.category}
                  </span>
                )}
                {product.condition && (
                  <span className="text-xs">{product.condition}</span>
                )}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary-600">{formatPrice(product.price)}</p>
            </div>
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {product.createdAt?.toDate ? 
                formatDistanceToNow(product.createdAt.toDate(), { locale: bn, addSuffix: true }) :
                'এখনই'
              }
            </span>
            <span className="flex items-center gap-1">
              <Eye size={14} />
              {product.viewCount || 0} বার দেখা
            </span>
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-semibold mb-2">বিবরণ</h3>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>
        )}

        {/* Location */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-2">লোকেশন</h3>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin size={18} className="text-primary-500 flex-shrink-0" />
            <span>{product.location?.address || 'আশেপাশে'}</span>
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <h3 className="font-semibold mb-3">বিক্রেতার তথ্য</h3>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
              {product.sellerName?.charAt(0) || 'B'}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{product.sellerName || 'বিক্রেতা'}</p>
              <p className="text-sm text-gray-500">{product.sellerPhone}</p>
            </div>
            {isOwner && (
              <span className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">
                আপনার পণ্য
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 safe-area-bottom z-40">
        <div className="max-w-lg mx-auto flex gap-3">
          {isOwner ? (
            <>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => navigate(`/sell?edit=${id}`)}
              >
                এডিট করুন
              </Button>
              <Button 
                variant="primary" 
                className="flex-1"
                onClick={() => {/* mark as sold */}}
              >
                বিক্রি হয়েছে
              </Button>
            </>
          ) : (
            <>
              <Button 
                variant="outline" 
                leftIcon={<Phone size={18} />}
                className="flex-1"
                onClick={handleCall}
              >
                কল করুন
              </Button>
              <Button 
                variant="primary" 
                leftIcon={<MessageCircle size={18} />}
                className="flex-1"
                onClick={handleChat}
                loading={chatLoading}
              >
                চ্যাট করুন
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
