import { X, AlertTriangle } from 'lucide-react';

export default function ConfirmationModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "CONFIRM", 
  cancelText = "CANCEL" 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-black border border-dark-500 rounded-none shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden animate-slide-up">
        
        {/* Red accent top line */}
        <div className="h-1 w-full bg-accent" />
        
        <div className="px-6 py-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-accent/10 border border-accent/20">
              <AlertTriangle size={18} className="text-accent" />
            </div>
            <h2 className="text-sm font-bold font-mono tracking-[4px] text-white uppercase">{title}</h2>
          </div>
          
          <p className="text-[11px] text-gray-400 font-mono uppercase tracking-widest leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex items-center justify-end gap-3">
            <button 
              onClick={onCancel}
              className="px-6 py-2 bg-transparent border border-dark-500 text-gray-500 text-[10px] font-mono tracking-[3px] hover:text-white hover:border-gray-500 transition-all cursor-pointer uppercase"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className="px-6 py-2 bg-accent text-white text-[10px] font-bold font-mono tracking-[3px] hover:bg-accent-dim transition-all cursor-pointer uppercase shadow-[0_0_15px_rgba(255,0,51,0.3)]"
            >
              {confirmText}
            </button>
          </div>
        </div>
        
        {/* Subtle decorative background elements */}
        <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
          <X size={40} className="text-gray-500" />
        </div>
      </div>
    </div>
  );
}
