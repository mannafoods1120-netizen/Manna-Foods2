import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ShieldCheck, 
  Gift, 
  Lock, 
  Save, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Eye, 
  Edit3, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LegalPolicies } from '../../types/index.ts';
import { api } from '../../services/api.ts';
import { 
  DEFAULT_LONG_TERM_TERMS, 
  DEFAULT_PRIVACY_POLICY, 
  DEFAULT_GENERAL_TERMS 
} from '../../data/legalDefaults.ts';

interface LegalTermsModuleProps {
  onOpenStorefrontPolicyPreview?: (docType: 'long_term' | 'general' | 'privacy') => void;
}

export const LegalTermsModule: React.FC<LegalTermsModuleProps> = ({
  onOpenStorefrontPolicyPreview
}) => {
  const [activeTab, setActiveTab] = useState<'long_term' | 'privacy' | 'general'>('long_term');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  // Form states
  const [longTermTerms, setLongTermTerms] = useState(DEFAULT_LONG_TERM_TERMS);
  const [privacyPolicy, setPrivacyPolicy] = useState(DEFAULT_PRIVACY_POLICY);
  const [generalTerms, setGeneralTerms] = useState(DEFAULT_GENERAL_TERMS);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null);

  // Load from backend on mount
  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      setLoading(true);
      const data = await api.getLegalPolicies();
      if (data) {
        if (data.longTermTerms) setLongTermTerms(data.longTermTerms);
        if (data.privacyPolicy) setPrivacyPolicy(data.privacyPolicy);
        if (data.generalTerms) setGeneralTerms(data.generalTerms);
        if (data.updatedAt) setLastUpdatedAt(data.updatedAt);
        if (data.updatedBy) setLastUpdatedBy(data.updatedBy);
      }
    } catch (err: any) {
      console.warn('Failed to load legal policies from server, using defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const payload: Partial<LegalPolicies> = {
        longTermTerms,
        privacyPolicy,
        generalTerms
      };

      const res = await api.updateLegalPolicies(payload);
      setSuccessMsg(res.message || 'Legal policies & terms updated successfully.');
      if (res.policies?.updatedAt) {
        setLastUpdatedAt(res.policies.updatedAt);
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update legal policies.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetCurrent = () => {
    if (!showConfirmReset) {
      setShowConfirmReset(true);
      setTimeout(() => setShowConfirmReset(false), 4000);
      return;
    }
    if (activeTab === 'long_term') setLongTermTerms(DEFAULT_LONG_TERM_TERMS);
    if (activeTab === 'privacy') setPrivacyPolicy(DEFAULT_PRIVACY_POLICY);
    if (activeTab === 'general') setGeneralTerms(DEFAULT_GENERAL_TERMS);
    setShowConfirmReset(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>Legal &amp; Compliance Configuration</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Terms &amp; Conditions and Privacy Policy Editor
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 mt-1.5 leading-relaxed">
            Manage the contractual terms displayed in the Long-Term Cashback subscription popup, the customer agreement checkbox, and the global website footer.
          </p>
          {lastUpdatedAt && (
            <div className="mt-3 text-[11px] text-amber-200/80 font-mono">
              Last saved: {new Date(lastUpdatedAt).toLocaleString()} {lastUpdatedBy ? `by ${lastUpdatedBy}` : ''}
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded">
            Live on Storefront
          </span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        {/* Document Selection Tabs & Actions */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('long_term')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'long_term'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>Long-Term Cashback T&amp;C</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('privacy')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'privacy'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('general')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'general'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>General Terms &amp; Conditions</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {previewMode ? <Edit3 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetCurrent}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                showConfirmReset
                  ? 'bg-rose-600 text-white border-rose-700 animate-pulse'
                  : 'border-stone-300 bg-white hover:bg-stone-50 text-stone-600'
              }`}
              title={showConfirmReset ? 'Click again to confirm reset' : 'Reset to default text'}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {showConfirmReset ? 'Confirm Reset?' : 'Reset Default'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Tab Context Info Banner */}
        <div className="px-5 py-3 bg-stone-50/50 border-b border-stone-100 flex items-center justify-between text-xs text-stone-600">
          <div>
            {activeTab === 'long_term' && (
              <span>
                <strong>Linked location:</strong> Customer Subscription popup modal checkbox &amp; link, plus the Long-Term Cashback storefront reference.
              </span>
            )}
            {activeTab === 'privacy' && (
              <span>
                <strong>Linked location:</strong> Global website footer "Privacy Policy" button and legal modal.
              </span>
            )}
            {activeTab === 'general' && (
              <span>
                <strong>Linked location:</strong> Global website footer "Terms &amp; Conditions" button and legal modal.
              </span>
            )}
          </div>
          {onOpenStorefrontPolicyPreview && (
            <button
              type="button"
              onClick={() => onOpenStorefrontPolicyPreview(activeTab)}
              className="text-amber-700 hover:text-amber-900 font-semibold underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Test Storefront Modal</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Editor / Preview Area */}
        <div className="p-5">
          {previewMode ? (
            <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 text-xs sm:text-sm text-stone-800 leading-relaxed font-sans whitespace-pre-line max-h-[600px] overflow-y-auto">
              {activeTab === 'long_term' && longTermTerms}
              {activeTab === 'privacy' && privacyPolicy}
              {activeTab === 'general' && generalTerms}
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700">
                {activeTab === 'long_term' && 'Long-Term Cashback Offer Terms & Conditions Content:'}
                {activeTab === 'privacy' && 'Privacy Policy Content:'}
                {activeTab === 'general' && 'General Terms & Conditions Content:'}
              </label>

              {activeTab === 'long_term' && (
                <textarea
                  rows={20}
                  value={longTermTerms}
                  onChange={(e) => setLongTermTerms(e.target.value)}
                  className="w-full p-4 rounded-xl border border-stone-300 font-sans text-xs sm:text-sm leading-relaxed text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter Long-Term Cashback Terms & Conditions..."
                />
              )}

              {activeTab === 'privacy' && (
                <textarea
                  rows={20}
                  value={privacyPolicy}
                  onChange={(e) => setPrivacyPolicy(e.target.value)}
                  className="w-full p-4 rounded-xl border border-stone-300 font-sans text-xs sm:text-sm leading-relaxed text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter Privacy Policy content..."
                />
              )}

              {activeTab === 'general' && (
                <textarea
                  rows={20}
                  value={generalTerms}
                  onChange={(e) => setGeneralTerms(e.target.value)}
                  className="w-full p-4 rounded-xl border border-stone-300 font-sans text-xs sm:text-sm leading-relaxed text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  placeholder="Enter General Terms & Conditions..."
                />
              )}

              <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                <span>
                  Character count:{' '}
                  <strong className="font-mono text-stone-800">
                    {activeTab === 'long_term' ? longTermTerms.length : activeTab === 'privacy' ? privacyPolicy.length : generalTerms.length}
                  </strong>
                </span>
                <span className="text-[11px] text-stone-400">
                  Plain text formatted with clear sections, line breaks, and bullets.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer save bar */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Changes take effect immediately across all customer sessions and modal views.
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save & Publish Terms'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
