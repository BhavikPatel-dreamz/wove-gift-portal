import { useState, useEffect } from "react";
import Input from "./Input";
import TextArea from "./TextArea";
import Toggle from "./Toggle";
import Button from "./Button";
import { Save, X, Sparkles } from "lucide-react";
import Modal from "../Modal";
import EmojiPicker from "../occasions/EmojiPicker";
import ImageUpload from "./ImageUpload";

const CreateOccasionModal = ({ isOpen, onClose, onSave, occasion, actionLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🎉',
    description: '',
    type: '',
    isActive: true,
    image: null
  });

  console.log("occasion", occasion);

  useEffect(() => {
    if (occasion) {
      setFormData({
        name: occasion.name || '',
        emoji: occasion.emoji || '🎉',
        description: occasion.description || '',
        type: occasion.type || '',
        isActive: occasion.isActive !== undefined ? occasion.isActive : true,
        image: occasion.image || null
      });
    } else {
      setFormData({
        name: '',
        emoji: '🎉',
        description: '',
        type: '',
        isActive: true,
        image: null
      });
    }
  }, [occasion, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (checked) => {
    setFormData(prev => ({ ...prev, isActive: checked }));
  };

  const handleEmojiChange = (emoji) => {
    setFormData(prev => ({ ...prev, emoji }));
  };

  const handleImageChange = (file) => {
    setFormData(prev => ({ ...prev, image: file }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const title = occasion ? "Edit Occasion" : "Create New Occasion";
  const buttonText = occasion ? "Save Changes" : "Create Occasion";
  const isEditing = !!occasion;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="absolute inset-0 bg-gradient-to-br from-violet-50/50 via-white to-indigo-50/30 pointer-events-none">
      {/* <div className="bg-white/95 backdrop-blur-xl rounded-3xl w-full max-h-[90vh] overflow-hidden max-w-lg mx-auto shadow-2xl border border-white/20 relative">
        {/* Gradient Background Overlay */}

      <div className="relative z-10 p-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg mb-4 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            <div className="text-3xl relative z-10">
              {formData.emoji}
            </div>
            {!isEditing && (
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
              </div>
            )}
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 text-sm">
            {isEditing
              ? "Update your occasion details below"
              : "Create a memorable occasion with all the details"
            }
          </p>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-1">
              <Input
                label="Occasion Name"
                name="name"
                placeholder="e.g., Birthday Party, Wedding Anniversary"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="text-base"
              />
            </div>

            <div className="space-y-1">
              <Input
                label="Type"
                name="type"
                placeholder="e.g., Holiday, Celebration"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="text-base"
              />
            </div>

            <div className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50 p-4 rounded-2xl border border-indigo-100/50">
              <EmojiPicker
                label="Choose an Emoji"
                value={formData.emoji}
                onChange={handleEmojiChange}
              />
            </div>

            <div className="space-y-1">
              <TextArea
                label="Description"
                name="description"
                placeholder="Tell us more about this special occasion..."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="text-base resize-none"
              />
            </div>


            <div className="bg-gradient-to-r from-emerald-50/30 to-teal-50/30 p-4 rounded-2xl border border-emerald-100/30">
              <Toggle
                label="Active Status"
                sublabel="Make this occasion visible and available to users"
                checked={formData.isActive}
                onChange={handleToggleChange}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">


            <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100/50">
              <ImageUpload
                label="Occasion Image"
                onFileChange={handleImageChange}
                currentImage={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100/50">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={actionLoading}
            className="flex-1 py-3 text-base font-medium border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            icon={Save}
            disabled={actionLoading || !formData.name.trim()}
            loading={actionLoading}
            className="flex-1 py-3 text-base font-medium bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 disabled:transform-none disabled:hover:scale-100"
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateOccasionModal;