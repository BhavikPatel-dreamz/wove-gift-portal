import { useState, useEffect } from "react";
import Input from "./Input";
import TextArea from "./TextArea";
import Toggle from "./Toggle";
import Button from "./Button";
import { Save, Image as ImageIcon } from "lucide-react";
import Modal from "../Modal";
import EmojiPicker from "../occasions/EmojiPicker";
import ImageUpload from "./ImageUpload";

const CreateOccasionModal = ({ isOpen, onClose, onSave, occasion, actionLoading }) => {
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🎉',
    description: '',
    isActive: true,
    image: null
  });

  console.log("occasion",occasion);
  
  useEffect(() => {
    if (occasion) {
      setFormData({
        name: occasion.name || '',
        emoji: occasion.emoji || '🎉',
        description: occasion.description || '',
        isActive: occasion.isActive !== undefined ? occasion.isActive : true,
        image: occasion.image || null
      });
    } else {
      setFormData({
        name: '',
        emoji: '🎉',
        description: '',
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
  const buttonText = occasion ? "Save Changes" : "Save Occasion";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl w-full max-h-[80vh] overflow-y-scroll min-w-2xl p-6 sm:p-8 text-black">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="text-gray-500 mt-1">Fill in the details below.</p>
          </div>
          <div className="text-4xl">{formData.emoji}</div>
        </div>
        
        <div className="space-y-6">
          <Input
            label="Occasion Name"
            name="name"
            placeholder="e.g., Birthday Party"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          
          <EmojiPicker
            label="Select an Emoji"
            value={formData.emoji}
            onChange={handleEmojiChange}
          />
          
          <TextArea
            label="Description"
            name="description"
            placeholder="A short description for this occasion."
            value={formData.description}
            onChange={handleInputChange}
          />

          <ImageUpload
            label="Occasion Image"
            onFileChange={handleImageChange}
            currentImage={formData.image instanceof File ? URL.createObjectURL(formData.image) : formData.image}
          />
          
          <Toggle
            label="Active Status"
            sublabel="Make this occasion visible to users."
            checked={formData.isActive}
            onChange={handleToggleChange}
          />
        </div>
        
        <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose} disabled={actionLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} icon={Save} disabled={actionLoading} loading={actionLoading}>
            {buttonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreateOccasionModal;
