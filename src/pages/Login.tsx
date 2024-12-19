import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { SiSolana } from 'react-icons/si';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { MINIMUM_PASSWORD_LEN } from './CreateWallet';
import { invoke } from '../tauri-types';
import { toast } from 'sonner';
import { useStore } from '../state';

export default function Login() {
  const navigate = useNavigate();
  const setUserInfo = useStore((store) => store.setUserInfo);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < MINIMUM_PASSWORD_LEN) return;
    const userInfo = await invoke('unlock_wallet', { password });
    if (!userInfo) {
      toast.error('Could not log into the wallet. Please check your password!');
      return;
    }

    setUserInfo(userInfo);
    navigate('/dashboard');
  };

  return (
    <main className="min-h-screen bg-[#0F1113] text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-green-500/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <SiSolana className="text-[#00FFA3] text-2xl" />
              <span className="font-bold">Solana Wallet</span>
            </Link>
          </div>
        </header>

        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF]">
            Log into your Wallet
          </h1>

          <form onSubmit={handleImport} className="space-y-6">
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
                  className="absolute right-4 top-[15px] text-gray-400 hover:text-white">
                  {showPassword ? <FiEye size={20} /> : <FiEyeOff size={20} />}
                </button>
              </div>
            </div>

            <button
              disabled={password.length < MINIMUM_PASSWORD_LEN}
              type="submit"
              className={`w-full py-4 rounded-xl font-bold text-lg ${
                password.length >= MINIMUM_PASSWORD_LEN
                  ? 'bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}>
              Log in
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
