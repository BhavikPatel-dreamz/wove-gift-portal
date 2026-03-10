import { useState, useEffect } from "react";
import Input from "./Input";
import TextArea from "./TextArea";
import Toggle from "./Toggle";
import Button from "./Button";
import Modal from "../Modal";
import EmojiPicker from "../occasions/EmojiPicker";
import ImageUpload from "./ImageUpload";
import { Loader } from "lucide-react";


const EMPTY_FIELD_ERRORS = {
  name: "",
  type: "",
  emoji: "",
  description: "",
  image: "",
};

const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/svg+xml",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/gif",
  "image/webp",
]);

const CreateOccasionModal = ({ isOpen, onClose, onSave, occasion, actionLoading }) => {
  const [formData, setFormData] = useState({
    name: "",
    emoji: "",
    description: "",
    type: "",
    isActive: true,
    image: null,
  });
  const [fieldErrors, setFieldErrors] = useState(EMPTY_FIELD_ERRORS);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (occasion) {
      setFormData({
        name: occasion.name || "",
        emoji: occasion.emoji || "",
        description: occasion.description || "",
        type: occasion.type || "",
        isActive: occasion.isActive !== undefined ? occasion.isActive : true,
        image: occasion.image || null,
      });
    } else {
      setFormData({
        name: "",
        emoji: "",
        description: "",
        type: "",
        isActive: true,
        image: null,
      });
    }
    setFieldErrors(EMPTY_FIELD_ERRORS);
    setFormError("");
  }, [occasion, isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (formError) {
      setFormError("");
    }
  };

  const handleEmojiChange = (emoji) => {
    setFormData((prev) => ({ ...prev, emoji }));
    if (fieldErrors.emoji) {
      setFieldErrors((prev) => ({ ...prev, emoji: "" }));
    }
    if (formError) {
      setFormError("");
    }
  };

  const handleImageChange = (file) => {
    setFormData((prev) => ({ ...prev, image: file }));
    if (fieldErrors.image) {
      setFieldErrors((prev) => ({ ...prev, image: "" }));
    }
    if (formError) {
      setFormError("");
    }
  };

  const validateClient = () => {
    const errors = { ...EMPTY_FIELD_ERRORS };
    const trimmedName = formData.name.trim();
    const trimmedType = formData.type.trim();
    const trimmedDescription = formData.description.trim();
    const hasImage = Boolean(
      (formData.image instanceof File && formData.image.size > 0) ||
      (typeof formData.image === "string" && formData.image.trim())
    );

    if (!trimmedName) {
      errors.name = "Occasion name is required.";
    } else if (trimmedName.length > 100) {
      errors.name = "Occasion name must be less than 100 characters.";
    }

    if (!trimmedType) {
      errors.type = "Occasion type is required.";
    } else if (trimmedType.length > 100) {
      errors.type = "Occasion type must be less than 100 characters.";
    }

    if (!trimmedDescription) {
      errors.description = "Description is required.";
    } else if (trimmedDescription.length > 500) {
      errors.description = "Description must be less than 500 characters.";
    }

    if (!hasImage) {
      errors.image = "Occasion image is required.";
    } else if (formData.image instanceof File) {
      if (!ALLOWED_IMAGE_TYPES.has(formData.image.type)) {
        errors.image = "Please upload a valid image file (SVG, PNG, JPG, GIF, WebP).";
      } else if (formData.image.size > MAX_IMAGE_SIZE) {
        errors.image = "Image size must be 2MB or less.";
      }
    }

    setFieldErrors(errors);

    const hasErrors = Object.values(errors).some(Boolean);
    if (hasErrors) {
      setFormError("Please fix the errors below before saving.");
      return false;
    }

    return true;
  };

  const applyServerErrors = (result) => {
    const errors = { ...EMPTY_FIELD_ERRORS };
    const unknownMessages = [];
    const responseMessage = result?.message || "Failed to save occasion.";

    if (Array.isArray(result?.errors)) {
      result.errors.forEach((err) => {
        const path = Array.isArray(err?.path) ? err.path[0] : err?.path;
        if (path && Object.prototype.hasOwnProperty.call(errors, path)) {
          errors[path] = err.message || "Invalid value.";
        } else if (err?.message) {
          unknownMessages.push(err.message);
        }
      });
    }

    const normalizedMessage = responseMessage.replace(/^Validation error:\s*/i, "");
    const messageParts = normalizedMessage.split(",").map((part) => part.trim()).filter(Boolean);

    messageParts.forEach((part) => {
      const [maybeField, ...rest] = part.split(":");
      if (!maybeField || rest.length === 0) {
        return;
      }

      const fieldName = maybeField.trim();
      const fieldMessage = rest.join(":").trim();

      if (Object.prototype.hasOwnProperty.call(errors, fieldName) && !errors[fieldName]) {
        errors[fieldName] = fieldMessage || "Invalid value.";
      }
    });

    if (!errors.name && /name/i.test(responseMessage) && /exist/i.test(responseMessage)) {
      errors.name = responseMessage;
    }
    if (!errors.type && /\btype\b/i.test(responseMessage)) {
      errors.type = responseMessage;
    }
    if (!errors.emoji && /\bemoji\b/i.test(responseMessage)) {
      errors.emoji = responseMessage;
    }
    if (!errors.description && /\bdescription\b/i.test(responseMessage)) {
      errors.description = responseMessage;
    }
    if (!errors.image && /\bimage\b/i.test(responseMessage)) {
      errors.image = responseMessage;
    }

    setFieldErrors(errors);

    const hasFieldError = Object.values(errors).some(Boolean);
    if (hasFieldError) {
      setFormError("Please correct the highlighted fields and try again.");
      return;
    }

    setFormError(unknownMessages[0] || responseMessage);
  };

  const handleSave = async () => {
    if (actionLoading) {
      return;
    }

    setFormError("");

    if (!validateClient()) {
      return;
    }

    const payload = {
      ...formData,
      name: formData.name.trim(),
      type: formData.type.trim(),
      description: formData.description.trim(),
      emoji: formData.emoji === "Select Emoji" ? "" : formData.emoji,
    };

    try {
      const result = await onSave(payload);

      if (!result?.success) {
        applyServerErrors(result);
        return;
      }

      setFieldErrors(EMPTY_FIELD_ERRORS);
      setFormError("");
    } catch (error) {
      setFormError(error?.message || "Something went wrong. Please try again.");
    }
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
                  disabled={actionLoading}
                >
                  {actionLoading ? <Loader className="animate-spin" size={14} /> : <img src="/material-symbols_save.svg" alt="Save" className="h-5 w-5" />}
                  <span>{buttonText}</span>
                </button>
              </div>
            </div>
            {formError && (
              <p className="mb-4 text-sm font-medium text-red-600">{formError}</p>
            )}

            {/* Form Grid - Two Columns */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Occasion Name */}
              <div>
                <Input
                  label="Occasion Name"
                  name="name"
                  placeholder="Wedding Anniversary"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {fieldErrors.name && <p className="mt-1 text-sm text-red-600">{fieldErrors.name}</p>}
              </div>

              {/* Occasion Type */}
              <div>
                <Input
                  label="Occasion Type"
                  name="type"
                  placeholder="Celebration,Holiday..."
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                />
                {fieldErrors.type && <p className="mt-1 text-sm text-red-600">{fieldErrors.type}</p>}
              </div>
            </div>

            {/* Emoji - Full Width */}
            <div className="mb-6">
              <EmojiPicker
                label="Emoji"
                className=""
                value={formData.emoji}
                onChange={handleEmojiChange}
                error={fieldErrors.emoji}
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
              {fieldErrors.description && <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>}
            </div>

            {/* Image Upload Section */}
            <div className="border border-gray-300  rounded-lg p-4">
              <div className="mb-6">
                <p className="text-base font-medium text-[#4A4A4A] mb-4">Occasion Image<span className="text-gray-800">*</span></p>
                <ImageUpload
                  onFileChange={handleImageChange}
                  currentImage={
                    formData.image instanceof File
                      ? URL.createObjectURL(formData.image)
                      : formData.image
                  }
                  placeHolder="Upload Occasion Image"
                />
                {fieldErrors.image && <p className="mt-2 text-sm text-red-600">{fieldErrors.image}</p>}
              </div>
            </div>

            {/* Active Toggle with Name Display */}
            <div className="space-y-3 pt-4">
              <input
                type="text"
                value={formData.name}
                placeholder="Wedding Anniversary"
                className="w-full h-10 px-4 py-3 text-[#4A4A4A] text-[12px] border border-gray-200 rounded-lg bg-white outline-none"
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
