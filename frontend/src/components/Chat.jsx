import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { X, Send, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

export default function Chat({ otherUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    // Fetch previous messages
    const fetchMessages = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/messages/${otherUser.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data);
        scrollToBottom();
      } catch (err) {
        console.error('Failed to fetch messages', err);
      }
    };
    
    fetchMessages();

    // Setup Socket
    const newSocket = io('http://localhost:5000');
    newSocket.emit('join', currentUserId);
    
    newSocket.on('newMessage', (msg) => {
      if (msg.senderId === otherUser.id || msg.receiverId === otherUser.id) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
      }
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, [otherUser.id, currentUserId, token]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    try {
      const res = await axios.post('http://localhost:5000/api/messages', {
        receiverId: otherUser.id,
        content: newMessage
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
      scrollToBottom();
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] max-h-[80vh] glass-card flex flex-col z-[100] overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.5)] border border-white/10 animate-slide-up">
      {/* Header */}
      <div className="bg-zinc-900/80 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="h-10 w-10 bg-gradient-to-tr from-primary-500 to-accent-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-primary-500/30">
               {otherUser.name.charAt(0).toUpperCase()}
             </div>
             <div className="absolute bottom-0 right-0 h-3 w-3 bg-success rounded-full border-2 border-zinc-900"></div>
          </div>
          <div>
            <h3 className="font-bold text-white tracking-tight leading-tight capitalize">{otherUser.name}</h3>
            <span className="text-[10px] text-success font-medium tracking-wide uppercase">Online</span>
          </div>
        </div>
        <button onClick={onClose} className="h-8 w-8 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full flex items-center justify-center transition-colors border border-zinc-700/50">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-zinc-900/30">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 animate-fade-in">
            <div className="h-16 w-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4 border border-zinc-700/50 shadow-inner">
               <MessageSquare className="h-8 w-8 text-zinc-600" />
            </div>
            <p className="font-medium text-sm">Start the conversation</p>
            <p className="text-xs mt-1 max-w-[200px] text-center text-zinc-600">Messages will be encrypted and sent in real time</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.senderId === currentUserId;
            // Simple animated entrance for the very latest message
            const isLatestMessage = index === messages.length - 1;
            
            return (
              <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isLatestMessage ? 'animate-slide-up origin-bottom' : ''}`}>
                <div className={`max-w-[75%] px-4 py-2.5 text-[13px] leading-relaxed shadow-sm relative ${
                  isMe 
                    ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm border border-primary-500/50' 
                    : 'bg-zinc-800/90 backdrop-blur-sm text-zinc-100 rounded-2xl rounded-tl-sm border border-zinc-700/50'
                }`}>
                  <p className="break-words font-medium">{msg.content}</p>
                  <p className={`text-[9px] mt-1 text-right font-medium tracking-wide opacity-70`}>
                    {format(new Date(msg.timestamp), 'h:mm a')}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900/80 backdrop-blur-md border-t border-white/5 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2 relative">
          <input 
            type="text" 
            value={newMessage} 
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Write a message..." 
            className="flex-1 bg-zinc-950 border border-zinc-700/80 rounded-full pl-5 pr-12 py-3 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder-zinc-600 shadow-inner"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()} 
            className="absolute right-1 top-1 bottom-1 w-10 bg-primary-600 hover:bg-primary-500 disabled:opacity-0 disabled:scale-90 text-white rounded-full flex items-center justify-center transition-all shadow-md"
          >
            <Send size={16} className="ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
