import { PropsWithChildren, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { invoke } from '../tauri-types';
import { PacmanLoader } from 'react-spinners';
import { useStore } from '../state';
import {
  FiArrowRight,
  FiGlobe,
  FiLock,
  FiShield,
  FiSmile,
  FiZap,
} from 'react-icons/fi';
import { SiSolana } from 'react-icons/si';

export default function Landing() {
  const navigate = useNavigate();
  const setUserInfo = useStore((store) => store.setUserInfo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const userInfo = await invoke('get_user_info', undefined);
      setUserInfo(userInfo);
      setLoading(false);
      if (typeof userInfo === 'object') {
        return navigate('/dashboard');
      } else if (userInfo === 'Locked') {
        return navigate('/login');
      }
    })();
  }, []);

  return (
    <main className="container min-h-screen min-w-full bg-[#0F1113] text-white">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-green-500/5 pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
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

        {/* Hero Section */}
        <div className="flex-1 flex justify-center items-center px-6 mb-8">
          <div className="max-w-md w-full space-y-12">
            {/* Hero Content */}
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] blur-xl opacity-20 rounded-full" />
                <SiSolana className="relative text-[#00FFA3] text-6xl" />
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF]">
                  Next-Gen Wallet
                </h1>
                <p className="text-gray-400 text-lg max-w-sm mx-auto">
                  Experience the future of crypto with our secure, fast, and
                  intuitive Solana wallet
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              {loading ? (
                <div className="flex justify-center py-4">
                  <PacmanLoader color="#00FFA3" size={20} />
                </div>
              ) : (
                <>
                  <Button
                    classname="bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 text-white font-bold group"
                    to="/create">
                    <span>Create a new wallet</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </Button>
                  <Button
                    classname="bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 group"
                    to="/import">
                    <FiLock className="text-[#00FFA3]" />
                    <span>I already have a wallet</span>
                  </Button>
                </>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4 pt-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <feature.icon className="text-[#00FFA3] text-xl mb-2" />
                  <h3 className="font-semibold mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

const features = [
  {
    icon: FiShield,
    title: 'Secure Storage',
    description: 'Your keys, your crypto. Always secure and encrypted.',
  },
  {
    icon: FiZap,
    title: 'Fast Transactions',
    description: 'Lightning-fast transactions on Solana network.',
  },
  {
    icon: FiGlobe,
    title: 'Cross Platform',
    description: 'Access your wallet from any device, anywhere.',
  },
  {
    icon: FiSmile,
    title: 'User Friendly',
    description: 'Intuitive interface for both beginners and pros.',
  },
];

function Button({
  children,
  classname,
  to,
}: PropsWithChildren<{ classname: string; to: string }>) {
  return (
    <Link
      to={to}
      className={`px-6 py-4 text-lg rounded-xl w-full transition-all duration-200 flex items-center justify-center gap-2 ${classname}`}>
      {children}
    </Link>
  );
}
