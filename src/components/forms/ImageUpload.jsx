import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const ImageUpload = ({
  label,
  required = false,
  className = '',
  onFileChange,
  currentImage,
  disabled = false,
  acceptedFormats = 'SVG,PNG, JPG, GIF up to 2MB',
  helperText = 'Your image will be resized to 800x600px.',
  placeHolder = 'Upload Brand Logo',
  ...props
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentImage) {
      setImagePreview(currentImage);
    } else {
      setImagePreview(null);
    }
  }, [currentImage]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      if (onFileChange) {
        onFileChange(file);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    if (disabled) {
      return;
    }

    setImagePreview(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
    if (onFileChange) {
      onFileChange(null);
    }
  };

  const triggerFileInput = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-[#4A4A4A] mb-2">
          {label} {required && <span className="text-[#4A4A4A]">*</span>}
        </label>
      )}

      {imagePreview ? (
        <div className="inline-flex items-start gap-2">
          <img src={imagePreview} alt="Preview" className="w-100 h-100 rounded-lg object-cover" />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Remove image"
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </button>
          {/* <div className="text-sm text-gray-600 mt-2 truncate">{fileName}</div> */}
        </div>
      ) : (
        <div
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors bg-gray-50 ${
            disabled
              ? 'cursor-not-allowed opacity-70'
              : 'cursor-pointer hover:border-[#1F59EE] hover:bg-indigo-50'
          }`}
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center text-gray-600">
            {/* <UploadCloud className="w-12 h-12 text-gray-400 mb-4" /> */}
            <img src="/material-symbols_image-outline-rounded.svg" alt="Upload Icon" className="w-15 h-15 text-gray-400 mb-2" />
            <p className="font-semibold text-[#4A4A4A] mb-1">{placeHolder}</p>
            <p className="text-[12px] text-[#939393]">Drop an image here or click to upload</p>
            {helperText && <p className="text-[10px] text-[#939393] mt-2">PNG,JPG,webP - Max 2MB - Automatically Optimized</p>}
            <p className="text-[10px] text-red-500 mt-2">Recommended size: 800 × 600 px</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/svg+xml, image/png, image/jpeg, image/gif, image/webp"
            disabled={disabled}
            {...props}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
