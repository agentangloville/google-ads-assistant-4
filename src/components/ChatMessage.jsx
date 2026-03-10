import React from 'react';
import { Bot, User } from 'lucide-react';
import { formatTime } from '../utils/helpers';

/**
 * Pojedyncza wiadomość w chacie
 */
export function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : ''}`}>
      {/* Avatar - po lewej dla asystenta */}
      {!isUser && (
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg shrink-0">
          <Bot className="w-5 h-5 text-white" />
        </div>
      )}

      {/* Treść wiadomości */}
      <div className={`
        max-w-[80%] rounded-2xl px-5 py-4
        ${isUser 
          ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg' 
          : 'bg-white border border-gray-100 text-gray-800 shadow-sm'
        }
      `}>
        <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-sm max-w-none">
          <MessageContent content={message.content} isUser={isUser} />
        </div>
        <p className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-gray-400'}`}>
          {formatTime(message.timestamp)}
        </p>
      </div>

      {/* Avatar - po prawej dla użytkownika */}
      {isUser && (
        <div className="w-10 h-10 rounded-2xl bg-gray-200 flex items-center justify-center shrink-0">
          <User className="w-5 h-5 text-gray-600" />
        </div>
      )}
    </div>
  );
}

/**
 * Renderowanie treści z markdown
 */
function MessageContent({ content, isUser }) {
  // Prosty parser markdown
  const lines = content.split('\n');
  
  return lines.map((line, i) => {
    // Bold **text**
    let processedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Listy punktowane
    if (line.startsWith('• ') || line.startsWith('- ')) {
      return (
        <div key={i} className="flex gap-2 my-1">
          <span>•</span>
          <span dangerouslySetInnerHTML={{ __html: processedLine.slice(2) }} />
        </div>
      );
    }
    
    // Pusta linia
    if (line.trim() === '') {
      return <div key={i} className="h-2" />;
    }
    
    return (
      <p key={i} dangerouslySetInnerHTML={{ __html: processedLine }} />
    );
  });
}

/**
 * Wskaźnik ładowania
 */
export function LoadingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center shadow-lg">
        <Bot className="w-5 h-5 text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
