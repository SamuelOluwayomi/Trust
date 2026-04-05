"use client";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { Gear, UserCircle, Bell, Eye, EyeSlash, SignOut } from "@phosphor-icons/react";
import { useState } from "react";

export default function SettingsPage() {
  const { user, logout } = usePrivy();
  const { wallets } = useWallets();
  const [privacyMode, setPrivacyMode] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Account Settings</h1>
          <p className="text-slate-500 text-sm">Manage your profile and privacy preferences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Account Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Linked Wallet */}
          <div className="bg-[#050914] border border-white/5 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3">
              <UserCircle className="w-6 h-6 text-emerald-400" weight="fill" />
              <h2 className="text-lg font-black text-white uppercase tracking-widest">User Profile</h2>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Email Address</span>
                 <span className="text-white font-bold">{user?.email?.address || user?.google?.email || "Not linked"}</span>
              </div>
              <div className="flex flex-col gap-1">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Connected Wallet</span>
                 <span className="text-white font-mono text-sm">{wallets[0]?.address || "No wallet connected"}</span>
              </div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-[#050914] border border-white/5 rounded-3xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {privacyMode ? <EyeSlash className="w-6 h-6 text-blue-400" /> : <Eye className="w-6 h-6 text-emerald-400" />}
                <h2 className="text-lg font-black text-white uppercase tracking-widest">Privacy Preference</h2>
              </div>
              <button 
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`w-12 h-6 rounded-full p-1 transition-colors ${privacyMode ? "bg-blue-500" : "bg-emerald-500"}`}
              >
                 <div className={`w-4 h-4 bg-white rounded-full transition-transform ${privacyMode ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
            <p className="text-slate-500 text-sm">
               Privacy Mode hides your transaction details from public discovery in-app. Your World ID nullifier remains anonymous in both modes.
            </p>
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-6">
           <div className="bg-[#050914] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-4">
              <Bell className="w-10 h-10 text-slate-700" />
              <h3 className="text-white font-black uppercase text-sm tracking-widest">Notifications</h3>
              <p className="text-slate-500 text-[10px] lowercase">Currently managed by Telegram Bot</p>
              <button className="w-full py-3 bg-white/5 border border-white/5 rounded-xl text-xs font-black uppercase text-slate-400 cursor-not-allowed">
                SMS Alerts (Coming Soon)
              </button>
           </div>

           <button 
             onClick={() => logout()}
             className="w-full py-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
           >
              <SignOut className="w-5 h-5" />
              Sign Out Account
           </button>
        </div>
      </div>
    </div>
  );
}
