import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface TextInputProps {
  text: string;
  setText: (text: string) => void;
}

export const TextInput: React.FC<TextInputProps> = ({ text, setText }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearText = () => setText('');

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          Input Text
        </label>
        <div className="flex space-x-2">
           {text && (
            <button 
              onClick={clearText}
              className="text-xs font-medium text-red-500 hover:text-red-700 flex items-center px-2 py-1 bg-red-50 rounded"
            >
              <X size={12} className="mr-1" /> Clear
            </button>
          )}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-medium text-primary hover:text-indigo-700 flex items-center px-2 py-1 bg-indigo-50 rounded"
          >
            <Upload size={12} className="mr-1" /> Upload .txt
          </button>
        </div>
        <input
          type="file"
          accept=".txt"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileUpload}
        />
      </div>
      
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text or upload a document to convert to speech..."
          className="w-full h-48 p-4 bg-white border-2 border-transparent focus:border-primary rounded-xl resize-none text-base leading-relaxed text-gray-800 placeholder-gray-400 focus:outline-none shadow-sm transition-all"
        />
        <div className="absolute bottom-3 right-4 text-xs text-gray-400 font-medium">
          {text.length} chars
        </div>
      </div>
    </div>
  );
};