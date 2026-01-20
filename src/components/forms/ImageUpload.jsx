import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, X, UploadCloud } from 'lucide-react';
import Button from './Button';

const ImageUpload = ({
  label,
  required = false,
  className = '',
  onFileChange,
  currentImage,
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFileName(file.name);
        if (onFileChange) {
          onFileChange(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
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
    if (fileInputRef.current) {
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
        <div className="relative group">
          <img src={imagePreview} alt="Preview" className="w-100 h-100 object-coverrounded-lg" />
          <div className="absolute top-2 right-2">
            <Button
              variant="danger"
              size="icon"
              onClick={handleRemoveImage}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          {/* <div className="text-sm text-gray-600 mt-2 truncate">{fileName}</div> */}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#1F59EE] transition-colors cursor-pointer bg-gray-50 hover:bg-indigo-50"
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center text-gray-600">
            {/* <UploadCloud className="w-12 h-12 text-gray-400 mb-4" /> */}
            <img src="/material-symbols_image-outline-rounded.svg" alt="Upload Icon" className="w-15 h-15 text-gray-400 mb-2" />
            <p className="font-semibold text-[#4A4A4A] mb-1">{placeHolder}</p>
            <p className="text-[12px] text-[#939393]">Drop an image here or click to upload</p>
            {helperText && <p className="text-[10px] text-[#939393] mt-2">PNG,JPG,webP - Max 2MB - Automatically Optimized</p>}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/svg+xml, image/png, image/jpeg, image/gif, image/webp"
            {...props}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
