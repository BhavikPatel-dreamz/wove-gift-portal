import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, X, UploadCloud } from 'lucide-react';
import Button from './Button';

const ImageUpload = ({
  label,
  required = false,
  className = '',
  onFileChange,
  currentImage,
  acceptedFormats = 'PNG, JPG, GIF up to 2MB',
  helperText = 'Your image will be resized to 800x600px.',
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
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {imagePreview ? (
        <div className="relative group">
          <img src={imagePreview} alt="Preview" className="w-full rounded-lg border border-gray-300" />
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
          <div className="text-sm text-gray-600 mt-2 truncate">{fileName}</div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-gray-50 hover:bg-indigo-50"
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center text-gray-600">
            <UploadCloud className="w-12 h-12 text-gray-400 mb-4" />
            <p className="font-semibold text-indigo-600 mb-1">Click to upload or drag and drop</p>
            <p className="text-sm text-gray-500">{acceptedFormats}</p>
            {helperText && <p className="text-xs text-gray-400 mt-2">{helperText}</p>}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif, image/webp"
            {...props}
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
