import { useState, useEffect } from "react";
import Card from "./Card";
import Input from "./Input";
import TextArea from "./TextArea";
import Toggle from "./Toggle";
import Button from "./Button";
import { Save } from "lucide-react";
import Modal from "../Modal";
import EmojiPicker from "../occasions/EmojiPicker";

const CreateOccasionModal = ({ isOpen, onClose, onSave, occasion }) => {
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🎉',
    description: '',
    isActive: true
  });

  useEffect(() => {
    if (occasion) {
      setFormData(occasion);
    } else {
      setFormData({
        name: '',
        emoji: '🎉',
        description: '',
        isActive: true
      });
    }
  }, [occasion]);

  const handleSave = () => {
    onSave(formData);
  };

  const title = occasion ? "Edit Occasion" : "Create New Occasion";
  const buttonText = occasion ? "Save Changes" : "Save Occasion";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Card className="w-full max-w-lg p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        </div>
        
        <div className="space-y-6">
          <Input
            label="Occasion Name"
            placeholder="e.g., Birthday Party"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />
          
          <EmojiPicker
            label="Select an Emoji"
            value={formData.emoji}
            onChange={(emoji) => setFormData({ ...formData, emoji })}
            required
          />
          
          <TextArea
            label="Description"
            placeholder="A short description for this occasion."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          
          <Toggle
            label="isActive"
            sublabel="Make this occasion visible to users."
            checked={formData.isActive}
            onChange={(checked) => setFormData({...formData, isActive: checked})}
          />
        </div>
        
        <div className="flex justify-end space-x-4 mt-8">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} icon={Save}>
            {buttonText}
          </Button>
        </div>
      </Card>
    </Modal>
  );
};

export default CreateOccasionModal;