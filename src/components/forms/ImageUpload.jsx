import { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const DEFAULT_ALLOWED_IMAGE_TYPES = new Set([
  'image/svg+xml',
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
]);

const getImageDimensions = (file) =>
  new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(imageUrl);
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error('Unable to read image dimensions.'));
    };

    image.src = imageUrl;
  });

const ImageUpload = ({
  label,
  required = false,
  className = '',
  onFileChange,
  currentImage,
  disabled = false,
  acceptedFormats = 'SVG, PNG, JPG, GIF, WebP - Max 2MB',
  helperText = 'Recommended size: 800 × 600 px',
  placeHolder = 'Upload Brand Logo',
  maxSizeMB = 2,
  recommendedWidth = 800,
  recommendedHeight = 600,
  allowedImageTypes = DEFAULT_ALLOWED_IMAGE_TYPES,
  ...props
}) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadWarning, setUploadWarning] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (currentImage) {
      setImagePreview(currentImage);
    } else {
      setImagePreview(null);
    }
  }, [currentImage]);

  const clearFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadError('');
      setUploadWarning('');

      if (!allowedImageTypes.has(file.type)) {
        setImagePreview(null);
        setFileName('');
        setUploadError('Please upload a valid image file: SVG, PNG, JPG, GIF, or WebP.');
        clearFileInput();
        onFileChange?.(null);
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setImagePreview(null);
        setFileName('');
        setUploadError(`Image size must be ${maxSizeMB}MB or less.`);
        clearFileInput();
        onFileChange?.(null);
        return;
      }

      try {
        const { width, height } = await getImageDimensions(file);
        const recommendedRatio = recommendedWidth / recommendedHeight;
        const actualRatio = width / height;
        const ratioDifference = Math.abs(actualRatio - recommendedRatio);

        if (
          width < recommendedWidth ||
          height < recommendedHeight ||
          ratioDifference > 0.08
        ) {
          setUploadWarning(
            `Uploaded image is ${width} × ${height}px. Recommended: ${recommendedWidth} × ${recommendedHeight}px (${recommendedWidth}:${recommendedHeight} ratio) to avoid cropping.`
          );
        }
      } catch {
        setUploadWarning('We could not verify image dimensions. Please use the recommended size to avoid cropping.');
      }

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
    setUploadError('');
    setUploadWarning('');
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
            {acceptedFormats && <p className="text-[10px] text-[#939393] mt-2">{acceptedFormats}</p>}
            {helperText && <p className="text-[10px] text-red-500 mt-2">{helperText}</p>}
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

      {uploadError && (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
          {uploadError}
        </p>
      )}

      {uploadWarning && !uploadError && (
        <p className="mt-2 rounded-md bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          {uploadWarning}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
