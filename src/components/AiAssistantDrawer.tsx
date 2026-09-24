import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, PhoneCall, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenComplaint?: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AiAssistantDrawer: React.FC<Props> = ({ isOpen, onClose, onOpenComplaint }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Xin chào quý khách! Tôi là Trợ lý Pháp lý & Điều hành ViaStep. Tôi có thể hỗ trợ quý khách giải đáp về quy chế sàn, tính hợp pháp của xe hợp đồng dưới 8 chỗ, cách thức đặt vé, hoặc quy trình hợp đồng điện tử.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);

  const quickPrompts = [
    'ViaStep có tự đặt giá vé hay thu cước không?',
    'Tại sao không có lịch chạy và bến xe cố định?',
    'Quy tắc Đề xuất đồng thời hoạt động thế nào?',
    'Tôi có bị trừ tiền ngay khi gửi yêu cầu không?',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const newMsgs: Message[] = [...messages, { role: 'user', content: query }];
    setMessages(newMsgs);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages,
        }),
      });

      const data = await res.json();
      if (data.reply) {
        setMessages([...newMsgs, { role: 'assistant', content: data.reply }]);
      } else {
        setMessages([
          ...newMsgs,
          {
            role: 'assistant',
            content:
              'ViaStep là sàn TMĐT trung gian, không sở hữu xe hay tự định giá. Biểu giá do các Hợp tác xã/Doanh nghiệp vận tải tự niêm yết theo quy định.',
          },
        ]);
      }
    } catch (err) {
      setMessages([
        ...newMsgs,
        {
          role: 'assistant',
          content:
            'Không thể kết nối đến máy chủ AI lúc này. Bạn có thể nhấn nút "Chuyển tiếp tổng đài viên" bên dưới để được nhân viên hỗ trợ trực tiếp.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-indigo-900 to-indigo-700 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
            <Bot className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              Trợ Lý Pháp Lý & Quy Chế ViaStep
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            </h3>
            <span className="text-[11px] text-indigo-200 font-mono">
              AI Thấu hiểu Nghị định 10/2020 & 47/2022
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Escalation Notification if triggered */}
      {escalated && (
        <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Đã chuyển tiếp yêu cầu đến Tổng đài viên (Hotline 1900-6868). Nhân viên sẽ liên hệ trong 5 phút.
          </span>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 leading-relaxed text-xs shadow-sm ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-bl-none px-4 py-2.5 text-xs text-slate-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              <span>Đang tra cứu dữ liệu pháp lý & quy chế...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="p-3 bg-slate-50 border-t border-slate-100">
        <p className="text-[11px] font-semibold text-slate-500 mb-2">Câu hỏi nhanh:</p>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-[11px] bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-lg px-2.5 py-1 transition-colors text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Human Escalation Bar */}
      <div className="px-4 py-2 bg-amber-50/70 border-t border-amber-200 flex items-center justify-between text-xs">
        <span className="text-amber-800 flex items-center gap-1 font-medium">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          Cần hỗ trợ sự cố hoặc khiếu nại?
        </span>
        <button
          onClick={() => {
            setEscalated(true);
            if (onOpenComplaint) onOpenComplaint();
          }}
          className="flex items-center gap-1 text-[11px] bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-md font-medium transition-colors"
        >
          <PhoneCall className="w-3 h-3" />
          Chuyển Tổng Đài Viên
        </button>
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Hỏi về quy chế, giá cước, hợp đồng..."
          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
