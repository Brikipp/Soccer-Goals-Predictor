import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import * as db from '../lib/database';

interface SettingsPanelProps {
  userId: string;
  onClose: () => void;
}

export function SettingsPanel({ userId, onClose }: SettingsPanelProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkApiKey();
  }, [userId]);

  async function checkApiKey() {
    try {
      const hasKey = await db.getApiKeyExists(userId);
      setMessage(hasKey ? 'API key is configured' : '');
    } catch (err) {
      console.error('Error checking API key:', err);
    }
  }

  async function handleSave() {
    if (!apiKey.trim()) {
      setError('Please enter an API key');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await db.saveApiKey(userId, apiKey);
      setMessage('API key saved successfully');
      setApiKey('');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save API key');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">API Settings</h3>
      <p className="text-sm text-gray-600 mb-3">
        Get your free API key from{' '}
        <a
          href="https://www.api-football.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline font-medium"
        >
          api-football.com
        </a>
        {' '}(100 requests/day free)
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter your API key"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
        />
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg text-sm">
          {message}
        </div>
      )}
    </div>
  );
}
