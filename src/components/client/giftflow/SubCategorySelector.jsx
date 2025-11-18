"use client"
import { useState, useEffect, useCallback, useRef } from 'react';
import { getOccasionCategories } from '@/lib/action/occasionAction';
import { ArrowLeft, X, Image, Palette, Sparkles, Upload } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { goBack, goNext, setLoading, setSelectedSubCategory, setSubCategories, setError } from '../../../redux/giftFlowSlice';
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

  const colors = ['#FF6B35', '#FF8A5C', '#E55A2B', '#2D5A3D', '#3B6B4F', '#F5F3E7', '#8B4513', '#A0522D'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 text-black">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] max-h-[720px] flex overflow-hidden relative">
        <button onClick={onCancel} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors z-20">
          <X size={24} />
        </button>

        <div className="w-full md:w-2/3 p-6 flex flex-col space-y-6 border-r border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Customize Card</h2>

          <div className="space-y-4">
            <div>
              <label className="font-semibold text-gray-700 mb-1 block text-sm">Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" maxLength={30} />
            </div>

            <div>
              <label className="font-semibold text-gray-700 mb-1 block text-sm">Message</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500" rows={3} maxLength={100}></textarea>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <label className="font-semibold text-gray-700 mb-2 block text-sm">Emoji</label>
            <EmojiPicker value={emoji} onChange={setEmoji} />
          </div>

          <div>
            <label className="font-semibold text-gray-700 mb-2 block text-sm">Background</label>
            <div className="flex gap-2">
              <button onClick={() => setShowColorPicker(!showColorPicker)} className="flex-1 p-2 border border-gray-300 rounded-xl flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 transition-colors">
                <Palette size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Color</span>
              </button>
              <button onClick={() => imageInputRef.current?.click()} className="flex-1 p-2 border border-gray-300 rounded-xl flex items-center justify-center space-x-2 bg-white hover:bg-gray-50 transition-colors">
                <Image size={20} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Image</span>
              </button>
              <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            {showColorPicker && (
              <div className="mt-3 grid grid-cols-8 gap-2">
                {colors.map((color) => (
                  <button key={color} onClick={() => { setBgColor(color); setBgImage(null); }} className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${bgColor === color && !bgImage ? 'ring-2 ring-offset-2 ring-pink-500' : ''}`} style={{ backgroundColor: color }} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto">
            <button onClick={handleSave} className="w-full bg-gradient-to-r from-pink-500 to-orange-400 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              Save & Continue
            </button>
          </div>
        </div>

        <div className="hidden md:flex w-1/3 p-8 bg-gray-50 items-center justify-center">
          <div className="w-[280px] h-[440px] rounded-3xl shadow-2xl flex flex-col justify-between p-6 text-white relative overflow-hidden transition-all duration-300" style={{ backgroundColor: bgImage ? 'transparent' : bgColor }}>
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
  const [selectedOccasionName, setSelectedOccationName] = useState(null);


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
        setSelectedOccationName(response.meta.occasion.name);
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
      <div className="min-h-screen  py-30 flex items-center justify-center bg-[#FBF9F4]">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-dashed rounded-full animate-spin border-pink-500 mx-auto"></div>
          <h2 className="text-xl font-medium text-gray-900 mt-4">Loading Designs...</h2>
          <p className="text-gray-600 text-sm">Getting things ready for you!</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen  py-30 flex items-center justify-center bg-[#FBF9F4]">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-red-600">Oops! Something went wrong.</h2>
          <p className="text-gray-600 mt-2 text-sm">{error}</p>
          <button onClick={() => fetchSubCategories(1)} className="mt-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white px-6 py-2.5 rounded-lg font-medium transition-colors text-sm hover:from-pink-600 hover:to-orange-500">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF]  py-30">
      <div className="max-w-7xl mx-auto px-6">
        {/* Back Button */}
        {/* <button onClick={() => dispatch(goBack())} className="flex items-center gap-3 px-4 py-3.5 rounded-full border-2 border-rose-400 bg-white hover:bg-rose-50 transition-all duration-200 shadow-sm hover:shadow-md group">
          <ArrowLeft className="w-5 h-5 text-rose-500 group-hover:translate-x-[-2px] transition-transform duration-200" />
          <span className="text-base font-semibold text-gray-800">Previous</span>
        </button> */}
        <div className="p-0.5 rounded-full bg-linear-to-r from-pink-500 to-orange-400 inline-block">
          <button
            onClick={() => dispatch(goBack())}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-white hover:bg-rose-50 
                       transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <svg width="8" height="9" viewBox="0 0 8 9" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-300 group-hover:[&amp;&gt;path]:fill-white"><path d="M0.75 2.80128C-0.25 3.37863 -0.25 4.822 0.75 5.39935L5.25 7.99743C6.25 8.57478 7.5 7.85309 7.5 6.69839V1.50224C7.5 0.347537 6.25 -0.374151 5.25 0.2032L0.75 2.80128Z" fill="url(#paint0_linear_584_1923)"></path><defs><linearGradient id="paint0_linear_584_1923" x1="7.5" y1="3.01721" x2="-9.17006" y2="13.1895" gradientUnits="userSpaceOnUse"><stop stopColor="#ED457D"></stop><stop offset="1" stopColor="#FA8F42"></stop></linearGradient></defs></svg>
            <span className="text-base font-semibold text-gray-800">
              Previous
            </span>
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Pick a {selectedOccasionName} Design They'll Love
          </h1>
          <p className="text-gray-600 text-base max-w-2xl mx-auto">
            Select from our curated collection of beautiful, emotionally engaging {selectedOccasionName} cards
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {/* Upload Custom Design Card */}
          <div
            className="
      rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer group flex flex-col
     bg-linear-to-b from-[#FFF5F5] to-white p-2
      
    "
            onClick={() => setIsCustomizing(true)}
          >
            {/* Content Area */}
            <div className=' border-2 border-dashed border-[#FFB4B4] h-full rounded-2xl'>
              <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-full">
                {/* Icon with border */}
                <div className="w-14 h-14 rounded-2xl border-2 border-[#FF69B4] flex items-center justify-center mb-6 bg-white">
                  <Upload className="w-6 h-6 text-[#FF69B4]" strokeWidth={2.5} />
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-gray-900 mb-3 text-center">
                  Upload your Own Design
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm text-center mb-8">
                  Use your own design or photo
                </p>

                {/* Divider */}
                <div className="w-full border-t border-gray-200 mb-6"></div>

                {/* File requirements */}
                <p className="text-gray-900 text-sm font-semibold text-center mb-1">
                  JPG or PNG
                </p>
                <p className="text-gray-500 text-xs text-center">
                  Max 5MB Vertical layout preferred
                </p>
              </div>
            </div>
          </div>

          {/* Existing SubCategory Cards */}
          {subCategories.map((subCategory, index) => (
            <div
              key={`${subCategory.id}-${index}`}
              className="bg-white rounded-2xl p-2 overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer border border-gray-200 group flex flex-col"
              onClick={() => handleSubCategorySelect(subCategory)}
            >
              {/* Image Container with rounded corners */}
              <div className="w-full">
                <div className="w-full h-80 overflow-hidden rounded-2xl bg-gray-200">
                  {subCategory.image ? (
                    <img
                      src={subCategory.image}
                      alt={subCategory.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                </div>

                <div
                  className="w-full h-full bg-gradient-to-br from-pink-100 to-orange-100 flex items-center justify-center"
                  style={{ display: subCategory.image ? 'none' : 'flex' }}
                >
                  <span className="text-6xl opacity-80">{subCategory.emoji || '🎁'}</span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {subCategory.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">
                  {subCategory.description}
                </p>
                <button
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-pink-500 to-orange-400 text-white font-semibold text-sm rounded-full transition-all duration-200 hover:shadow-xl hover:from-pink-600 hover:to-orange-500 flex items-center justify-center gap-2 transform hover:scale-105 mt-2.5"
                // onClick={(e) => {
                //   e.stopPropagation();
                //   handleOccasionSelect(occasion.id);
                // }}
                >
                  Choose this Design
                  <span className="text-lg font-bold">▸</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center">
          {loading && currentSubCategoryPage > 1 && (
            <div className="inline-flex items-center text-gray-600">
              <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-pink-500 mr-2"></div>
              <span className="text-sm">Loading more...</span>
            </div>
          )}
          {!loading && subCategoriesPagination?.hasNextPage && (
            <button
              onClick={handleLoadMore}
              className="bg-white text-gray-700 px-8 py-3 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 hover:border-pink-300 transition-all duration-200 text-sm"
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