import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { getImagePreview, revokeImagePreview } from '../services/storageService';

const ImageUploader = ({ 
  maxImages = 5, 
  onImagesChange,
  existingImages = []
}) => {
  const [previews, setPreviews] = useState(existingImages.map(img => 
    typeof img === 'string' ? img : img.url
  ));
  const [files, setFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleFileSelect = useCallback((selectedFiles) => {
    const validFiles = Array.from(selectedFiles).filter(file => {
      if (!file.type.startsWith('image/')) {
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        return false;
      }
      return true;
    });

    const remainingSlots = maxImages - previews.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length === 0) return;

    const newPreviews = filesToAdd.map(file => getImagePreview(file));

    setPreviews(prev => [...prev, ...newPreviews]);
    setFiles(prev => [...prev, ...filesToAdd]);
    onImagesChange?.([...files, ...filesToAdd]);
  }, [previews, files, maxImages, onImagesChange]);

  const handleRemove = (index) => {
    const removedPreview = previews[index];

    // If it's a blob URL, revoke it
    if (removedPreview.startsWith('blob:')) {
      revokeImagePreview(removedPreview);
    }

    setPreviews(prev => prev.filter((_, i) => i !== index));
    setFiles(prev => prev.filter((_, i) => i !== index));
    onImagesChange?.(files.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="w-full">
      {/* Upload Area */}
      {previews.length < maxImages && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer
            transition-all duration-200
            ${isDragging 
              ? 'border-primary-500 bg-primary-50' 
              : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
            }
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
              <Camera size={24} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              ছবি যোগ করুন
            </p>
            <p className="text-xs text-gray-500">
              ট্যাপ করুন বা ড্র্যাগ করুন (সর্বোচ্চ {maxImages}টি)
            </p>
          </div>
        </div>
      )}

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
              {index === 0 && (
                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-primary-500 text-white text-[10px] rounded">
                  প্রধান
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image count */}
      <p className="text-xs text-gray-500 mt-2 text-right">
        {previews.length}/{maxImages} ছবি
      </p>
    </div>
  );
};

export default ImageUploader;
