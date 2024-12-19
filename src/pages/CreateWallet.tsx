import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useStore } from '../state';
import { invoke } from '../tauri-types';
import { SiSolana } from 'react-icons/si';
import { FiCopy, FiEye, FiEyeOff, FiSave, FiArrowLeft } from 'react-icons/fi';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { PacmanLoader } from 'react-spinners';
import { toast } from 'sonner';

export default function CreateWallet() {
  const navigate = useNavigate();
  const setUserInfo = useStore((store) => store.setUserInfo);
  const [words, setWords] = useState<null | string[]>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const next = useCallback(async () => {
    if (!words || password.length < MINIMUM_PASSWORD_LEN) return;
    const userInfo = await invoke('generate_wallet', { words, password });
    if (!userInfo) {
      toast.error('There was an error generating the wallet!');
      return;
    }
    setUserInfo(userInfo);
    navigate('/dashboard');
  }, [words, password]);

  useEffect(() => {
    (async () => {
      setWords(await invoke('generate_words', undefined));
    })();
  }, []);

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

        {words === null ? (
          <div className="flex justify-center py-4">
            <PacmanLoader color="#00FFA3" size={20} />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF]">
              Create New Wallet
            </h1>

            <div className="bg-white/5 rounded-xl p-6 mb-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Your Seed Phrase</h2>
              </div>
              <div className="relative">
                <div
                  className={`bg-white/5 p-4 rounded-lg font-mono text-lg mb-4 ${
                    !showMnemonic ? 'blur-sm select-none' : ''
                  }`}>
                  <div className="grid grid-cols-4 w-full gap-4">
                    {words.map((word, i) => (
                      <Word key={`${word}-${i}`} index={i} word={word} />
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className="absolute right-4 top-3 text-gray-400 hover:text-white">
                  {showMnemonic ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => writeText(words.join(' '))}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <FiCopy /> Copy
                </button>
                <button
                  onClick={async () => {
                    const path = await save({
                      filters: [
                        { name: 'Mnemonic words', extensions: ['txt'] },
                      ],
                    });
                    if (path) {
                      writeTextFile(path, words.join('\n'));
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                  <FiSave /> Save
                </button>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 mb-8">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-white/5 text-[#00FFA3] focus:ring-[#00FFA3]"
                />
                <span className="text-sm text-gray-300">
                  I have saved my seed phrase in a secure location
                </span>
              </label>
            </div>

            <div className="space-y-2 mb-8">
              <label className="block text-sm font-medium text-gray-300">
                Wallet Password (Minimum {MINIMUM_PASSWORD_LEN} characters)
              </label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  minLength={6}
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
              disabled={!confirmed || password.length < MINIMUM_PASSWORD_LEN}
              className={`w-full py-4 rounded-xl font-bold text-lg ${
                confirmed && password.length >= MINIMUM_PASSWORD_LEN
                  ? 'bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
              onClick={() => next()}>
              Continue to Wallet
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export const MINIMUM_PASSWORD_LEN = 8;

function Word({ index, word }: { index: number; word: string }) {
  return (
    <span className="text-lg border-b py-2 text-center">
      <span className="select-none">{index + 1}. </span>
      {word}
    </span>
  );
}
