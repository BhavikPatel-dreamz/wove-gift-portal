import { useState, useEffect } from "react";
import Card from "./Card";
import Input from "./Input";
import TextArea from "./TextArea";
import Toggle from "./Toggle";
import Button from "./Button";
import { Save } from "lucide-react";
import Modal from "../Modal";
import EmojiPicker from "../occasions/EmojiPicker";

const CreateOccasionModal = ({ isOpen, onClose, onSave, occasionToEdit }) => {
  const [formData, setFormData] = useState({
    name: '',
    emoji: '🎉',
    description: '',
    active: true
  });

  useEffect(() => {
    if (occasionToEdit) {
      setFormData(occasionToEdit);
    } else {
      setFormData({
        name: '',
        emoji: '🎉',
        description: '',
        active: true
      });
    }
  }, [occasionToEdit, isOpen]);

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const title = occasionToEdit ? "Edit Occasion" : "Create New Occasion";
  const buttonText = occasionToEdit ? "Save Changes" : "Save Occasion";

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
            label="Active"
            sublabel="Make this occasion visible to users."
            checked={formData.active}
            onChange={(checked) => setFormData({...formData, active: checked})}
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