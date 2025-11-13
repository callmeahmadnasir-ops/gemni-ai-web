import React from 'react';
import { X, MessageSquareText } from 'lucide-react';

interface WhatsAppPopupProps {
  onClose: () => void;
}

const WhatsAppPopup: React.FC<WhatsAppPopupProps> = ({ onClose }) => {
  const channelUrl = "https://whatsapp.com/channel/0029Vb6Od0fLY6d1qVGMue2X";

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 md:p-8 text-center relative transform transition-all"
        style={{ animation: 'fadeInUp 0.4s ease-out forwards' }}
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          aria-label="Close popup"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="mx-auto bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mb-4 border-4 border-white shadow-sm">
            <MessageSquareText className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Join our WhatsApp Channel
        </h2>
        <p className="text-gray-600 mb-6 px-4">
          Follow <span className="font-semibold">AI Tricks 🇵🇰</span> for the latest updates.
        </p>
        
        <a 
          href={channelUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
          onClick={onClose}
        >
          Follow Channel
        </a>
      </div>
    </div>
  );
};

export default WhatsAppPopup;
