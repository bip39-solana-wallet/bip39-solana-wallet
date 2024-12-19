import { FormEvent, useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { SiSolana } from 'react-icons/si';
import { FiEye, FiEyeOff, FiArrowLeft } from 'react-icons/fi';
import { MINIMUM_PASSWORD_LEN } from './CreateWallet';
import { invoke } from '../tauri-types';
import { toast } from 'sonner';
import { useStore } from '../state';

export default function ImportWallet() {
  const navigate = useNavigate();
  const [seedPhrase, setSeedPhrase] = useState('');
  const [showPhrase, setShowPhrase] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const setUserInfo = useStore((store) => store.setUserInfo);

  const next = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!seedPhrase || password.length < MINIMUM_PASSWORD_LEN) return;
      let words = seedPhrase.split(' ');
      if (words.length !== 12 && words.length !== 24) {
        toast.error(
          `Please provide either a 12 or 24 word seed phrase, current one has ${words.length} words!`
        );
        return;
      }
      const userInfo = await invoke('generate_wallet', { words, password });
      if (!userInfo) {
        toast.error('There was an error generating the wallet!');
        return;
      }
      setUserInfo(userInfo);
      navigate('/dashboard');
    },
    [seedPhrase, password]
  );

  return (
    <main className="min-h-screen bg-[#0F1113] text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-green-500/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <FiArrowLeft size={20} />
              <span>Back</span>
            </button>
            <div className="w-px h-6 bg-gray-700" /> {/* Divider */}
            <Link to="/" className="flex items-center gap-2">
              <SiSolana className="text-[#00FFA3] text-2xl" />
              <span className="font-bold">Solana Wallet</span>
            </Link>
          </div>
        </header>

        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF]">
            Import Wallet
          </h1>

          <form onSubmit={next} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Seed Phrase
              </label>
              <div className="relative">
                <textarea
                  value={seedPhrase}
                  onChange={(e) => setSeedPhrase(e.target.value)}
                  placeholder="Enter your 12 or 24-word seed phrase"
                  className={`w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent ${
                    showPhrase ? '' : 'blur-sm'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPhrase(!showPhrase)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white">
                  {showPhrase ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Wallet Password (Minimum {MINIMUM_PASSWORD_LEN} characters)
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-white">
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90">
              Import Wallet
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
