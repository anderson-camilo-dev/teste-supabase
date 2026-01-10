"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-black/80 p-6 rounded-lg border border-purple-700 max-w-sm w-full relative">
        {title && <h3 className="text-white font-semibold mb-4">{title}</h3>}

        <div className="text-white">{children}</div>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-red-500 font-bold text-sm hover:text-red-700"
        >
          ×
        </button>
      </div>
    </div>
  );
}
