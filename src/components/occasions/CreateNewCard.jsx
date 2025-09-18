import { useState } from 'react';
import { ArrowLeft, Save, Image as ImageIcon, X } from 'lucide-react';
import Input from '../forms/Input';
import ImageUpload from '../forms/ImageUpload';
import EmojiPicker from './EmojiPicker';
import Toggle from '../forms/Toggle';
import Button from '../forms/Button';
import Card from '../forms/Card';
import { addOccasionCategory } from '../../lib/action/occasionAction';

export default function CreateNewCard({ occasion, onBack, onSave }) {
  const [formData, setFormData] = useState({
    cardName: '',
    internalDescription: '',
    isActive: true,
    previewEmoji: '🎁',
    imageUrl: null,
    imageFile: null, // To store the actual File object
  });

  const handleSaveCard = async () => {
    console.log('Saving card...', formData);

    const data = new FormData();
    data.append('name', formData.cardName);
    data.append('description', formData.internalDescription);
    data.append('emoji', formData.previewEmoji);
    data.append('isActive', formData.isActive);
    data.append('occasionId', occasion.id);

    if (formData.imageFile) {
      data.append('image', formData.imageFile);
    }

    const result = await addOccasionCategory(data);

    if (result.success) {
      console.log('Occasion category created successfully:', result.data);
      onSave(result.data); // Pass the newly created category data
      onBack();
    } else {
      console.error('Failed to create occasion category:', result.message);
      // Optionally, display an error message to the user
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
        <div className="flex items-center space-x-4 mb-8">
            <Button 
              variant="ghost" 
              onClick={onBack}
              icon={ArrowLeft}
              className="text-gray-600"
            >
              Back to Card Designs
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {/* Left Column - Form */}
            <div className="md:col-span-2 bg-white p-8 rounded-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create a New Card for {occasion.name}</h2>
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
                        required={true}
                        onFileChange={handleFileSelect}
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
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Live Preview</h3>
                <Card className="overflow-hidden">
                    <div className={`aspect-[3/4] flex items-center justify-center bg-gray-100 ${!formData.imageUrl && 'p-4'}`}>
                      {formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Card Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center text-gray-500">
                            <ImageIcon className="mx-auto h-12 w-12 mb-2" />
                            <p className="text-sm">Your image will appear here</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 truncate">{formData.cardName || "Card Name"}</h4>
                      <p className="text-sm text-gray-600">For {occasion.name}</p>
                    </div>
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
            Save Card Design
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
