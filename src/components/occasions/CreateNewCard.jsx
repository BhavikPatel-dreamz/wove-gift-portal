import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Image as ImageIcon, Eye, Sparkles, ChevronLeft } from 'lucide-react';
import Input from '../forms/Input';
import ImageUpload from '../forms/ImageUpload';
import EmojiPicker from './EmojiPicker';
import Toggle from '../forms/Toggle';
import Button from '../forms/Button';
import Card from '../forms/Card';
import { addOccasionCategory, updateOccasionCategory } from '../../lib/action/occasionAction';

export default function CreateNewCard({ occasion, onBack, onSave, initialCardData = null }) {
  const isEditing = Boolean(initialCardData);

  console.log('CreateNewCard rendered with:', { isEditing, initialCardData }); // Debug log

  const [formData, setFormData] = useState({
    cardName: '',
    internalDescription: '',
    isActive: true,
    previewEmoji: '🎁',
    imageUrl: null,
    imageFile: null,
  });

  // Load initial data when editing
  useEffect(() => {
    console.log('useEffect triggered with initialCardData:', initialCardData); // Debug log

    if (initialCardData) {
      const newFormData = {
        cardName: initialCardData.title || '',
        internalDescription: initialCardData.description || '',
        isActive: initialCardData.active ?? true,
        previewEmoji: initialCardData.preview || '🎁',
        imageUrl: initialCardData.imageUrl || null,
        imageFile: null,
      };

      console.log('Setting form data:', newFormData); // Debug log
      setFormData(newFormData);
    }
  }, [initialCardData]);

  const handleSaveCard = async () => {
    console.log('Saving card...', formData);

    const data = new FormData();

    if (isEditing) {
      // For editing, include the card ID
      data.append('id', initialCardData.id);
    }

    data.append('name', formData.cardName);
    data.append('description', formData.internalDescription);
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
        console.log(`Occasion category ${isEditing ? 'updated' : 'created'} successfully:`, result.data);
        onSave(result.data);
        onBack();
      } else {
        console.error(`Failed to ${isEditing ? 'update' : 'create'} occasion category:`, result.message);
        // Optionally, display an error message to the user
      }
    } catch (error) {
      console.error('Error saving card:', error);
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
        <div className="md:col-span-2 bg-white p-8 rounded-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEditing ? 'Edit Card Design' : 'Create a New Card'} for {occasion.name}
          </h2>


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

            <ImageUpload
              label="Card Design Image"
              onFileChange={handleFileSelect}
              currentImage={formData.imageUrl instanceof File ? URL.createObjectURL(formData.imageUrl) : formData.imageUrl}
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
      <div className="md:col-span-1">
  <div className="flex items-center gap-2 mb-6">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
      <Eye className="w-4 h-4 text-white" />
    </div>
    <h3 className="text-xl font-bold text-gray-900">Live Preview</h3>
    {formData.imageUrl && (
      <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
        <Sparkles className="w-3 h-3" />
        Preview Ready
      </div>
    )}
  </div>

  <Card className="overflow-hidden shadow-xl border-0 bg-white/80 backdrop-blur-sm">
    {/* Image Preview Section */}
    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
      {formData.imageUrl ? (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent z-10" />
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
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center">
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
          <h4 className="font-bold text-lg text-gray-900 truncate transition-colors duration-200">
            {formData.cardName ? (
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {formData.cardName}
              </span>
            ) : (
              <span className="text-gray-400 italic">Enter card name...</span>
            )}
          </h4>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
          <p className="text-sm text-gray-600 font-medium">
            For <span className="text-indigo-600 font-semibold">{occasion.name}</span>
          </p>
        </div>

        {/* Additional Preview Info */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="text-xs text-gray-500">
            {formData.imageUrl ? 'Ready to create' : 'Waiting for image'}
          </div>
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              formData.cardName && formData.imageUrl 
                ? 'bg-green-400' 
                : formData.cardName || formData.imageUrl 
                ? 'bg-yellow-400' 
                : 'bg-gray-300'
            }`}></div>
            <span className="text-xs text-gray-500">
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
    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"></div>
  </Card>
</div>
      </div>
      {/* Action Buttons */}
      <div className="mt-8 flex items-center space-x-4">
        <Button
          onClick={handleSaveCard}
          size="lg"
          icon={Save}
        >
          {isEditing ? 'Update Card Design' : 'Save Card Design'}
        </Button>
        <Button
          onClick={onBack}
          variant="outline"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}