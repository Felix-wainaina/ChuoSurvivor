import type { ReactNode } from 'react'; // <-- Added "type" here to fix the red error

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 p-4 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose} // <-- Added this to fix the yellow warning! Clicking the dark background now closes the modal.
    >
      <div 
        className="bg-white rounded-3xl p-4 sm:p-8 w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl relative"
        onClick={(e) => e.stopPropagation()} // <-- Prevents the modal from closing if you click inside the white box
      >
        {children}
      </div>
    </div>
  );
}
