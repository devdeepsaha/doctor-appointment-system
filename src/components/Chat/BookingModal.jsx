import React, { useState, useEffect, useRef, useCallback } from 'react';

// Setup Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const synth = window.speechSynthesis;

// Read API key once at module load time (Vite replaces import.meta.env at build time,
// so reading it inside a component can sometimes get undefined on the very first render)
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_KEY?.trim() || '';
console.log('[ElevenLabs] Key loaded at module init:', ELEVENLABS_API_KEY ? `${ELEVENLABS_API_KEY.slice(0, 8)}...` : 'MISSING');

const BookingModal = ({ isOpen, onClose, availableSlots, onBook, autoStartVoice }) => {
  const [step, setStep] = useState(-1);
  const [lang, setLang] = useState('en-US');
  const [formData, setFormData] = useState({ name: '', phone: '', problem: '', date: '', time: '' });

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const currentAudioRef = useRef(null);
  const chatEndRef = useRef(null);
  // Use refs for values needed inside callbacks to avoid stale closures
  const recognitionRef = useRef(null);
  const isVoiceModeRef = useRef(false);
  const stepRef = useRef(-1);
  const langRef = useRef('en-US');
  const formDataRef = useRef({ name: '', phone: '', problem: '', date: '', time: '' });
  const isSpeakingRef = useRef(false);
  const pendingTranscriptRef = useRef('');

  // Keep refs in sync with state
  useEffect(() => { isVoiceModeRef.current = isVoiceMode; }, [isVoiceMode]);
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { langRef.current = lang; }, [lang]);
  useEffect(() => { formDataRef.current = formData; }, [formData]);

  // Initialize recognition once
  useEffect(() => {
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;

    rec.onstart = () => setIsListening(true);

    rec.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      if (interim) setInput(interim);
      if (final) pendingTranscriptRef.current = final;
    };

    rec.onend = () => {
      setIsListening(false);
      setInput('');
      // If we got a final transcript, process it
      if (pendingTranscriptRef.current) {
        const transcript = pendingTranscriptRef.current;
        pendingTranscriptRef.current = '';
        processMessageRef.current(transcript, true);
      }
    };

    rec.onerror = (e) => {
      console.warn('Recognition error:', e.error);
      setIsListening(false);
      // Don't disable voice mode on transient errors like no-speech
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setIsVoiceMode(false);
      }
    };

    recognitionRef.current = rec;
  }, []);

  const startMic = useCallback(() => {
    if (!recognitionRef.current) return;
    recognitionRef.current.lang = langRef.current;
    setTimeout(() => {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started - ignore
      }
    }, 300);
  }, []);

  const stopMic = useCallback(() => {
    if (!recognitionRef.current) return;
    try { recognitionRef.current.stop(); } catch (e) {}
  }, []);

  const stopAllAudio = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (synth) synth.cancel();
    isSpeakingRef.current = false;
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      if (isInitializing) return;
      setStep(-1);
      setLang('en-US');
      const initialFormData = { name: '', phone: '', problem: '', date: '', time: '' };
      setFormData(initialFormData);
      formDataRef.current = initialFormData;
      setMessages([{
        role: 'ai',
        text: "For English, say 'English'. हिंदी के लिए 'हिंदी' बोलें।",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setInput('');
      setIsVoiceMode(false);

      if (autoStartVoice && recognitionRef.current) {
        setTimeout(() => {
          setIsVoiceMode(true);
          isVoiceModeRef.current = true;
          speakAndListen("For English, say English. हिंदी के लिए 'हिंदी' बोलें।", 'hi-IN');
        }, 600);
      }
    } else {
      stopMic();
      stopAllAudio();
      setIsListening(false);
      setIsVoiceMode(false);
    }
  }, [isOpen, autoStartVoice, isInitializing]);

  const expandForSpeech = (text) => {
    const replacements = {
      'Mon ': 'Monday ', 'Tue ': 'Tuesday ', 'Wed ': 'Wednesday ',
      'Thu ': 'Thursday ', 'Fri ': 'Friday ', 'Sat ': 'Saturday ', 'Sun ': 'Sunday ',
      ' Jan': ' January', ' Feb': ' February', ' Mar': ' March', ' Apr': ' April',
      ' Aug': ' August', ' Sep': ' September', ' Oct': ' October',
      ' Nov': ' November', ' Dec': ' December'
    };
    let expanded = text;
    Object.entries(replacements).forEach(([k, v]) => {
      expanded = expanded.split(k).join(v);
    });
    return expanded;
  };

  // Speak text, then start mic if in voice mode
  const speakAndListen = useCallback(async (text, langCode, shouldListen = true) => {
    stopAllAudio();
    isSpeakingRef.current = true;
    const spokenText = expandForSpeech(text);

    const onDone = () => {
      isSpeakingRef.current = false;
      if (shouldListen && isVoiceModeRef.current && stepRef.current < 5) {
        startMic();
      }
    };

    // Try ElevenLabs if key exists
    if (ELEVENLABS_API_KEY) {
      try {
        const voiceId = 'EXAVITQu4vr4xnSDxMaL';
        const response = await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=0`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'xi-api-key': ELEVENLABS_API_KEY,
              'Accept': 'audio/mpeg'
            },
            body: JSON.stringify({
              text: spokenText,
              model_id: 'eleven_multilingual_v2',
              voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true }
            })
          }
        );

        if (response.ok) {
          const blob = await response.blob();
          const audio = new Audio(window.URL.createObjectURL(blob));
          currentAudioRef.current = audio;
          audio.onended = () => { currentAudioRef.current = null; onDone(); };
          audio.onerror = () => { currentAudioRef.current = null; fallbackTTS(spokenText, langCode, onDone); };
          await audio.play();
          return;
        }
      } catch (e) {
        // Fall through to browser TTS
      }
    }

    fallbackTTS(spokenText, langCode, onDone);
  }, [startMic, stopAllAudio]);

  const fallbackTTS = (text, langCode, onDone) => {
    if (!synth) { onDone?.(); return; }
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;

    const doSpeak = () => {
      const voices = synth.getVoices();
      if (langCode === 'hi-IN') {
        const voice = voices.find(v => v.lang.includes('hi')) || voices.find(v => v.lang.includes('en-IN'));
        if (voice) utterance.voice = voice;
        utterance.rate = 0.9;
      } else {
        const voice = voices.find(v => v.lang.includes('en-IN')) || voices.find(v => v.lang.includes('en-US'));
        if (voice) utterance.voice = voice;
        utterance.rate = 1;
      }
      utterance.onend = () => onDone?.();
      utterance.onerror = () => onDone?.();
      synth.speak(utterance);
    };

    if (synth.getVoices().length === 0) {
      synth.onvoiceschanged = doSpeak;
    } else {
      doSpeak();
    }
  };

  const addMessage = (role, text) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role, text, time }]);
  };

  const translateToEnglish = (text, fieldType) => {
    const lower = text.toLowerCase();
    if (fieldType === 'problem') {
      if (lower.includes('dard') || lower.includes('pain') || lower.includes('दर्द')) return 'Toothache / Pain';
      if (lower.includes('safai') || lower.includes('clean') || lower.includes('सफाई')) return 'Teeth Cleaning';
      if (lower.includes('khoon') || lower.includes('blood') || lower.includes('खून')) return 'Bleeding Gums';
      return `[Hindi] ${text}`;
    }
    return text;
  };

  const getFilteredDates = () => {
    const uniqueDates = [...new Set(availableSlots.map(s => s.date))];
    return uniqueDates.slice(0, 5);
  };

  const parseDateString = (dateStr) => {
    const parts = dateStr.split(' ');
    return { day: parts[0], date: `${parts[1]} ${parts[2] || ''}`.trim() };
  };

  // Use ref so it can be called from recognition.onend without stale closures
  const processMessageRef = useRef(null);
  processMessageRef.current = (textToProcess, fromVoice = false) => {
    if (!textToProcess.trim()) return;
    setInput('');
    addMessage('user', textToProcess);

    const currentStep = stepRef.current;
    const currentLang = langRef.current;
    const currentFormData = formDataRef.current;
    const lowerText = textToProcess.toLowerCase();

    setTimeout(() => {
      let aiResponse = '';
      let nextStep = currentStep;

      if (currentStep === -1) {
        const isHindi = ['hindi', 'हिंदी', 'indie', 'henry', 'in the', 'hundi'].some(w => lowerText.includes(w));
        if (isHindi) {
          setLang('hi-IN');
          langRef.current = 'hi-IN';
          if (recognitionRef.current) recognitionRef.current.lang = 'hi-IN';
          aiResponse = 'नमस्कार! मैं मेडबुक असिस्टेंट हूँ। बुकिंग के लिए अपना पूरा नाम बताएं।';
        } else {
          setLang('en-US');
          langRef.current = 'en-US';
          if (recognitionRef.current) recognitionRef.current.lang = 'en-US';
          aiResponse = "Hello! I'm your MedBook Dental Assistant. To get started, could you please provide your full name?";
        }
        nextStep = 0;
      }
      else if (currentStep === 0) {
        const name = currentLang === 'hi-IN' ? translateToEnglish(textToProcess, 'name') : textToProcess;
        setFormData(prev => ({ ...prev, name }));
        formDataRef.current = { ...currentFormData, name };
        aiResponse = currentLang === 'hi-IN' ? 'धन्यवाद। आपका फोन नंबर क्या है?' : 'Thank you. What is your contact phone number?';
        nextStep = 1;
      }
      else if (currentStep === 1) {
        const phoneDigits = textToProcess.replace(/[^0-9]/g, '');
        if (phoneDigits.length < 5) {
          aiResponse = currentLang === 'hi-IN' ? 'कृपया सही फोन नंबर बताएं।' : 'Please provide a valid phone number using only numbers.';
        } else {
          setFormData(prev => ({ ...prev, phone: phoneDigits }));
          formDataRef.current = { ...currentFormData, phone: phoneDigits };
          aiResponse = currentLang === 'hi-IN' ? 'ठीक है। आपके दांतों में क्या तकलीफ है?' : 'Got it. Briefly, what is the reason for your visit today?';
          nextStep = 2;
        }
      }
      else if (currentStep === 2) {
        const problem = currentLang === 'hi-IN' ? translateToEnglish(textToProcess, 'problem') : textToProcess;
        setFormData(prev => ({ ...prev, problem }));
        formDataRef.current = { ...currentFormData, problem };
        const dates = getFilteredDates();
        if (dates.length === 0) {
          aiResponse = currentLang === 'hi-IN' ? 'माफ़ करें, अभी कोई स्लॉट उपलब्ध नहीं है।' : 'Sorry, no slots are currently available.';
          nextStep = 5;
          setIsVoiceMode(false);
          isVoiceModeRef.current = false;
        } else {
          const dateStrings = dates.map(d => parseDateString(d).date).join(', ');
          aiResponse = currentLang === 'hi-IN'
            ? `समझ गई। स्क्रीन पर उपलब्ध तारीखें हैं: ${dateStrings}। आप कौन सी तारीख चुनना चाहेंगे?`
            : `Understood. Available dates on the screen are: ${dateStrings}. Which date would you like?`;
          nextStep = 3;
        }
      }
      else if (currentStep === 3) {
        const dates = getFilteredDates();
        const matched = dates.find(d => {
          const num = d.match(/\d+/);
          return num && lowerText.includes(num[0]);
        });
        if (matched) {
          setFormData(prev => ({ ...prev, date: matched }));
          formDataRef.current = { ...currentFormData, date: matched };
          const times = availableSlots.filter(s => s.date === matched).map(s => s.time).join(', ');
          aiResponse = currentLang === 'hi-IN'
            ? `बहुत अच्छा। ${matched} के लिए उपलब्ध समय हैं: ${times}। आप किस समय आना चाहेंगे?`
            : `Great choice. For ${matched}, available times are: ${times}. Which time works for you?`;
          nextStep = 4;
        } else {
          aiResponse = currentLang === 'hi-IN'
            ? 'मुझे वह तारीख समझ नहीं आई। कृपया स्क्रीन पर दी गई तारीखों में से कोई एक बोलें।'
            : "I didn't catch that date. Please say one of the dates shown on the screen.";
        }
      }
      else if (currentStep === 4) {
        const times = availableSlots.filter(s => s.date === currentFormData.date).map(s => s.time);
        const matched = times.find(t => {
          const hr = t.match(/\d+/);
          return hr && lowerText.includes(parseInt(hr[0], 10).toString());
        });
        if (matched) {
          const finalData = { ...currentFormData, time: matched };
          setFormData(finalData);
          formDataRef.current = finalData;
          onBook(finalData);
          aiResponse = currentLang === 'hi-IN'
            ? 'परफेक्ट! आपकी अपॉइंटमेंट बुक हो गई है। क्लिनिक में मिलते हैं।'
            : "Perfect! Your appointment is confirmed and synced to your provider's calendar. We'll see you then.";
          nextStep = 5;
          setIsVoiceMode(false);
          isVoiceModeRef.current = false;
        } else {
          aiResponse = currentLang === 'hi-IN'
            ? 'मुझे वह समय समझ नहीं आया। कृपया उपलब्ध समय में से एक बोलें।'
            : "I didn't catch that time. Please say one of the available times.";
        }
      }

      if (aiResponse) {
        addMessage('ai', aiResponse);
        setStep(nextStep);
        stepRef.current = nextStep;

        if (fromVoice) {
          speakAndListen(aiResponse, langRef.current, nextStep < 5 && isVoiceModeRef.current);
        }
      }
    }, 400);
  };

  const handleManualSend = () => {
    if (!input.trim()) return;
    stopAllAudio();
    stopMic();
    setIsVoiceMode(false);
    isVoiceModeRef.current = false;
    processMessageRef.current(input, false);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return alert('Voice recognition is not supported in this browser.');

    if (isListening) {
      stopMic();
      stopAllAudio();
      setIsListening(false);
      setIsVoiceMode(false);
      isVoiceModeRef.current = false;
    } else {
      setIsVoiceMode(true);
      isVoiceModeRef.current = true;
      if (stepRef.current === -1 && messages.length <= 1) {
        speakAndListen("For English, say English. हिंदी के लिए 'हिंदी' बोलें।", 'hi-IN', true);
      } else {
        startMic();
      }
    }
  };

  const selectDate = (date) => {
    stopAllAudio();
    stopMic();
    setFormData(prev => ({ ...prev, date }));
    formDataRef.current = { ...formDataRef.current, date };
    addMessage('user', date);

    setTimeout(() => {
      const times = availableSlots.filter(s => s.date === date).map(s => s.time).join(', ');
      const response = langRef.current === 'hi-IN'
        ? `बहुत अच्छा। ${date} के लिए उपलब्ध समय हैं: ${times}। आप किस समय आना चाहेंगे?`
        : `Great choice. For ${date}, available times are: ${times}. Which time works for you?`;

      addMessage('ai', response);
      setStep(4);
      stepRef.current = 4;
      setIsVoiceMode(true);
      isVoiceModeRef.current = true;
      speakAndListen(response, langRef.current, true);
    }, 400);
  };

  const selectTime = (time) => {
    stopAllAudio();
    stopMic();
    const finalData = { ...formDataRef.current, time };
    setFormData(finalData);
    formDataRef.current = finalData;
    onBook(finalData);
    addMessage('user', time);

    setTimeout(() => {
      const response = langRef.current === 'hi-IN'
        ? 'परफेक्ट! आपकी अपॉइंटमेंट बुक हो गई है। क्लिनिक में मिलते हैं।'
        : "Perfect! Your appointment is confirmed and synced to your provider's calendar. We'll see you then.";
      addMessage('ai', response);
      setStep(5);
      stepRef.current = 5;
      setIsVoiceMode(false);
      isVoiceModeRef.current = false;
      speakAndListen(response, langRef.current, false);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    // CHANGED: Updated overlay to standard Tailwind backdrop blur replicating the glass effect
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/20 backdrop-blur-md" id="booking-overlay">
      
      {/* CHANGED: Container borders, shadows, and rounded corners align with the HTML's .bg-white w-full max-w-lg rounded-3xl class */}
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[80vh] border border-outline-variant/10">

        {/* CHANGED: Header directly models the HTML's provided header */}
        <div className="px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between bg-white/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl">smart_toy</span>
            </div>
            <span className="font-headline font-semibold text-on-surface">MedBook Assistant</span>
          </div>
          <button 
            onClick={() => { stopAllAudio(); stopMic(); onClose(); }}
            className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center text-outline transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {isInitializing ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-white">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 animate-pulse">
               <span className="material-symbols-outlined text-primary text-2xl">keyboard_voice</span>
            </div>
            <h3 className="font-headline font-bold text-lg text-on-surface">Connecting...</h3>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {messages.map((m, i) => (
              // CHANGED: AI vs User message alignment matches HTML layout
              <div key={i} className={`flex items-start gap-3 w-full ${m.role === 'user' ? 'justify-end' : ''}`}>
                <div className="space-y-4 w-full flex flex-col">
                  
                  {/* CHANGED: Bubble styling to perfectly match rounded-2xl with asymmetric corners */}
                  <div className={`${
                      m.role === 'user' 
                        ? 'bg-primary text-white rounded-tr-none self-end' 
                        : 'bg-surface-container-low text-on-surface-variant rounded-tl-none self-start'
                    } p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm`}
                  >
                    {m.text}
                  </div>

                  {/* CHANGED: Restructured dates generation directly matching the HTML's interactive card style */}
                  {step === 3 && m.role === 'ai' && i === messages.length - 1 && (
                    <div className="grid grid-cols-2 gap-3 self-start w-full">
                      {getFilteredDates().length > 0
                        ? getFilteredDates().map(d => {
                            const parsed = parseDateString(d);
                            return (
                              <button key={d} onClick={() => selectDate(d)} className="p-4 text-left border border-outline-variant/20 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group">
                                <span className="block text-xs font-bold text-primary mb-1 uppercase tracking-wider">{parsed.day}</span>
                                <span className="block font-semibold text-on-surface">{parsed.date}</span>
                              </button>
                            );
                          })
                        : <div className="col-span-2 text-sm text-error">
                            {lang === 'hi-IN' ? 'कोई स्लॉट उपलब्ध नहीं है।' : 'No slots generated.'}
                          </div>
                      }
                    </div>
                  )}

                  {/* CHANGED: Restructured times generation directly matching the HTML's interactive card style */}
                  {step === 4 && m.role === 'ai' && i === messages.length - 1 && (
                    <div className="grid grid-cols-2 gap-3 self-start w-full">
                      {availableSlots.filter(s => s.date === formData.date).map(s => (
                        <button key={s.id} onClick={() => selectTime(s.time)} className="p-4 text-left border border-outline-variant/20 rounded-xl hover:border-primary hover:bg-primary/5 transition-all group">
                          <span className="block font-semibold text-on-surface">{s.time}</span>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}

        {/* CHANGED: Footer input specifically styling the 'pill' structure provided in HTML */}
        <div className="p-6 border-t border-outline-variant/10 bg-surface-container-lowest">
          <div className={`flex items-center gap-2 bg-white p-2 pl-4 rounded-full border shadow-sm transition-colors ${isListening ? 'border-primary ring-1 ring-primary/20' : 'border-outline-variant/20'}`}>
            <input
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface outline-none"
              placeholder={
                isInitializing ? 'Connecting...' :
                isListening ? (lang === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening...') :
                step >= 5 ? (lang === 'hi-IN' ? 'बुकिंग पूरी हुई' : 'Booking Complete') :
                (lang === 'hi-IN' ? 'यहाँ टाइप करें या बोलें...' : 'Type or speak your request...')
              }
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualSend()}
              disabled={step >= 5 || isListening || isInitializing}
            />
            
            <div className="flex items-center gap-1">
              {input.trim() ? (
                <button
                  onClick={handleManualSend}
                  disabled={step >= 5 || isInitializing || isListening}
                  className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-xl">send</span>
                </button>
              ) : (
                <button
                  onClick={toggleVoice}
                  disabled={step >= 5 || isInitializing}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isListening
                      ? 'bg-error text-white animate-pulse shadow-md'
                      : 'bg-primary text-white shadow-md hover:bg-primary/90'
                  } disabled:opacity-50`}
                >
                  <span className="material-symbols-outlined text-xl">
                    {isListening ? 'mic_off' : 'mic'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;