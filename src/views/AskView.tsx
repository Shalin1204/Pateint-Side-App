import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/supabaseMock';
import { aiService, ClassifyResponse } from '../services/aiService';
import { speechService } from '../services/speechService';
import { CitationChip } from '../components/common/CitationChip';
import { TaskDetailSheet } from '../components/tasks/TaskDetailSheet';
import { t } from '../i18n/translations';
import { PatientQuestionMessage } from '../types';
import {
  Send,
  Mic,
  MicOff,
  User,
  Shield,
  AlertTriangle,
  Clock,
  Phone,
  Sparkles,
  Stethoscope,
} from 'lucide-react';

export const AskView: React.FC = () => {
  const { patientContext, language, selectedTaskId, setSelectedTaskId } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => {
    return db.getQuestions(patientContext.patientId);
  }, [patientContext.patientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || inputText.trim();
    if (!textToSend || isSending) return;

    setInputText('');

    // 1. Add patient question message to thread
    const patientMsg = db.addQuestionMessage({
      patient_id: patientContext.patientId,
      sender: 'patient',
      sender_name: patientContext.role === 'caregiver' ? 'Ramesh Kumar (Caregiver)' : patientContext.patientName,
      text: textToSend,
      type: 'question',
    });

    setIsSending(true);

    try {
      // 2. Call AI Server /question/classify
      const result: ClassifyResponse = await aiService.classifyAndAnswer(
        textToSend,
        language,
        patientContext
      );

      if (result.route === 'emergency') {
        db.addQuestionMessage({
          patient_id: patientContext.patientId,
          sender: 'system',
          sender_name: 'CarePlus Emergency Alert',
          text: result.message || 'EMERGENCY ALERT: If you are experiencing warning symptoms, dial 112 immediately.',
          type: 'emergency_warning',
        });
      } else if (result.route === 'medicine' || result.route === 'symptom') {
        db.addQuestionMessage({
          patient_id: patientContext.patientId,
          sender: 'system',
          sender_name: 'CarePlus Coordinator',
          text: result.answer || 'Your inquiry has been escalated to your care team.',
          type: 'escalation',
          escalation_reason: result.escalation_reason,
        });
      } else {
        // Plan answer with citations
        db.addQuestionMessage({
          patient_id: patientContext.patientId,
          sender: 'system',
          sender_name: 'CarePlus Coordinator',
          text: result.answer || 'According to your discharge plan, here are your scheduled items.',
          type: 'plan_answer',
          cited_item_ids: result.cited_item_ids || [],
        });
      }
    } catch (err) {
      db.addQuestionMessage({
        patient_id: patientContext.patientId,
        sender: 'system',
        sender_name: 'CarePlus Coordinator',
        text: 'Unable to reach the clinical coordinator. For urgent concerns, please consult Warning Signs or call 112.',
        type: 'escalation',
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMicToggle = () => {
    if (isListeningMic) {
      setIsListeningMic(false);
    } else {
      const recognition = speechService.createSpeechRecognition(
        language,
        (transcript) => {
          setInputText(transcript);
          setIsListeningMic(false);
        },
        () => setIsListeningMic(false)
      );

      if (recognition) {
        setIsListeningMic(true);
        recognition.start();
      } else {
        alert('Voice microphone recognition is not supported in this browser.');
      }
    }
  };

  const sampleQuestions = [
    'When is my blood test?',
    'When is my doctor appointment?',
    'Can I take paracetamol with this medicine?',
    'My knee is swollen',
    'I have severe chest pain',
  ];

  return (
    <div className="flex flex-col h-[calc(100dvh-130px)] pb-1">
      {/* Top Banner Notice */}
      <div className="shrink-0 p-3 mb-2 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
        <Stethoscope className="w-4 h-4 text-teal-400 shrink-0" />
        <span>Ask about your scheduled plan, tests, or appointments. Never used for emergency care.</span>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 no-scrollbar">
        {messages.map((msg) => {
          const isPatient = msg.sender === 'patient';
          const isDoctor = msg.sender === 'care_team';
          const isEmergency = msg.type === 'emergency_warning';
          const isEscalation = msg.type === 'escalation';

          if (isEmergency) {
            return (
              <div
                key={msg.id}
                className="w-full rounded-2xl bg-amber-950/90 border border-amber-600/80 p-4 shadow-lg text-amber-100 animate-in fade-in"
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{t(language, 'emergency_badge')}</span>
                </div>
                <p className="text-xs font-semibold leading-relaxed mb-3">
                  {msg.text}
                </p>
                <a
                  href="tel:112"
                  className="w-full min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow transition"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t(language, 'emergency_call_btn')}</span>
                </a>
              </div>
            );
          }

          if (isEscalation) {
            return (
              <div key={msg.id} className="flex flex-col items-start max-w-[88%]">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 mb-1 px-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{t(language, 'escalated_badge')}</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-900 border border-amber-900/50 p-3.5 text-xs text-slate-200 leading-relaxed shadow-sm">
                  <p>{msg.text}</p>
                  {msg.escalation_reason && (
                    <div className="mt-2 text-[10px] text-amber-300/80 italic border-t border-slate-800 pt-1.5">
                      {msg.escalation_reason}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          if (isDoctor) {
            return (
              <div key={msg.id} className="flex flex-col items-start max-w-[88%]">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-400 mb-1 px-1">
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>{t(language, 'from_care_team')} · {msg.sender_name}</span>
                </div>
                <div className="rounded-2xl rounded-tl-sm bg-slate-900 border border-teal-800/60 p-3.5 text-xs text-slate-100 leading-relaxed shadow-sm">
                  <p>{msg.text}</p>
                </div>
              </div>
            );
          }

          if (isPatient) {
            return (
              <div key={msg.id} className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 mb-1 px-1">
                  {msg.sender_name}
                </span>
                <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-teal-600 text-white p-3.5 text-xs leading-relaxed shadow-sm">
                  {msg.text}
                </div>
              </div>
            );
          }

          // Plan Answer with Citations
          return (
            <div key={msg.id} className="flex flex-col items-start max-w-[90%]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-300 mb-1 px-1">
                <Shield className="w-3.5 h-3.5" />
                <span>{msg.sender_name}</span>
              </div>
              <div className="rounded-2xl rounded-tl-sm bg-slate-900 border border-slate-800 p-3.5 text-xs text-slate-200 leading-relaxed shadow-sm">
                <p className="mb-2">{msg.text}</p>
                {msg.cited_item_ids && msg.cited_item_ids.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-1.5">
                      Cited Plan Items (Tap to view)
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.cited_item_ids.map((id) => (
                        <CitationChip
                          key={id}
                          itemId={id}
                          onClick={(clickedId) => setSelectedTaskId(clickedId)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
            <span>Consulting clinical plan coordinator...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Carousel */}
      <div className="shrink-0 py-2 overflow-x-auto no-scrollbar flex items-center gap-1.5">
        {sampleQuestions.map((sq, i) => (
          <button
            key={i}
            onClick={() => handleSend(sq)}
            className="min-h-[36px] px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-[11px] text-teal-300 whitespace-nowrap transition active:scale-95"
          >
            {sq}
          </button>
        ))}
      </div>

      {/* Message Input Bar */}
      <div className="shrink-0 pt-2 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <button
            type="button"
            onClick={handleMicToggle}
            aria-label="Use voice input"
            className={`min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center transition ${
              isListeningMic
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-slate-900 border border-slate-700 text-teal-400 hover:bg-slate-800'
            }`}
          >
            {isListeningMic ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={t(language, 'ask_placeholder')}
            className="flex-1 min-h-[44px] px-4 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-500"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            aria-label={t(language, 'send')}
            className="min-h-[44px] min-w-[44px] rounded-2xl bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600 text-white flex items-center justify-center transition active:scale-95 shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Task Detail Bottom Sheet when tapping citation chip */}
      <TaskDetailSheet
        itemId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
      />
    </div>
  );
};
