import React from 'react';
import { UserPlus, ArrowRight } from 'lucide-react';

interface WelcomeSetupProps {
  onCreateAccount: () => void;
}

export const WelcomeSetup: React.FC<WelcomeSetupProps> = ({ onCreateAccount }) => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-md">
        
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white rounded-xl flex items-center justify-center font-black text-2xl mx-auto mb-4 shadow-lg">
            SA
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Sufiyan Autos ERP
          </h1>
          <p className="text-slate-400 text-sm">
            Electric Bike Inventory Management
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl mb-6">
          
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-white mb-3">
              Welcome! 👋
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              No account exists yet. Create your administrator account to get started with inventory and sales management.
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
            <p className="text-blue-200 text-sm">
              <strong className="text-blue-100">Note:</strong> This system supports one administrator account only for security and clear ownership.
            </p>
          </div>

          {/* CTA Button */}
          <button
            onClick={onCreateAccount}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold px-6 py-3 rounded-xl text-sm shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create Administrator Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-slate-500 text-xs text-center mt-4">
            Takes less than 30 seconds
          </p>
        </div>

        {/* Footer */}
        <p className="text-slate-500 text-xs text-center">
          Powered by Firebase • Secure & Cloud-Based
        </p>

      </div>
    </div>
  );
};
