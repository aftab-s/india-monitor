import { Globe } from 'lucide-react';

export default function Footer() {
  return (
    <>
      <div className="w-full h-[1px] opacity-30" 
        style={{ background: 'linear-gradient(to right, transparent, rgba(255,0,51,0.5) 20%, rgba(255,0,51,0.5) 80%, transparent)' }} 
      />
      <footer className="w-full py-10 px-6 md:px-12 bg-black flex flex-col items-center text-center gap-4 z-50">
        <div className="flex flex-col items-center gap-2">
          <div className="text-[14px] text-gray-200 font-medium tracking-[0.4em] uppercase opacity-80">
            भारत <span className="text-gray-600 mx-2">·</span> सत्यमेव जयते
          </div>
          <div className="text-[10px] text-gray-400 font-mono tracking-[0.25em] uppercase">
            Observe India — telemetry for the world's largest democracy
          </div>
        </div>

        <div className="w-12 h-[1px] bg-dark-500 my-2 opacity-50" />

        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-[8px] text-gray-600 font-mono tracking-[0.3em] uppercase">
          <div className="flex items-center gap-2">
            <span className="w-1 h-1 bg-accent rounded-full animate-pulse" />
            <span>Unity in Diversity</span>
          </div>
          <div className="hidden md:block text-dark-600">|</div>
          <span>Digital Sovereignty</span>
          <div className="hidden md:block text-dark-600">|</div>
          <span>© 2026 Observe India</span>
        </div>
      </footer>
    </>
  );
}
