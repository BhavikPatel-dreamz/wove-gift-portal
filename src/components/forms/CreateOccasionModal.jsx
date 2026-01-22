import { useState, useEffect } from "react";
import Input from "./Input";
import TextArea from "./TextArea";
import Toggle from "./Toggle";
import Button from "./Button";
import Modal from "../Modal";
import EmojiPicker from "../occasions/EmojiPicker";
import ImageUpload from "./ImageUpload";
import { Loader } from "lucide-react";


const CreateOccasionModal = ({ isOpen, onClose, onSave, occasion, actionLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    emoji: "Select Emoji",
    description: "",
    type: "",
    isActive: true,
    image: null,
  });

  useEffect(() => {
    if (occasion) {
      setFormData({
        name: occasion.name || "",
        emoji: occasion.emoji || "Select Emoji",
        description: occasion.description || "",
        type: occasion.type || "",
        isActive: occasion.isActive !== undefined ? occasion.isActive : true,
        image: occasion.image || null,
      });
    } else {
      setFormData({
        name: "",
        emoji: "Select Emoji",
        description: "",
        type: "",
        isActive: true,
        image: null,
      });
    }
  }, [occasion, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  const title = occasion ? "Edit Occasion" : "Create New Occasion";
  const subtitle = occasion ? "Update your occasion details" : "Make your own reason to smile.";
  const buttonText = occasion ? "Save Changes" : "Save Occassion";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full max-h-[90vh] max-w-6xl">
        {/* Blue Header */}
        <div className="bg-[#1F59EE] text-white px-8 py-6 rounded-t-2xl shrink-0">
          <h2 className="text-2xl font-semibold mb-1">{title}</h2>
          <p className="text-blue-50 text-sm font-light">{subtitle}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 min-h-0">
          <div className="px-8 py-6">
            {/* Section Header with Buttons */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[12px] font-semibold text-[#4A4A4A]  sm:text-[20px]">Basic Information</h3>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <button
                  className="w-42.5 bg-[#1F59EE] text-white flex items-center justify-center gap-2 rounded-md text-xs font-medium"
                  onClick={handleSave}
                  disabled={actionLoading || !formData.name.trim()}
                >
                  {actionLoading ? <Loader className="animate-spin" size={14} /> : <img src="/material-symbols_save.svg" alt="Save" className="h-5 w-5" />}
                  <span>{buttonText}</span>
                </button>
              </div>
            </div>

            {/* Form Grid - Two Columns */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Occasion Name */}
              <Input
                label="Occasion Name"
                name="name"
                placeholder="Wedding Anniversary"
                value={formData.name}
                onChange={handleInputChange}
                required
              />

              {/* Occasion Type */}
              <Input
                label="Occasion Type"
                name="type"
                placeholder="Celebration,Holiday..."
                value={formData.type}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Emoji - Full Width */}
            <div className="mb-6">
              <EmojiPicker
                label="Emoji"
                className=""
                value={formData.emoji}
                onChange={(emoji) => setFormData(prev => ({ ...prev, emoji }))}
                required
              />
            </div>

            {/* Description - Full Width */}
            <div className="mb-6">
              <TextArea
                label="Description"
                name="description"
                placeholder="No description available"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                required
              />
            </div>

            {/* Image Upload Section */}
            <div className="border border-gray-300  rounded-lg p-4">
              <div className="mb-6">
                <p className="text-base font-medium text-[#4A4A4A] mb-4">Occasion Image<span className="text-gray-800">*</span></p>
                <ImageUpload
                  onFileChange={(file) => setFormData((prev) => ({ ...prev, image: file }))}
                  currentImage={
                    formData.image instanceof File
                      ? URL.createObjectURL(formData.image)
                      : formData.image
                  }
                  placeHolder="Upload Occasion Image"
                />
              </div>
            </div>

            {/* Active Toggle with Name Display */}
            <div className="space-y-3 pt-4">
              <input
                type="text"
                value={formData.name}
                placeholder="Wedding Anniversary"
                className="w-full h-[40px] px-4 py-3 text-[#4A4A4A] text-[12px] border border-gray-200 rounded-lg bg-white outline-none"
                readOnly
              />
              <div className="flex items-center gap-3">
                <Toggle
                  checked={formData.isActive}
                  onChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
                <span className="text-sm font-medium text-gray-700">Active (Visible To Users)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};


export default CreateOccasionModal;
