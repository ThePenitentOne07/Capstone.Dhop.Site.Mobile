import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from '../../../api/axiosInstance';
import { RestEndpoints } from '../../../config/restEndpoint';
import './AIChatBox.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'dancer' | 'choreographer' | 'general';
  data?: any;
}

interface DancerData {
  id: number;
  danceCrewName: string;
  avatar: string;
  yearExperience: number;
  danceTypes: string[];
  areas: string[];
}

interface ChoreographerData {
  id: number;
  nickName: string;
  avatar: string;
  yearExperience: number;
  danceTypes: string[];
  areas: string[];
}

interface ChatResponse {
  type: string;
  data?: DancerData[] | ChoreographerData[];
  message?: string;
}

const AIChatBox: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axiosInstance.post<ChatResponse>(
        RestEndpoints.chatBox.query,
        { message: userMessage.text }
      );

      const responseType = response.data.type;
      const isDancer = responseType === 'dancer';
      const isChoreographer = responseType === 'choreographer';
      const isGeneral = responseType === 'general';
      
      let messageText = 'Phản hồi từ AI';
      if (isDancer && response.data.data) {
        messageText = `Tìm thấy ${response.data.data.length} nhóm nhảy phù hợp`;
      } else if (isChoreographer && response.data.data) {
        messageText = `Tìm thấy ${response.data.data.length} biên đạo phù hợp`;
      } else if (isGeneral && response.data.message) {
        messageText = response.data.message;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: messageText,
        sender: 'ai',
        timestamp: new Date(),
        type: isGeneral ? 'general' : (isDancer || isChoreographer) ? responseType as 'dancer' | 'choreographer' : 'text',
        data: response.data.data
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.',
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat?')) {
      setMessages([]);
    }
  };

  return (
    <div className="ai-chat-container">
      {isOpen && (
        <div className="ai-chat-box">
          <div className="ai-chat-header">
            <div className="ai-chat-avatar">AI</div>
            <h3 className="ai-chat-title">TRỢ LÝ AI</h3>
            {messages.length > 0 && (
              <button 
                className="ai-chat-clear-btn" 
                onClick={clearChat}
                title="Xóa lịch sử"
              >
                🗑️
              </button>
            )}
          </div>
          
          <div className="ai-chat-messages">
            {messages.length === 0 ? (
              <div className="ai-chat-empty">
                <p>XIN CHÀO! TÔI CÓ THỂ GIÚP GÌ CHO BẠN?</p>
              </div>
            ) : (
              <div className="ai-messages-wrapper">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div className={`ai-chat-message ${message.sender === 'user' ? 'user-message' : 'ai-message'}`}>
                      <div className="ai-chat-message-content">
                        {message.text}
                      </div>
                      <div className="ai-chat-message-time">
                        {message.timestamp.toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    
                    {message.type === 'dancer' && message.data && (
                      <div className="ai-dancer-results">
                        {message.data.map((dancer: DancerData) => (
                          <div 
                            key={dancer.id} 
                            className="ai-dancer-card"
                            onClick={() => navigate(`/dance-crews/${dancer.id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="ai-dancer-header">
                              {dancer.avatar && (
                                <img 
                                  src={dancer.avatar} 
                                  alt={dancer.danceCrewName}
                                  className="ai-dancer-avatar"
                                />
                              )}
                              <div className="ai-dancer-info">
                                <h4 className="ai-dancer-name">{dancer.danceCrewName}</h4>
                                <p className="ai-dancer-exp">{dancer.yearExperience} năm kinh nghiệm</p>
                              </div>
                            </div>
                            <div className="ai-dancer-details">
                              <div className="ai-dancer-tags">
                                <span className="ai-dancer-label">LOẠI NHẢY:</span>
                                {dancer.danceTypes.map((type, idx) => (
                                  <span key={idx} className="ai-dancer-tag">{type}</span>
                                ))}
                              </div>
                              <div className="ai-dancer-tags">
                                <span className="ai-dancer-label">KHU VỰC:</span>
                                {dancer.areas.map((area, idx) => (
                                  <span key={idx} className="ai-dancer-tag">{area}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {message.type === 'choreographer' && message.data && (
                      <div className="ai-dancer-results">
                        {message.data.map((choreographer: ChoreographerData) => (
                          <div 
                            key={choreographer.id} 
                            className="ai-dancer-card"
                            onClick={() => navigate(`/choreographers/${choreographer.id}`)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="ai-dancer-header">
                              {choreographer.avatar && (
                                <img 
                                  src={choreographer.avatar} 
                                  alt={choreographer.nickName}
                                  className="ai-dancer-avatar"
                                />
                              )}
                              <div className="ai-dancer-info">
                                <h4 className="ai-dancer-name">{choreographer.nickName}</h4>
                                <p className="ai-dancer-exp">{choreographer.yearExperience} năm kinh nghiệm</p>
                              </div>
                            </div>
                            <div className="ai-dancer-details">
                              <div className="ai-dancer-tags">
                                <span className="ai-dancer-label">LOẠI NHẢY:</span>
                                {choreographer.danceTypes.map((type, idx) => (
                                  <span key={idx} className="ai-dancer-tag">{type}</span>
                                ))}
                              </div>
                              <div className="ai-dancer-tags">
                                <span className="ai-dancer-label">KHU VỰC:</span>
                                {choreographer.areas.map((area, idx) => (
                                  <span key={idx} className="ai-dancer-tag">{area}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="ai-chat-message ai-message">
                    <div className="ai-chat-message-content">
                      <div className="ai-typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
          
          <div className="ai-chat-input-container">
            <input
              type="text"
              className="ai-chat-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="NHẬP TIN NHẮN..."
              disabled={isLoading}
            />
            <button
              className="ai-chat-send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
            >
              →
            </button>
          </div>
        </div>
      )}
      
      <button
        className="ai-chat-toggle-btn"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? 'Đóng chat' : 'Mở chat với AI'}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  );
};

export default AIChatBox;

