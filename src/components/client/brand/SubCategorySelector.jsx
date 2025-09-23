"use client"
import { useState, useEffect, useCallback, useRef } from 'react';
import { getOccasionCategories } from '@/lib/action/occasionAction';
import { ArrowLeft, X, Image, Smile, Palette, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { goBack, goNext, setLoading, setSelectedSubCategory, setSubCategories, setError } from '../../../redux/giftFlowSlice';
import ProgressIndicator from './ProgressIndicator';
import EmojiPicker from '../../occasions/EmojiPicker';
import { createCustomCard } from '@/lib/action/customCardAction';

// Custom Card Creator Component
const CustomCardCreator = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('Happy Birthday!');
  const [description, setDescription] = useState('Wishing you all the best on your special day.');
  const [bgColor, setBgColor] = useState('#FF6B35');
  const [bgImage, setBgImage] = useState(null);
  const [emoji, setEmoji] = useState('🎉');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const imageInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBgImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
  if (!title.trim()) return alert("Title is required");
  if (!description.trim()) return alert("Description is required");
  if (!bgColor && !bgImage) return alert("Choose a color or upload an image");

  try {
    const result = await createCustomCard({
      title: title.trim(),
      description: description.trim(),
      bgColor: bgImage ? undefined : bgColor,
      bgImage,
      emoji,
    });

    if (!result.success) throw new Error(result.message || "Validation error");

    onSave({
      id: result.data.id,
      name: result.data.title,
      description: result.data.description,
      image: result.data.bgImage,
      bgColor: result.data.bgColor,
      emoji: result.data.emoji,
      isCustom: true,
    });
  } catch (error) {
    console.error(error);
    alert(error.message || "Validation error");
  }
};

  // Brand colors for the color picker
  const colors = ['#FF6B35', '#FF8A5C', '#E55A2B', '#2D5A3D', '#3B6B4F', '#F5F3E7', '#8B4513', '#A0522D'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[720px] flex overflow-hidden relative">
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-wave-brown hover:text-wave-green transition-colors z-20"
        >
          <X size={24} />
        </button>

        {/* Customization Panel */}
        <div className="w-full md:w-2/3 p-6 flex flex-col space-y-6 border-r border-wave-cream">
          <h2 className="text-2xl font-bold text-wave-green">Customize Card</h2>

          {/* Title & Message */}
          <div className="space-y-4">
            <div>
              <label className="font-semibold text-wave-brown mb-1 block text-sm">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-input w-full"
                maxLength={30}
              />
            </div>

            <div>
              <label className="font-semibold text-wave-brown mb-1 block text-sm">Message</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input w-full"
                rows={3}
                maxLength={100}
              ></textarea>
            </div>
          </div>

          {/* Emoji Picker */}
          <div className="bg-wave-cream p-4 rounded-2xl border border-wave-cream-dark">
            <label className="font-semibold text-wave-brown mb-2 block text-sm">Emoji</label>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>

          {/* Background Picker */}
          <div>
            <label className="font-semibold text-wave-brown mb-2 block text-sm">Background</label>
            <div className="flex gap-2">
              <button
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="flex-1 p-2 border border-wave-cream rounded-xl flex items-center justify-center space-x-2 bg-white hover:bg-wave-cream transition-colors"
              >
                <Palette size={20} className="text-wave-brown" />
                <span className="text-sm font-medium text-wave-green">Color</span>
              </button>
              <button
                onClick={() => imageInputRef.current?.click()}
                className="flex-1 p-2 border border-wave-cream rounded-xl flex items-center justify-center space-x-2 bg-white hover:bg-wave-cream transition-colors"
              >
                <Image size={20} className="text-wave-brown" />
                <span className="text-sm font-medium text-wave-green">Image</span>
              </button>
              <input
                type="file"
                ref={imageInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {showColorPicker && (
              <div className="mt-3 grid grid-cols-8 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setBgColor(color);
                      setBgImage(null);
                    }}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${bgColor === color && !bgImage ? 'ring-2 ring-offset-2 ring-wave-orange' : ''}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-auto">
            <button
              onClick={handleSave}
              className="btn-primary w-full font-bold py-3 rounded-xl shadow-brand hover:shadow-brand-lg transition-all duration-300 transform hover:-translate-y-0.5"
            >
              Save & Continue
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="hidden md:flex w-1/3 p-8 bg-wave-cream items-center justify-center">
          <div
            className="w-[280px] h-[440px] rounded-3xl shadow-brand-lg flex flex-col justify-between p-6 text-white relative overflow-hidden transition-all duration-300"
            style={{ backgroundColor: bgImage ? 'transparent' : bgColor }}
          >
            {bgImage && <img src={bgImage} className="absolute inset-0 w-full h-full object-cover" alt="background" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-3xl"></div>

            <div className="relative z-10 text-center pt-10">
              <span className="text-6xl drop-shadow-lg">{emoji}</span>
            </div>
            <div className="relative z-10 text-center pb-4">
              <h3 className="text-2xl font-bold mb-2 drop-shadow-md">{title}</h3>
              <p className="text-md opacity-90 drop-shadow-sm">{description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function SubCategorySelector() {
  const dispatch = useDispatch();
  const {
    selectedOccasion,
    subCategories,
    loading,
    error,
    subCategoriesPagination,
    currentSubCategoryPage
  } = useSelector((state) => state.giftFlowReducer);

  const [isCustomizing, setIsCustomizing] = useState(false);

  // Brand color schemes for occasion cards
  const occasionColors = [
    { bgColor: 'bg-wave-cream', buttonColor: 'btn-primary', accent: 'border-wave-orange' },
    { bgColor: 'bg-wave-cream-dark', buttonColor: 'btn-primary', accent: 'border-wave-orange' },
    { bgColor: 'bg-wave-cream', buttonColor: 'btn-secondary', accent: 'border-wave-green' },
    { bgColor: 'bg-wave-cream-dark', buttonColor: 'btn-secondary', accent: 'border-wave-green' },
    { bgColor: 'bg-wave-cream', buttonColor: 'btn-primary', accent: 'border-wave-orange' },
    { bgColor: 'bg-wave-cream-dark', buttonColor: 'btn-primary', accent: 'border-wave-orange' },
    { bgColor: 'bg-wave-cream', buttonColor: 'btn-secondary', accent: 'border-wave-green' },
    { bgColor: 'bg-wave-cream-dark', buttonColor: 'btn-secondary', accent: 'border-wave-green' },
  ];

  const cardHeight = 'h-96';

  const fetchSubCategories = useCallback(async (page) => {
    if (!selectedOccasion) return;
    try {
      dispatch(setLoading(true));
      const response = await getOccasionCategories({ occasionId: selectedOccasion, limit: 8, page });
      if (response.success) {
        dispatch(setSubCategories({
          data: response.data,
          page: page,
          pagination: response.meta.pagination
        }));
      } else {
        dispatch(setError(response.message || "Failed to fetch sub-categories."));
      }
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, selectedOccasion]);

  useEffect(() => {
    if (selectedOccasion) {
      fetchSubCategories(1);
    }
  }, [selectedOccasion, fetchSubCategories]);

  const handleSubCategorySelect = (subCategory) => {
    dispatch(setSelectedSubCategory(subCategory));
    dispatch(goNext());
  };

  const handleCustomCardSave = (customCardData) => {
    dispatch(setSelectedSubCategory(customCardData));
    setIsCustomizing(false);
    dispatch(goNext());
  };

  const handleLoadMore = () => {
    if (subCategoriesPagination?.hasNextPage) {
      fetchSubCategories(currentSubCategoryPage + 1);
    }
  };

  if (loading && currentSubCategoryPage === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wave-cream">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-wave-orange mx-auto loading-spinner"></div>
          <h2 className="text-2xl font-semibold text-wave-green mt-4">Loading Designs...</h2>
          <p className="text-wave-brown">Getting things ready for you!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wave-cream">
        <div className="text-center p-8 bg-white rounded-lg shadow-brand">
          <h2 className="text-2xl font-bold text-red-600">Oops! Something went wrong.</h2>
          <p className="text-wave-brown mt-2">{error}</p>
          <button
            onClick={() => fetchSubCategories(1)}
            className="mt-4 btn-primary px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wave-cream p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <ProgressIndicator />

        <button
          onClick={() => dispatch(goBack())}
          className="flex items-center text-wave-green hover:text-wave-orange mb-6 transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>

        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold heading-primary mb-4">
            Choose a Design
          </h1>
          <p className="text-wave-brown text-base md:text-lg max-w-2xl mx-auto">
            Select a pre-made design or create your own.
          </p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6 mb-8">
          {/* Custom Design Card */}
          <div
            className={`bg-gradient-to-br from-wave-cream to-white rounded-2xl mb-4 md:mb-6 break-inside-avoid ${cardHeight}
            transition-all duration-300 hover:scale-[1.02] hover:shadow-brand-lg cursor-pointer 
            shadow-brand relative overflow-hidden group flex flex-col border-2 border-dashed border-wave-orange hover:ring-2 hover:ring-wave-orange`}
            onClick={() => setIsCustomizing(true)}
          >
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-wave-cream">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-wave-orange flex items-center justify-center mb-4 shadow-brand">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <h3 className="font-bold text-base md:text-lg text-wave-green mb-1">Create Your Own</h3>
              <p className="text-xs md:text-sm text-wave-brown">Design a unique card from scratch.</p>
            </div>
            <div className="p-4 md:p-5 bg-white rounded-b-2xl flex flex-col justify-center items-center">
              <button
                className="btn-primary py-2 px-4 md:px-6 rounded-full text-white font-semibold text-xs md:text-sm shadow-brand group-hover:scale-105 transition-transform"
              >
                Customize
              </button>
            </div>
          </div>

          {/* Existing SubCategory Cards */}
          {subCategories.map((subCategory, index) => {
            const colorScheme = occasionColors[index % occasionColors.length];

            return (
              <div
                key={`${subCategory.id}-${index}`}
                className={`bg-white rounded-2xl mb-4 md:mb-6 break-inside-avoid ${cardHeight}
                transition-all duration-300 hover:scale-[1.02] hover:shadow-brand-lg cursor-pointer 
                shadow-brand relative overflow-hidden group flex flex-col border border-wave-cream-dark`}
                onClick={() => handleSubCategorySelect(subCategory)}
              >
                <div className="absolute top-3 left-3 z-20">
                  <span className="badge badge-outline text-xs font-semibold">
                    {subCategory.category || 'Artistic'}
                  </span>
                </div>

                <div className="relative flex-1 overflow-hidden rounded-t-2xl h-48">
                  {subCategory.image ? (
                    <img
                      src={subCategory.image}
                      alt={subCategory.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}

                  <div
                    className={`w-full h-full bg-wave-cream flex items-center justify-center`}
                    style={{ display: subCategory.image ? 'none' : 'flex' }}
                  >
                    <span className="text-5xl opacity-80">{subCategory.emoji || '🎁'}</span>
                  </div>

                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <button
                      className={`btn-primary py-2 px-4 rounded-full text-white font-semibold text-sm transition-all duration-300 transform scale-90 group-hover:scale-100 shadow-brand`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubCategorySelect(subCategory);
                      }}
                    >
                      Select
                    </button>
                  </div>
                </div>

                <div className="p-4 md:p-5 bg-white rounded-b-2xl flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-base md:text-lg text-wave-green mb-2 leading-tight line-clamp-1">
                      {subCategory.name}
                    </h3>

                    <p className="text-xs md:text-sm text-wave-brown leading-relaxed line-clamp-2">
                      {subCategory.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-1 mt-2">
                    <span className="text-wave-orange text-lg">{subCategory.emoji}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="text-center mb-8">
          {loading && currentSubCategoryPage > 1 && (
            <div className="inline-flex items-center text-wave-brown bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-wave-cream">
              <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-wave-orange mr-2 loading-spinner"></div>
              Loading more...
            </div>
          )}
          {!loading && subCategoriesPagination?.hasNextPage && (
            <button
              onClick={handleLoadMore}
              className="bg-white/80 backdrop-blur-sm text-wave-green px-6 py-3 md:px-8 md:py-4 rounded-xl font-semibold border border-wave-cream hover:bg-white hover:shadow-brand transition-all duration-200 transform hover:scale-105"
            >
              Show More Categories
            </button>
          )}
        </div>
      </div>

      {isCustomizing && (
        <CustomCardCreator
          onSave={handleCustomCardSave}
          onCancel={() => setIsCustomizing(false)}
        />
      )}
    </div>
  );
}