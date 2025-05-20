'use client';

import { Message } from '@/app/lib/types';

interface MessageListProps {
  messages: Message[];
}

export default function MessageList({ messages }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === 'user' ? 'justify-start' : 'justify-end'
          }`}
        >
          <div
            className={`max-w-[70%] p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-gray-200 text-gray-800'
                : 'bg-blue-500 text-white'
            }`}
          >
            <p>{message.content}</p>
            <p className="text-xs opacity-70 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}