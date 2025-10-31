import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { CloseIcon } from './icons/CloseIcon';
import { CopyIcon } from './icons/CopyIcon';

interface QrCodeModalProps {
  url: string;
  title: string;
  subtitle?: string;
  onClose: () => void;
}

const QrCodeModal: React.FC<QrCodeModalProps> = ({ url, title, subtitle, onClose }) => {
  const [copyFeedback, setCopyFeedback] = useState('');

  const handleCopy = async () => {
    if (!url || !navigator.clipboard) {
      setCopyFeedback('Failed');
      setTimeout(() => setCopyFeedback(''), 2000);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      console.error('Failed to copy link: ', err);
      setCopyFeedback('Failed');
      setTimeout(() => setCopyFeedback(''), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-center flex flex-col items-center gap-4 w-full max-w-sm"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-full flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate pr-4">
                {title}
            </h3>
            <button 
                onClick={onClose}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Close QR Code"
            >
                <CloseIcon className="w-6 h-6"/>
            </button>
        </div>
        
        {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 -mt-2">
                {subtitle}
            </p>
        )}

        <div className="bg-white p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            {url ? (
                <QRCodeSVG 
                    value={url} 
                    size={256} 
                    bgColor={"#FFFFFF"}
                    fgColor={"#000000"}
                    level={"L"}
                    includeMargin={false}
                    className="w-48 h-48 sm:w-56 sm:h-56"
                />
            ) : (
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center text-red-500">
                    Error generating QR Code.
                </div>
            )}
        </div>
        
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs">
            Scan with your phone's camera or copy the link below.
        </p>

        <div className="w-full pt-4 mt-2 border-t border-gray-200 dark:border-gray-700/50">
           <button 
             onClick={handleCopy}
             className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 active:bg-primary-800 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500/50 disabled:bg-gray-500 disabled:cursor-not-allowed"
             disabled={!!copyFeedback}
           >
             <CopyIcon className="w-5 h-5"/>
             <span>{copyFeedback || 'Copy Link'}</span>
           </button>
        </div>

      </div>
    </div>
  );
};

export default QrCodeModal;
