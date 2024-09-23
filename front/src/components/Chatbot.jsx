import React, { useState } from 'react';
import { HfInference } from "@huggingface/inference";
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const inference = new HfInference("Introducir token"); 

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await inference.chatCompletion({
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        messages: [...messages, { role: 'user', content: input }],
        max_tokens: 500
      });
      setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: response.choices[0]?.message?.content || 'No response' }]);
    } catch (err) {
      setError('Error fetching response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {!isOpen && (
        <div className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          <div className="chatbot-icon">💬</div>
          <div className="chatbot-text">¿Tienes dudas sobre el cuidado de tu mascota?</div>
        </div>
      )}
      {isOpen && (
        <div className="chatbot-container">
          <div className="chatbot-header">
            <h4>Pregunta las dudas que tengas</h4>
            <button className="chatbot-close-button" onClick={() => setIsOpen(false)}>
              &times;
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message-${msg.role}`}>
                <div className="message-content">{msg.content}</div>
              </div>
            ))}
            {isLoading && <div className="chatbot-loading"></div>}
            {error && <div className="chatbot-error">{error}</div>}
          </div>
          <div className="chatbot-input-container">
            <input
              type="text"
              className="chatbot-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Escribe tu pregunta..."
            />
            <button
              className="chatbot-button"
              onClick={handleSendMessage}
              disabled={isLoading}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
