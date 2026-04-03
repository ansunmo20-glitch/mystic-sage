import { X, Settings as SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { Modal } from './Modal';

interface SettingsProps {
  userEmail: string;
  onClose: () => void;
  onSignOut: () => void;
  onExportConversations: () => void;
  onDeleteAccount: () => void;
}

export function Settings({
  userEmail,
  onClose,
  onSignOut,
  onExportConversations,
  onDeleteAccount
}: SettingsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    setShowDeleteConfirm(false);
    onDeleteAccount();
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#FAF6EF] z-50 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-[#C4A96E]" />
              <h1 className="text-2xl font-light text-[#2C2C2C]">Settings</h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[#F5EFE7] rounded-lg transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5 text-[#6B6B6B]" />
            </button>
          </div>

          <div className="space-y-8">
            <section className="bg-white rounded-lg border border-[#E8DED0] p-6 shadow-sm">
              <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[#6B6B6B] mb-1">Email Address</label>
                  <div className="px-4 py-2 bg-[#FAF6EF] rounded-lg text-[#2C2C2C] border border-[#E8DED0]">
                    {userEmail}
                  </div>
                </div>
                <button
                  onClick={onSignOut}
                  className="px-4 py-2 text-[#6B6B6B] hover:text-[#2C2C2C] hover:bg-[#F5EFE7] rounded-lg transition-colors border border-[#E8DED0]"
                >
                  Sign Out
                </button>
              </div>
            </section>

            <section className="bg-white rounded-lg border border-[#E8DED0] p-6 shadow-sm">
              <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">Data</h2>
              <div className="space-y-3">
                <button
                  onClick={onExportConversations}
                  className="w-full px-4 py-2 text-left text-[#2C2C2C] hover:bg-[#F5EFE7] rounded-lg transition-colors border border-[#E8DED0]"
                >
                  <div className="font-medium">Export Conversations</div>
                  <div className="text-sm text-[#6B6B6B] mt-1">
                    Download all your conversations as a text file
                  </div>
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="w-full px-4 py-2 text-left text-[#C97C5D] hover:bg-[#FFF5F5] rounded-lg transition-colors border border-[#F5C6C6]"
                >
                  <div className="font-medium">Delete Account</div>
                  <div className="text-sm text-[#9B6B5D] mt-1">
                    Permanently delete your account and all conversations
                  </div>
                </button>
              </div>
            </section>

            <section className="bg-white rounded-lg border border-[#E8DED0] p-6 shadow-sm">
              <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">App Info</h2>
              <div className="space-y-2 text-[#6B6B6B]">
                <div>
                  <span className="font-medium text-[#2C2C2C]">Mystic Sage</span>
                </div>
                <div className="text-sm">Version 1.0.0 (Beta)</div>
                <div className="text-sm italic">A quiet space to think out loud</div>
              </div>
            </section>

            <section className="bg-white rounded-lg border border-[#E8DED0] p-6 shadow-sm">
              <h2 className="text-lg font-medium text-[#2C2C2C] mb-4">Legal</h2>
              <div className="space-y-2">
                <a
                  href="/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#C4A96E] hover:text-[#A08954] transition-colors"
                >
                  Terms of Service
                </a>
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-[#C4A96E] hover:text-[#A08954] transition-colors"
                >
                  Privacy Policy
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <Modal onClose={() => setShowDeleteConfirm(false)}>
          <div className="p-6">
            <h2 className="text-xl font-light text-[#2C2C2C] mb-4">Delete Account?</h2>
            <p className="text-[#6B6B6B] mb-6">
              Are you sure? This will delete all your conversations and cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-[#6B6B6B] hover:bg-[#F5EFE7] rounded-lg transition-colors border border-[#E8DED0]"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="px-4 py-2 bg-[#C97C5D] text-white hover:bg-[#B56B4D] rounded-lg transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
