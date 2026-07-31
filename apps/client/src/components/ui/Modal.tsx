import type { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 px-4">

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-8 relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-5 text-2xl text-gray-500 hover:text-red-500"
        >
          ✕
        </button>

        {children}

      </div>

    </div>
  );
};

export default Modal;