import { useCallback, useMemo, useState } from 'react';
import { SiSolana } from 'react-icons/si';
import { FiSend, FiPlus, FiCopy, FiRefreshCw, FiX } from 'react-icons/fi';
import { useStore } from '../state';
import { useNavigate } from 'react-router';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { invoke } from '../tauri-types';
import { toast } from 'sonner';
import { PacmanLoader } from 'react-spinners';

interface Token {
  symbol: string;
  name: string;
  balance: string;
  icon: string;
  address: string;
}

interface Transfer {
  recipient: string;
  amount: string;
}

interface BulkTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (addresses: string[], amount: string) => void;
  selectedToken: Token | null;
}

function BulkTransferModal({
  isOpen,
  onClose,
  onSubmit,
  selectedToken,
}: BulkTransferModalProps) {
  const [addresses, setAddresses] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = () => {
    const addressList = addresses
      .split('\n')
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0);
    onSubmit(addressList, amount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1113] rounded-2xl p-6 max-w-2xl w-full border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">
            Bulk Transfer {selectedToken?.symbol}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Recipient Addresses (one per line)
            </label>
            <textarea
              value={addresses}
              onChange={(e) => setAddresses(e.target.value)}
              placeholder="Enter addresses here&#10;0x1234...&#10;0x5678...&#10;0x90ab..."
              className="w-full h-48 bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount per address
            </label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90 flex items-center justify-center gap-2">
            <FiSend />
            Send to{' '}
            {
              addresses.split('\n').filter((addr) => addr.trim().length > 0)
                .length
            }{' '}
            Recipients
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportTokenModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [tokenAddress, setTokenAddress] = useState('');

  const handleImport = () => {
    // Implement token import logic here
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0F1113] rounded-2xl p-6 max-w-lg w-full border border-white/10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold">Import Token</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <FiX size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Token Contract Address
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="Enter token address"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent font-mono"
            />
          </div>

          <button
            onClick={handleImport}
            className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90">
            Import Token
          </button>
        </div>
      </div>
    </div>
  );
}

export default function WalletDashboard() {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [isBulkTransfer, _setIsBulkTransfer] = useState(false);
  const [transfers, setTransfers] = useState<Transfer[]>([
    { recipient: '', amount: '' },
  ]);
  const userInfo = useStore((store) => store.user);
  const setUserInfo = useStore((store) => store.setUserInfo);
  const [singleRecipient, setSingleRecipient] = useState('');
  const [singleAmount, setSingleAmount] = useState('');
  const [showBulkTransfer, setShowBulkTransfer] = useState(false);
  const [showImportToken, setShowImportToken] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const navigate = useNavigate();
  const refresh = useCallback(async () => {
    const userInfo = await invoke('refresh_user', undefined);
    if (!userInfo) return;
    setUserInfo(userInfo);
  }, []);

  const shortAddress = useMemo(() => {
    if (typeof userInfo !== 'object') return '';
    return shortenAddress(userInfo.Unlocked.public_key);
  }, [userInfo]);
  const isValidAmount = useMemo(() => {
    const chars = singleAmount.split('');
    let periodCount = 0;
    for (const char of chars) {
      if (char === '.') {
        periodCount++;
        if (periodCount > 1) return false;
        continue;
      }
      if (!DIGITS.includes(char)) {
        return false;
      }
    }
    return true;
  }, [singleAmount]);

  const send = useCallback(async () => {
    if (!isValidAmount || !singleRecipient) return;
    if (inProgress) return;
    setInProgress(true);
    try {
      const userInfo = await invoke('send_sol', {
        address: singleRecipient,
        amount: parseFloat(singleAmount),
      });
      if (!userInfo) {
        toast.error(
          "Couldn't send tokens! Please check the recipient address and amount!"
        );
        return;
      }
      setUserInfo(userInfo);
      toast.success(
        `Successfully sent ${singleAmount} SOL to ${shortenAddress(
          singleRecipient
        )}!`
      );
    } catch (e) {
      console.error('Error:', e);
    } finally {
      setInProgress(false);
    }
  }, [singleRecipient, singleAmount]);

  if (typeof userInfo !== 'object') {
    navigate('/', { replace: true });
    return null;
  }

  const tokens: Token[] = [
    {
      symbol: 'SOL',
      name: 'Solana',
      balance: `${userInfo.Unlocked.balance_readable}`,
      icon: '◎',
      address: '',
    },
  ];

  const addTransferRow = () => {
    setTransfers([...transfers, { recipient: '', amount: '' }]);
  };

  const updateTransfer = (
    index: number,
    field: keyof Transfer,
    value: string
  ) => {
    const newTransfers = [...transfers];
    newTransfers[index] = { ...newTransfers[index], [field]: value };
    setTransfers(newTransfers);
  };

  const handleBulkTransfer = (addresses: string[], amount: string) => {
    console.log('Bulk transfer:', { addresses, amount, token: selectedToken });
    // Implement bulk transfer logic here
  };

  return (
    <main className="min-h-screen bg-[#0F1113] text-white">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-green-500/5 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <SiSolana className="text-[#00FFA3] text-2xl" />
            <span className="font-bold">Solana Wallet</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="text-gray-400 hover:text-white transition-colors"
              onClick={() => void refresh()}>
              <FiRefreshCw size={20} />
            </button>
            <div className="bg-white/5 px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="text-sm text-gray-400">Your wallet</span>
              <code className="text-sm">{shortAddress}</code>
              <button
                onClick={() => writeText(userInfo.Unlocked.public_key)}
                className="text-gray-400 hover:text-white transition-colors">
                <FiCopy size={16} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Token List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Your Tokens</h2>
            </div>
            <div className="space-y-2">
              {tokens.map((token) => (
                <button
                  key={token.symbol}
                  onClick={() => setSelectedToken(token)}
                  className={`w-full p-4 rounded-xl flex items-center justify-between ${
                    selectedToken?.symbol === token.symbol
                      ? 'bg-gradient-to-r from-[#00FFA3]/20 to-[#DC1FFF]/20 border border-[#00FFA3]/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{token.icon}</span>
                    <div className="text-left">
                      <div className="font-bold">{token.symbol}</div>
                      <div className="text-sm text-gray-400">{token.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{token.balance}</div>
                    <div className="text-sm text-gray-400">{token.symbol}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Transfer Form */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">
                  {selectedToken
                    ? `Send ${selectedToken.symbol}`
                    : 'Please select a token'}
                </h2>
                {/* <button
                  onClick={() => setShowBulkTransfer(true)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isBulkTransfer
                      ? 'bg-[#00FFA3]/20 text-[#00FFA3]'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}>
                  Bulk Transfer
                </button> */}
              </div>

              {isBulkTransfer ? (
                // Bulk Transfer Form
                <div className="space-y-4">
                  {transfers.map((transfer, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={transfer.recipient}
                        onChange={(e) =>
                          updateTransfer(index, 'recipient', e.target.value)
                        }
                        placeholder="Recipient address"
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent"
                      />
                      <input
                        type="text"
                        value={transfer.amount}
                        onChange={(e) =>
                          updateTransfer(index, 'amount', e.target.value)
                        }
                        placeholder="Amount"
                        className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent"
                      />
                    </div>
                  ))}
                  <button
                    onClick={addTransferRow}
                    className="flex items-center gap-2 text-[#00FFA3] hover:text-[#00FFA3]/80 transition-colors">
                    <FiPlus /> Add Recipient
                  </button>
                </div>
              ) : (
                // Single Transfer Form
                <div className="space-y-4">
                  <input
                    type="text"
                    value={singleRecipient}
                    onChange={(e) => setSingleRecipient(e.target.value)}
                    placeholder="Recipient address"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={singleAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSingleAmount(value);
                    }}
                    placeholder="Amount"
                    className={`w-full bg-white/5 border ${
                      isValidAmount
                        ? 'border-white/10 focus:ring-2 focus:ring-[#00FFA3] focus:border-transparent'
                        : 'border-red-400'
                    } rounded-lg px-4 py-3 focus:outline-none`}
                  />
                </div>
              )}

              <button
                onClick={send}
                disabled={
                  !selectedToken ||
                  !singleRecipient ||
                  !isValidAmount ||
                  singleAmount === ''
                }
                className={`mt-6 w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${
                  selectedToken &&
                  singleRecipient &&
                  isValidAmount &&
                  singleAmount
                    ? 'bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] hover:opacity-90'
                    : 'bg-gray-600 cursor-not-allowed'
                } ${inProgress ? 'cursor-not-allowed' : ''}`}>
                <FiSend />
                Send{inProgress ? 'ing' : ''}{' '}
                {isBulkTransfer ? 'to Multiple Recipients' : 'Tokens'}
                {inProgress ? (
                  <PacmanLoader color="#00FFA3" size={10} className="mr-4" />
                ) : null}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BulkTransferModal
        isOpen={showBulkTransfer}
        onClose={() => setShowBulkTransfer(false)}
        onSubmit={handleBulkTransfer}
        selectedToken={selectedToken}
      />

      <ImportTokenModal
        isOpen={showImportToken}
        onClose={() => setShowImportToken(false)}
      />
    </main>
  );
}

function shortenAddress(address: string): string {
  return `${address.substring(0, 4)}...${address.slice(-4)}`;
}

const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
