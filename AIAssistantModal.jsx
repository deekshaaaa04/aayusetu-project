import React, { useState, useEffect, useRef } from 'react';
import { Bot, User, Send, Mic, MicOff, Volume2, VolumeX, AlertTriangle, ShieldCheck, X, ArrowRight, HeartPulse, Stethoscope, Hospital } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function AIAssistantModal({ isOpen, onClose, onStartTeleconsult, onFindCare, onTriggerEmergency }) {
  const { currentLang, t } = useLanguage();
  
  const getInitialGreeting = () => ({
    sender: 'ai',
    text: t('aiGreeting'),
    isGreeting: true,
    actions: [
      { type: 'QUICK_SYMPTOM', label: t('quickFeverHeadache') },
      { type: 'QUICK_SPECIALIST', label: t('quickCardiologist') },
      { type: 'QUICK_QUEUE', label: t('quickCheckQueue') }
    ]
  });

  const [messages, setMessages] = useState([getInitialGreeting()]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return [getInitialGreeting()];
      }
      return prev;
    });
  }, [currentLang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const speakText = (text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#]/g, ''));
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend = null) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const newMsgs = [...messages, { sender: 'user', text: query }];
    setMessages(newMsgs);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query, language: currentLang })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        const aiMsg = {
          sender: 'ai',
          text: data.response,
          intent: data.intent,
          emergencyMode: data.emergencyMode,
          triageLevel: data.triageLevel,
          actions: data.actions || [],
          recommendations: data.careReadinessRecommendations || []
        };

        setMessages([...newMsgs, aiMsg]);
        speakText(data.response);

        if (data.emergencyMode && onTriggerEmergency) {
          onTriggerEmergency();
        }
      }
    } catch (err) {
      setLoading(false);
      setMessages([...newMsgs, { sender: 'ai', text: 'Communication error. Please try again or call 108 emergency.' }]);
    }
  };

  const handleSpeechInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please type your message.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = currentLang === 'hi' ? 'hi-IN' : currentLang === 'te' ? 'te-IN' : 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSendMessage(transcript);
    };

    recognition.start();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-[600px] glass-panel rounded-2xl border border-emerald-500/30 flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-100 flex items-center space-x-2">
                <span>{t('conversationalAi')}</span>
                <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono">
                  v2.4 Approved
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">{t('aiDesc')}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setTtsEnabled(!ttsEnabled)}
              className={`p-2 rounded-lg text-slate-400 hover:text-slate-200 ${ttsEnabled ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800'}`}
              title={ttsEnabled ? 'Mute AI Voice' : 'Enable AI Voice'}
            >
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-slate-200">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/60">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-2 ${msg.sender === 'user' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-none shadow-lg shadow-emerald-600/20' : 'glass-card text-slate-200 border border-slate-800 rounded-bl-none'}`}
              >
                {msg.emergencyMode && (
                  <div className="p-2 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{t('emergencyAlertTitle')}</span>
                  </div>
                )}

                <div className="leading-relaxed whitespace-pre-line">{msg.text}</div>

                {/* AI Care Recommendations Widget */}
                {msg.recommendations && msg.recommendations.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-slate-800 space-y-2">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      {t('careRecommendationsTitle')}
                    </div>
                    {msg.recommendations.map((rec, rIdx) => (
                      <div key={rIdx} className="p-2 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-slate-200 text-xs">{rec.hospital.name}</div>
                          <div className="text-[10px] text-slate-400">{rec.summaryWhy}</div>
                        </div>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-300">
                          {rec.readinessScore}/100 {t('scoreLabel')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Interactive Action Buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/60">
                    {msg.actions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => {
                          if (act.type === 'START_TELECONSULT' && onStartTeleconsult) onStartTeleconsult(act.specialty);
                          else if (act.type === 'FIND_CARE' && onFindCare) onFindCare(act.specialty);
                          else if (act.type === 'CALL_EMERGENCY' && onTriggerEmergency) onTriggerEmergency();
                          else handleSendMessage(act.label);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-semibold text-[11px] flex items-center space-x-1"
                      >
                        <span>{t(act.label)}</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="p-3 rounded-2xl glass-card text-xs text-slate-400 flex items-center space-x-2">
                <Bot className="w-4 h-4 animate-spin text-emerald-400" />
                <span>{t('evaluatingSymptoms')}</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/90 flex items-center space-x-2">
          <button
            onClick={handleSpeechInput}
            className={`p-2.5 rounded-xl border transition-all ${isListening ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}
            title="Speech Input (Voice)"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={t('typeSymptomsPlaceholder')}
            className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim()}
            className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
