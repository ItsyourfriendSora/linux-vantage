export default function HeaderBanner() {
  return (
    <div className="w-full h-24 bg-gradient-to-r from-[#44b5a1] via-[#2ba5d2] to-[#1e588c] flex items-center px-8 relative overflow-hidden">
      {/* Abstract background shapes */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
        <div className="absolute right-10 top-[-20px] w-40 h-40 bg-white rotate-45 transform origin-center"></div>
        <div className="absolute right-40 top-[20px] w-32 h-32 bg-blue-900 rotate-12 transform origin-center"></div>
      </div>
    </div>
  );
}

