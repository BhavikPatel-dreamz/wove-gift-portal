"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";

const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-50 ">
      <div
        ref={modalRef}
        className="relative w-full max-w-7xl  overflow-y-auto  rounded-lg shadow-lg "
      >
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-4 mr-4 text-gray-500 hover:text-gray-800"
        >
        {/* <X className="w-4 h-4 text-gray-600 group-hover:text-gray-900 transition-colors" /> */}
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
