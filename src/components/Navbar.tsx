export default function Navbar() {
  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800 p-4 flex justify-between items-center shadow-lg">
      <div className="text-green-500 font-bold text-xl tracking-wider">
        DontFearThem
      </div>
      <ul className="flex gap-6 text-gray-300 font-medium">
        <li className="hover:text-white cursor-pointer transition">Home</li>
        <li className="hover:text-white cursor-pointer transition">About</li>
        <li className="hover:text-white cursor-pointer transition">Settings</li>
      </ul>
    </nav>
  );
}

