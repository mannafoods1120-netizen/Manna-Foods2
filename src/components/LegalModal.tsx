import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  ShieldCheck, 
  Gift, 
  Lock, 
  Printer, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { LegalPolicies } from '../types/index.ts';
import { 
  DEFAULT_LONG_TERM_TERMS, 
  DEFAULT_PRIVACY_POLICY, 
  DEFAULT_GENERAL_TERMS 
} from '../data/legalDefaults.ts';

export type LegalDocType = 'long_term' | 'general' | 'privacy';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocType;
  policies?: LegalPolicies | null;
}

export const LegalModal: React.FC<LegalModalProps> = ({
  isOpen,
  onClose,
  initialDoc = 'long_term',
  policies
}) => {
  const [activeDoc, setActiveDoc] = useState<LegalDocType>(initialDoc);
  const [copied, setCopied] = useState(false);

  // Sync activeDoc if initialDoc changes when opened
  React.useEffect(() => {
    if (isOpen && initialDoc) {
      setActiveDoc(initialDoc);
    }
  }, [isOpen, initialDoc]);

  if (!isOpen) return null;

  const longTermContent = policies?.longTermTerms || DEFAULT_LONG_TERM_TERMS;
  const generalContent = policies?.generalTerms || DEFAULT_GENERAL_TERMS;
  const privacyContent = policies?.privacyPolicy || DEFAULT_PRIVACY_POLICY;

  const getCurrentText = () => {
    switch (activeDoc) {
      case 'long_term':
        return longTermContent;
      case 'general':
        return generalContent;
      case 'privacy':
        return privacyContent;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCurrentText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              activeDoc === 'long_term' 
                ? 'bg-amber-100 text-amber-800' 
                : activeDoc === 'privacy' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'bg-stone-200 text-stone-800'
            }`}>
              {activeDoc === 'long_term' && <Gift className="w-5 h-5" />}
              {activeDoc === 'privacy' && <Lock className="w-5 h-5" />}
              {activeDoc === 'general' && <FileText className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded border border-amber-200/80">
                Official Legal Document
              </span>
              <h2 className="font-display font-bold text-lg text-stone-900 mt-0.5">
                {activeDoc === 'long_term' && 'Terms & Conditions: Long-Term Cashback Offer'}
                {activeDoc === 'general' && 'Terms & Conditions (Services & Platform)'}
                {activeDoc === 'privacy' && 'Privacy Policy'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-white border border-transparent hover:border-stone-200 transition-colors"
              title="Copy text"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-white border border-transparent hover:border-stone-200 transition-colors"
              title="Print document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigator */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 bg-white border-b border-stone-100 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveDoc('long_term')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeDoc === 'long_term'
                ? 'border-amber-600 text-amber-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            <span>Long-Term Cashback Offer T&amp;C</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDoc('privacy')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeDoc === 'privacy'
                ? 'border-emerald-600 text-emerald-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Privacy Policy</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveDoc('general')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeDoc === 'general'
                ? 'border-stone-800 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>General Terms &amp; Conditions</span>
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed font-sans select-text">
          {activeDoc === 'long_term' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 text-xs">
                <p className="font-semibold">
                  Important notice for long-term meal subscribers:
                </p>
                <p className="text-[11px] text-amber-900 mt-1">
                  These terms govern your subscription to the 90, 180, 270, and 360-meal cashback packages. By subscribing, you agree to these operational rules, pause parameters, and early exit calculations.
                </p>
              </div>

              <div className="whitespace-pre-line text-stone-800 font-sans leading-relaxed">
                {longTermContent}
              </div>
            </div>
          )}

          {activeDoc === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                <span className="text-[11px] text-emerald-900">
                  Manna Foods respects your data privacy. We do not sell or monetize personal information.
                </span>
              </div>

              <div className="whitespace-pre-line text-stone-800 font-sans leading-relaxed">
                {privacyContent}
              </div>
            </div>
          )}

          {activeDoc === 'general' && (
            <div className="space-y-4">
              <div className="whitespace-pre-line text-stone-800 font-sans leading-relaxed">
                {generalContent}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="text-[11px] text-stone-500">
            For questions or requests: <a href="mailto:mannafoods1120@gmail.com" className="text-amber-700 underline font-semibold">mannafoods1120@gmail.com</a> · <span className="font-semibold">+91 9890786024</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            I Understand &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};
