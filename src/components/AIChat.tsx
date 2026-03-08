import React, { useState, useEffect } from "react";

interface Message {
  text: string;
  isUser: boolean;
}

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Bonjour ! Je suis votre assistant IA pour les paris sportifs. Comment puis-je vous aider aujourd'hui ?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Tester la connexion à l'IA au chargement
  useEffect(() => {
    const testConnection = async () => {
      try {
        const aiService = await import("../services/aiService").then(m => m.default);
        const connected = await aiService.testConnection();
        setIsConnected(connected);
      } catch (error) {
        console.error("Erreur de connexion IA:", error);
        setIsConnected(false);
      }
    };
    testConnection();
  }, []);

  const handleSendMessage = async (message?: string) => {
    const text = message || inputValue.trim();
    
    if (!text) return;

    // Ajouter le message utilisateur
    const userMessage: Message = { text, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      // Appeler l'IA
      const aiService = await import("../services/aiService").then(m => m.default);
      const response = await aiService.generateResponse(text);
      
      // Ajouter la réponse de l'IA
      const aiMessage: Message = { text: response.text, isUser: false };
      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error("Erreur lors de l'appel à l'IA:", error);
      const errorMessage: Message = { 
        text: "Désolé, je rencontre un problème technique. Veuillez réessayer plus tard.", 
        isUser: false 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "Quels sont les meilleurs paris du jour ?",
    "Analyse le match Real Madrid vs Barcelona",
    "Conseils pour parier sur le foot",
    "Prédictions pour la Ligue des Champions"
  ];

  return (
    <div className="ai-chat-container bg-white rounded-lg shadow-lg border border-gray-200">
      {/* En-tête */}
      <div className="chat-header bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold">Assistant IA BetPanther</h3>
              <p className="text-sm opacity-80">
                {isConnected ? "Connecté" : "Déconnecté"}
              </p>
            </div>
          </div>
          {!isConnected && (
            <div className="bg-red-500 text-white px-2 py-1 rounded text-sm">
              API non configurée
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages p-4 space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message flex ${
              message.isUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.isUser
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message flex justify-start">
            <div className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="quick-questions p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSendMessage(question)}
                className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="chat-input p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Posez votre question..." : "API non configurée - Contactez l'admin"}
            disabled={!isConnected}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || !isConnected || isTyping}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;