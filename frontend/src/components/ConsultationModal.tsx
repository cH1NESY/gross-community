import React from 'react';
import { X, Phone } from 'lucide-react';

interface ConsultationModalProps {
  onClose: () => void;
}

const ConsultationModal: React.FC<ConsultationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-md shadow-2xl border border-pink-500/30">
        <div className="p-6 border-b border-pink-500/30">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Phone className="w-8 h-8 text-pink-400" />
              <h2 className="text-2xl font-bold text-white">Спасибо!</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
            >
              <X size={24} className="text-gray-300" />
            </button>
          </div>
        </div>

        <div className="p-6 text-center space-y-6">
          <div className="space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-700 rounded-full flex items-center justify-center mx-auto">
              <Phone className="w-10 h-10 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-white">
              Благодарим за обращение!
            </h3>
            
            <p className="text-gray-300 leading-relaxed">
              Ожидайте звонка в ближайшее время. Наш менеджер свяжется с вами для проведения консультации.
            </p>
          </div>

          <div className="bg-gradient-to-br from-pink-900/50 to-pink-800/50 p-4 rounded-lg border border-pink-500/30">
            <p className="text-sm text-pink-300 font-medium">
              Время ожидания: в течение 1-2 часов в рабочее время
            </p>
          </div>

          <button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 w-full"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsultationModal;