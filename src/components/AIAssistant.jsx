import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { FiMessageCircle, FiX, FiSend, FiMinus } from "react-icons/fi";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const SYSTEM_PROMPT = `You are a helpful AI assistant for JOE, BEST Communication System G.S.M WORLD, a mobile phone and accessories shop located at B139 Railway Line Ogbete Main Market, Enugu, Nigeria.

Store Information:
- Name: JOE, BEST Communication System G.S.M WORLD
- Location: B139 Railway Line Ogbete Main Market, Enugu, Nigeria
- Phone: 08064093705, 08123817997
- WhatsApp: 08064093705
- Hours: Monday - Saturday, 8am - 6pm

You help customers with:
1. Finding products (phones, accessories, tablets, earphones, chargers, cases)
2. Answering questions about prices, availability and product specs
3. Explaining how to place orders, track orders, use the website
4. Providing store information and contact details
5. Helping with cart, wishlist, and delivery questions
6. Recommending products based on budget and needs

Delivery Info:
- Door delivery: ₦1,500 (1-2 business days, free above ₦50,000)
- Store pickup: FREE (ready in 24 hours)

Payment Methods:
- Bank Transfer (MONIEPOINT - 8035604475 - NWONU VICTOR CHISOM)
- Cash on Delivery (Enugu only)
- USSD (*737# GTBank, *770# UBA, *919# Access)
- WhatsApp payment proof

Be friendly, helpful, and concise. Respond in the same language the user writes in. Always refer to the store as "JOE, BEST" or "G.S.M WORLD". If asked about products, mention you can help them search the shop.`;

export default function AIAssistant() {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `👋 Hi${currentUser?.displayName ? ` ${currentUser.displayName.split(" ")[0]}` : ""}! I'm the G.S.M WORLD AI Assistant.\n\nI can help you find phones, accessories, answer questions about orders, delivery, and more!\n\nHow can I help you today? 😊`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch products for context
  useEffect(() => {
    async function fetchProducts() {
      try {
        const snap = await getDocs(collection(db, "products"));
        const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setProducts(data);
      } catch (e) {
        console.error(e);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    if (open && !minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open, minimized]);

  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, minimized]);

  function buildProductContext() {
    if (products.length === 0) return "";
    const list = products
      .slice(0, 20)
      .map(
        (p) =>
          `- ${p.name} (${p.brand}) | ₦${p.price?.toLocaleString()} | ${p.category} | ${p.condition || "New"} | Stock: ${p.stock > 0 ? "Available" : "Out of stock"}`,
      )
      .join("\n");
    return `\n\nCurrent Products in Store:\n${list}`;
  }

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const productContext = buildProductContext();
      const systemWithProducts = SYSTEM_PROMPT + productContext;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemWithProducts,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const assistantMessage = {
        role: "assistant",
        content:
          data.content?.[0]?.text ||
          "Sorry, I couldn't process that. Please try again.",
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (e) {
      console.error(e);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again or contact us on WhatsApp: 08064093705 📞",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function clearChat() {
    setMessages([
      {
        role: "assistant",
        content: `👋 Chat cleared! How can I help you today? 😊`,
      },
    ]);
  }

  const QUICK_QUESTIONS = [
    "What phones do you have?",
    "How do I place an order?",
    "What are your delivery options?",
    "How do I pay?",
  ];

  return (
    <>
      {/* Chat Window */}
      {open && (
        <div className={`ai-chat-window ${minimized ? "minimized" : ""}`}>
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-avatar-dot">
                <img src="/logo.png" alt="AI" />
                <span className="ai-online-dot" />
              </div>
              <div>
                <p className="ai-chat-title">G.S.M WORLD Assistant</p>
                <p className="ai-chat-status">
                  {loading ? "Typing..." : "Online • Always here to help"}
                </p>
              </div>
            </div>
            <div className="ai-chat-actions">
              <button
                onClick={() => setMinimized(!minimized)}
                className="ai-action-btn"
                title={minimized ? "Expand" : "Minimize"}
              >
                <FiMinus />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="ai-action-btn"
                title="Close"
              >
                <FiX />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="ai-messages">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`ai-message ${msg.role === "user" ? "user" : "assistant"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="ai-msg-avatar">
                        <img src="/logo.png" alt="AI" />
                      </div>
                    )}
                    <div className="ai-msg-bubble">
                      {msg.content.split("\n").map((line, j) => (
                        <span key={j}>
                          {line}
                          {j < msg.content.split("\n").length - 1 && <br />}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="ai-message assistant">
                    <div className="ai-msg-avatar">
                      <img src="/logo.png" alt="AI" />
                    </div>
                    <div className="ai-msg-bubble ai-typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length <= 1 && (
                <div className="ai-quick-questions">
                  {QUICK_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      className="ai-quick-btn"
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => sendMessage(), 0);
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="ai-input-area">
                <div className="ai-input-wrap">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything about our products..."
                    rows={1}
                    className="ai-input"
                    disabled={loading}
                  />
                  <button
                    className="ai-send-btn"
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                  >
                    <FiSend />
                  </button>
                </div>
                <div className="ai-input-footer">
                  <span>Press Enter to send • Shift+Enter for new line</span>
                  <button onClick={clearChat} className="ai-clear-btn">
                    Clear chat
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Float Button */}
      <button
        className={`ai-float-btn ${open ? "active" : ""}`}
        onClick={() => {
          setOpen(!open);
          setMinimized(false);
        }}
        title="Chat with AI Assistant"
      >
        {open ? <FiX /> : <FiMessageCircle />}
        {!open && <span className="ai-float-label">Ask AI</span>}
      </button>
    </>
  );
}
