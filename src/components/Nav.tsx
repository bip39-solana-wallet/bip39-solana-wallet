import { SiSolana } from 'react-icons/si';

export default function Nav() {
  return (
    <header className="p-6 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <SiSolana className="text-[#00FFA3] text-2xl" />
        <span className="font-bold">Solana Wallet</span>
      </div>
      <nav className="hidden md:flex gap-6 text-gray-400">
        <a href="#" className="hover:text-white transition-colors">
          Features
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Security
        </a>
        <a href="#" className="hover:text-white transition-colors">
          Support
        </a>
      </nav>
    </header>
  );
}
