import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export function Modal({ isOpen, onClose, title, message }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#FFF8E7] rounded-2xl shadow-2xl border-2 border-[#D4AF37] overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <p className="text-gray-700 leading-relaxed mb-6">{message}</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#D4AF37] text-white rounded-xl hover:bg-[#B8941F] transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
