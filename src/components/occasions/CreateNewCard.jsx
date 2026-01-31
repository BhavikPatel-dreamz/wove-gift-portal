import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Image as ImageIcon, Eye, Sparkles, ChevronLeft } from 'lucide-react';
import Input from '../forms/Input';
import ImageUpload from '../forms/ImageUpload';
import EmojiPicker from './EmojiPicker';
import Toggle from '../forms/Toggle';
import Button from '../forms/Button';
import Card from '../forms/Card';
import { addOccasionCategory, updateOccasionCategory } from '../../lib/action/occasionAction';
import toast from 'react-hot-toast';
import Modal from '../Modal';
import { Loader } from 'lucide-react';

export default function CreateNewCard({ occasion, onBack, onSave, initialCardData = null, setModalOpen }) {
  const isEditing = Boolean(initialCardData);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(!isEditing ? true : false);


  const [formData, setFormData] = useState({
    cardName: '',
    internalDescription: '',
    category: '',
    isActive: true,
    previewEmoji: '🎁',
    imageUrl: null,
    imageFile: null,
  });

  // Load initial data when editing
  useEffect(() => {

    if (initialCardData) {
      const newFormData = {
        cardName: initialCardData.title || '',
        internalDescription: initialCardData.description || '',
        category: initialCardData.category || '',
        isActive: initialCardData.active ?? true,
        previewEmoji: initialCardData.preview || '🎁',
        imageUrl: initialCardData.imageUrl || null,
        imageFile: null,
      };

      setFormData(newFormData);
    }
  }, [initialCardData]);

  const handleSaveCard = async () => {
    setIsSaving(true);
    const data = new FormData();

    if (isEditing) {
      // For editing, include the card ID
      data.append('id', initialCardData.id);
    }

    data.append('name', formData.cardName);
    data.append('description', formData.internalDescription);
    data.append('category', formData.category);
    data.append('emoji', formData.previewEmoji);
    data.append('isActive', formData.isActive);
    data.append('occasionId', occasion.id);

    if (formData.imageFile) {
      data.append('image', formData.imageFile);
    } else if (formData.imageUrl && !formData.imageFile) {
      // Keep existing image if no new image is selected
      data.append('image', formData.imageUrl);
    }

    try {
      const result = isEditing
        ? await updateOccasionCategory(data)
        : await addOccasionCategory(data);

      if (result.success) {
        toast.success(`Occasion category ${isEditing ? 'updated' : 'created'} successfully!`);
        onSave(result.data);
        onBack();
        setModalOpen(false);
      } else {
        toast.error(`Failed to ${isEditing ? 'update' : 'create'} occasion category: ${result.message}`);
      }
    } catch (error) {
      console.error('Error saving card:', error);
      toast.error('An unexpected error occurred while saving the card.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileSelect = (file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result, imageFile: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isEditing) {
    return (
      <div className="max-w-6xl mx-auto text-black">
        <div className="flex items-center">
          <Button
            variant="ghost"
            onClick={onBack}
            className="group flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 backdrop-blur-sm rounded-xl border border-transparent hover:border-gray-200/50 transition-all duration-200 -ml-2"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-100/50 group-hover:bg-white group-hover:scale-110 transition-all duration-200">
              <ChevronLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform duration-200" />
            </div>
            <span className="font-medium text-sm">Back</span>
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Left Column - Form */}
          <div className="md:col-span-2 bg-white p-4 rounded-lg border border-gray-200">
            <div className='flex gap-2 items-center mb-5'>
              <h2>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15.8327 3.33366H14.166V2.50033C14.166 2.27931 14.0782 2.06735 13.9219 1.91107C13.7657 1.75479 13.5537 1.66699 13.3327 1.66699C13.1117 1.66699 12.8997 1.75479 12.7434 1.91107C12.5871 2.06735 12.4993 2.27931 12.4993 2.50033V3.33366H7.49935V2.50033C7.49935 2.27931 7.41155 2.06735 7.25527 1.91107C7.09899 1.75479 6.88703 1.66699 6.66602 1.66699C6.445 1.66699 6.23304 1.75479 6.07676 1.91107C5.92048 2.06735 5.83268 2.27931 5.83268 2.50033V3.33366H4.16602C3.50297 3.33366 2.86709 3.59705 2.39825 4.06589C1.92941 4.53473 1.66602 5.17062 1.66602 5.83366V15.8337C1.66602 16.4967 1.92941 17.1326 2.39825 17.6014C2.86709 18.0703 3.50297 18.3337 4.16602 18.3337H15.8327C16.4957 18.3337 17.1316 18.0703 17.6005 17.6014C18.0693 17.1326 18.3327 16.4967 18.3327 15.8337V5.83366C18.3327 5.17062 18.0693 4.53473 17.6005 4.06589C17.1316 3.59705 16.4957 3.33366 15.8327 3.33366ZM16.666 15.8337C16.666 16.0547 16.5782 16.2666 16.4219 16.4229C16.2657 16.5792 16.0537 16.667 15.8327 16.667H4.16602C3.945 16.667 3.73304 16.5792 3.57676 16.4229C3.42048 16.2666 3.33268 16.0547 3.33268 15.8337V10.0003H16.666V15.8337ZM16.666 8.33366H3.33268V5.83366C3.33268 5.61265 3.42048 5.40068 3.57676 5.2444C3.73304 5.08812 3.945 5.00033 4.16602 5.00033H5.83268V5.83366C5.83268 6.05467 5.92048 6.26663 6.07676 6.42291C6.23304 6.5792 6.445 6.66699 6.66602 6.66699C6.88703 6.66699 7.09899 6.5792 7.25527 6.42291C7.41155 6.26663 7.49935 6.05467 7.49935 5.83366V5.00033H12.4993V5.83366C12.4993 6.05467 12.5871 6.26663 12.7434 6.42291C12.8997 6.5792 13.1117 6.66699 13.3327 6.66699C13.5537 6.66699 13.7657 6.5792 13.9219 6.42291C14.0782 6.26663 14.166 6.05467 14.166 5.83366V5.00033H15.8327C16.0537 5.00033 16.2657 5.08812 16.4219 5.2444C16.5782 5.40068 16.666 5.61265 16.666 5.83366V8.33366Z" fill="#1F59EE" />
                </svg>
              </h2>
              <span className="text-[#4A4A4A] text-base font-semibold uppercase">{isEditing ? 'Edit Card Design' : 'Create a New Card'} for {occasion.name}</span>
            </div>


            <div className="space-y-6">
              <Input
                label="Card Name"
                placeholder="e.g., Elegant Gold"
                value={formData.cardName}
                onChange={(e) => updateFormData('cardName', e.target.value)}
                required
              />

              <Input
                label="Internal Description"
                type="textarea"
                placeholder="Internal notes for admin reference..."
                value={formData.internalDescription}
                onChange={(e) => updateFormData('internalDescription', e.target.value)}
                rows={3}
              />

              <Input
                label="Category"
                placeholder="e.g., Funny, Romantic"
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
                required
              />

              <ImageUpload
                label="Card Design Image"
                onFileChange={handleFileSelect}
                currentImage={formData.imageUrl instanceof File ? URL.createObjectURL(formData.imageUrl) : formData.imageUrl}
                placeHolder="Upload Card Design Image"
              />

              <EmojiPicker
                label="Preview Emoji"
                value={formData.previewEmoji}
                onChange={(emoji) => updateFormData('previewEmoji', emoji)}
                required
              />

              <Toggle
                label="Active"
                sublabel="Make this card design available to users."
                checked={formData.isActive}
                onChange={() => updateFormData('isActive', !formData.isActive)}
              />
            </div>
          </div>

          {/* Right Column - Preview */}
          {isEditing && (
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg">
                  <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="30" height="30" rx="6" fill="#1F59EE" />
                    <path d="M15.0001 9C18.5948 9 21.5854 11.5867 22.2128 15C21.5861 18.4133 18.5948 21 15.0001 21C11.4054 21 8.41475 18.4133 7.78809 15C8.41475 11.5867 11.4054 9 15.0001 9ZM15.0001 19.6667C16.3598 19.6665 17.6793 19.2048 18.7424 18.357C19.8055 17.5092 20.5493 16.3256 20.8521 15C20.5485 13.6752 19.8044 12.4926 18.7414 11.6457C17.6784 10.7988 16.3595 10.3376 15.0004 10.3376C13.6413 10.3376 12.3224 10.7988 11.2594 11.6457C10.1964 12.4926 9.45233 13.6752 9.14875 15C9.45148 16.3255 10.1952 17.509 11.2582 18.3568C12.3212 19.2045 13.6404 19.6664 15.0001 19.6667ZM15.0001 18C14.2044 18 13.4414 17.6839 12.8788 17.1213C12.3162 16.5587 12.0001 15.7956 12.0001 15C12.0001 14.2044 12.3162 13.4413 12.8788 12.8787C13.4414 12.3161 14.2044 12 15.0001 12C15.7957 12 16.5588 12.3161 17.1214 12.8787C17.684 13.4413 18.0001 14.2044 18.0001 15C18.0001 15.7956 17.684 16.5587 17.1214 17.1213C16.5588 17.6839 15.7957 18 15.0001 18ZM15.0001 16.6667C15.4421 16.6667 15.866 16.4911 16.1786 16.1785C16.4912 15.866 16.6668 15.442 16.6668 15C16.6668 14.558 16.4912 14.134 16.1786 13.8215C15.866 13.5089 15.4421 13.3333 15.0001 13.3333C14.5581 13.3333 14.1341 13.5089 13.8216 13.8215C13.509 14.134 13.3334 14.558 13.3334 15C13.3334 15.442 13.509 15.866 13.8216 16.1785C14.1341 16.4911 14.5581 16.6667 15.0001 16.6667Z" fill="white" />
                  </svg>

                </div>
                <h3 className="text-sm font-semibold text-[#4A4A4A]">Live Preview</h3>
                {formData.imageUrl && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-[#DDFCE9] border border-[#10B981] text-[#10B981] text-[10px] font-medium rounded-full">
                    Preview Ready
                  </div>
                )}
              </div>

              <div className="overflow-hidden border border-[#E5E7EB] p-4 bg-white rounded-lg max-w-md max-h-150">
                {/* Image Preview Section */}
                <div className="relative flex items-center justify-center overflow-hidden max-h-75">
                  {formData.imageUrl ? (
                    <>
                      <div className="absolute inset-0 bg-linear-to-t from-black/5 to-transparent z-10" />
                      <img
                        src={formData.imageUrl}
                        alt="Card Preview"
                        className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                      />
                      {/* Corner Badge */}
                      <div className="absolute top-3 right-3 z-20 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-lg">
                        Preview
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-400 p-8">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 mx-auto bg-linear-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-500" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Eye className="w-3 h-3 text-indigo-600" />
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-1">Upload an image</p>
                      <p className="text-xs text-gray-500">Your card preview will appear here</p>
                    </div>
                  )}
                </div>

                {/* Card Details Section */}
                <div className="p-6 bg-white border-t border-gray-100/50">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-lg text-[#1A1A1A] truncate transition-colors duration-200">
                        {formData.cardName ? (
                          <span className="bg-linear-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            {formData.cardName}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">Enter card name...</span>
                        )}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                      <p className="text-xs text-[#8E36FB] font-normal">
                        For <span className="text-[#8E36FB]  text-xs font-semibold">{occasion.name}</span>
                      </p>
                    </div>

                    {/* Additional Preview Info */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <div className="text-xs text-[#4A4A4A]">
                        {formData.imageUrl ? 'Ready to create' : 'Waiting for image'}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${formData.cardName && formData.imageUrl
                          ? 'bg-green-400'
                          : formData.cardName || formData.imageUrl
                            ? 'bg-yellow-400'
                            : 'bg-gray-300'
                          }`}></div>
                        <span className="text-xs text-[#4A4A4A]">
                          {formData.cardName && formData.imageUrl
                            ? 'Complete'
                            : formData.cardName || formData.imageUrl
                              ? 'In Progress'
                              : 'Getting Started'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Optional: Animated Border Effect */}
                <div className="absolute inset-0 rounded-lg bg-linear-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"></div>
              </div>
            </div>
          )}
        </div>
        {/* Action Buttons */}
        <div className="mt-8 flex items-center space-x-4">
          <Button
            onClick={handleSaveCard}
            size="lg"
            icon={Save}
            disabled={isSaving}
            loading={isSaving}
          >
            {isEditing ? 'Update Card Design' : 'Save Card Design'}
          </Button>
          <Button
            onClick={onBack}
            variant="outline"
            disabled={isSaving}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className="flex flex-col h-full max-h-[90vh] max-w-4xl mx-auto text-[#4A4A4A]">
        {/* Header */}
        <div className="bg-[#1F59EE] text-white px-8 py-6 rounded-t-2xl shrink-0">
          <h2 className="text-2xl font-semibold mb-1">Create a New Card for {occasion.name}</h2>
          <p className="text-blue-50 text-sm font-light">Make a new card design for this occasion.</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0 rounded-b-2xl">
          <div className="px-8 py-6">
            {/* Section Header with Buttons */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Card Details</h3>
              <div className="flex gap-3">
                <Button variant="outline" onClick={onBack} disabled={isSaving}>Cancel</Button>
                <Button
                  onClick={handleSaveCard}
                  icon={Save}
                  disabled={isSaving || !formData.cardName.trim()}
                  className="w-42.5 bg-[#1F59EE] text-white flex items-center justify-center gap-2 rounded-md text-xs font-medium"
                >
                  {isSaving ? <Loader className="animate-spin" size={14} /> : <img src="/material-symbols_save.svg" alt="Save" className="h-5 w-5" />}
                  <div>Save Card Design</div>
                </Button>
              </div>
            </div>

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Input
                label="Card Name"
                placeholder="e.g., Elegant Gold"
                value={formData.cardName}
                onChange={(e) => updateFormData('cardName', e.target.value)}
                required
              />
              <Input
                label="Category"
                placeholder="e.g., Funny, Romantic"
                value={formData.category}
                onChange={(e) => updateFormData('category', e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <EmojiPicker
                label="Preview Emoji"
                value={formData.previewEmoji}
                onChange={(emoji) => updateFormData('previewEmoji', emoji)}
                required
              />
            </div>

            <div className="mb-6">
              <Input
                label="Internal Description"
                type="textarea"
                placeholder="Internal notes for admin reference..."
                value={formData.internalDescription}
                onChange={(e) => updateFormData('internalDescription', e.target.value)}
                rows={3}
              />
            </div>

            <div className="border border-gray-300 rounded-lg p-4 mb-6">
              <p className="text-base font-medium text-gray-800 mb-4">Card Design Image<span className="text-red-500 ml-1">*</span></p>
              <ImageUpload
                onFileChange={handleFileSelect}
                currentImage={formData.imageUrl}
                placeHolder="Upload Card Design Image"
              />
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3">
                <Toggle
                  checked={formData.isActive}
                  onChange={() => updateFormData('isActive', !formData.isActive)}
                />
                <span className="text-sm font-medium text-gray-700">Active (Visible To Users)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}