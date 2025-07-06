export default function MessageBubble({ text, sender, timestamp }) {
  const isUser = sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`px-4 py-2 rounded-lg max-w-xs ${
          isUser
            ? 'bg-blue-500 text-white rounded-br-none self-end'
            : 'bg-gray-200 text-black rounded-bl-none self-start'
        }`}
      >
        <div>{text}</div>
        <div className="text-xs text-gray-300 mt-1 text-right">
          {timestamp}
        </div>
      </div>
    </div>
  );
}

