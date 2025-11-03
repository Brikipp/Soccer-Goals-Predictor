import React from 'react';
import { TrendingUp, Settings, LogOut } from 'lucide-react';

interface HeaderProps {
  onSettingsClick: () => void;
  onSignOut: () => void;
}

export function Header({ onSettingsClick, onSignOut }: HeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={32} />
            Soccer Goals Predictor
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time data from API-Football with adaptive learning
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSettingsClick}
            className="bg-gray-200 text-gray-700 p-3 rounded-lg hover:bg-gray-300 transition"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={onSignOut}
            className="bg-red-100 text-red-600 p-3 rounded-lg hover:bg-red-200 transition"
            title="Sign out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
