import React, { useState } from 'react';
import { Lock, Unlock, Copy, RefreshCw } from 'lucide-react';
import { caesarCipher } from '../utils/cipher';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { clsx } from 'clsx';

const Home: React.FC = () => {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [shift, setShift] = useState(3);
  const [output, setOutput] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(true);

  const handleProcess = async () => {
    if (!input) return;
    
    const result = caesarCipher(input, shift, !isEncrypting);
    setOutput(result);
    
    if (user) {
      // Save history to Firestore if user is logged in
      try {
        await addDoc(collection(db, 'cipher_history'), {
          userId: user.uid,
          inputText: input,
          outputText: result,
          shiftKey: shift,
          action: isEncrypting ? 'encrypt' : 'decrypt',
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error('Failed to save history:', error);
      }
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-4 pt-10">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          Secure Text <span className="text-primary">Encryption</span> Made Simple
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          Learn and use Caesar Cipher encryption securely. Transform your messages with a simple shift key.
        </p>
      </div>

      {/* Encryption Tool */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Input Section */}
          <div className="flex-1 space-y-4">
            <label className="block text-sm font-medium text-slate-300">
              Input Text
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter message here..."
              className="w-full h-48 bg-slate-900 border border-slate-700 rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
            />
          </div>

          {/* Controls Section */}
          <div className="flex flex-col justify-center items-center gap-6 w-full md:w-48">
             <div className="w-full space-y-2">
              <label className="block text-sm font-medium text-slate-300 text-center">
                Shift Offset (1-25)
              </label>
              <input
                type="number"
                min="1"
                max="25"
                value={shift}
                onChange={(e) => setShift(Math.max(1, Math.min(25, parseInt(e.target.value) || 0)))}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 px-3 text-center text-white focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setIsEncrypting(!isEncrypting)}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Switch Mode
            </button>

            <button
              onClick={handleProcess}
              disabled={!input}
              className={clsx(
                "w-full py-3 px-4 rounded-lg font-bold text-white shadow-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2",
                isEncrypting 
                  ? "bg-primary hover:bg-blue-600 shadow-blue-500/20" 
                  : "bg-secondary hover:bg-violet-600 shadow-violet-500/20",
                !input && "opacity-50 cursor-not-allowed transform-none"
              )}
            >
              {isEncrypting ? (
                <>
                  <Lock className="h-5 w-5" /> Encrypt
                </>
              ) : (
                <>
                  <Unlock className="h-5 w-5" /> Decrypt
                </>
              )}
            </button>
          </div>

          {/* Output Section */}
          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center">
              <label className="block text-sm font-medium text-slate-300">
                Output
              </label>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="flex items-center gap-1 text-xs text-primary hover:text-blue-400 transition-colors"
                >
                  <Copy className="h-3 w-3" /> Copy Result
                </button>
              )}
            </div>
            <div className="relative">
              <textarea
                readOnly
                value={output}
                placeholder="Result will appear here..."
                className="w-full h-48 bg-slate-950 border border-slate-800 rounded-lg p-4 text-primary font-mono placeholder-slate-600 focus:ring-2 focus:ring-secondary focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
