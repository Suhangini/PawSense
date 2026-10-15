import { useState, useEffect } from "react";
import {
  startEmergency,
  continueEmergency,
  getMyPet,
} from "../services/emergencyService";
import BackToDashboard from "../components/BackToDashboard";
import "../styles/Emergency.css";
import logo from "../assets/images/logo.png";

function Emergency() {
  const [petName, setPetName] = useState("");
  const [petLoading, setPetLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load the logged-in user's pet profile.
  useEffect(() => {
    const loadPet = async () => {
      try {
        const pet = await getMyPet();
        setPetName(pet?.petName || "your pet");
      } catch (error) {
        console.error("Failed to load pet profile:", error);
        setPetName("your pet");
      } finally {
        setPetLoading(false);
      }
    };

    loadPet();
  }, []);

  // Send a message to the existing emergency conversation service.
  const handleSend = async () => {
    const userMessage = message.trim();
    if (!userMessage || loading || petLoading || !petName) return;

    setMessages((previous) => [
      ...previous,
      { sender: "user", text: userMessage },
    ]);
    setMessage("");
    setLoading(true);

    try {
      let response;

      if (!conversationId) {
        response = await startEmergency(petName, userMessage);
        if (response?.conversation_id) {
          setConversationId(response.conversation_id);
        }
      } else {
        response = await continueEmergency(conversationId, userMessage);
      }

      if (response?.status === "question") {
        setMessages((previous) => [
          ...previous,
          { sender: "bot", text: response.question },
        ]);
      } else if (response?.status === "complete") {
        setMessages((previous) => [
          ...previous,
          { sender: "bot", text: response.message },
        ]);
      } else {
        setMessages((previous) => [
          ...previous,
          {
            sender: "bot",
            text: "I couldn't interpret that response. Please try describing the symptoms again.",
          },
        ]);
      }
    } catch (error) {
      console.error(
        "Emergency request failed:",
        error?.response?.data || error?.message || error
      );
      setMessages((previous) => [
        ...previous,
        {
          sender: "bot",
          text: "Sorry, something went wrong while processing the request. Please try again. If your pet may be in immediate danger, contact a veterinarian now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="emergency-page">
      <header className="emergency-header">
        <div className="emergency-header-left">
          <BackToDashboard />
          <div className="emergency-heading-copy">
            <span className="emergency-eyebrow">PAWSENSE AI</span>
            <h1 className="emergency-title">Emergency First-Aid</h1>
            <p className="emergency-subtitle">
              Calm, step-by-step guidance when your pet needs help
            </p>
          </div>
        </div>

        <div className="emergency-header-brand" aria-label="PawSense">
          <span className="emergency-brand-mark">
            <img src={logo} alt="" />
          </span>
          <span>PawSense</span>
        </div>
      </header>

      <main className="emergency-content">
        <section className="emergency-intro" aria-labelledby="emergency-intro-title">
          <div className="emergency-intro-top">
            <div className="emergency-intro-icon">
              <img src={logo} alt="PawSense pet care" />
            </div>

            <div className="emergency-intro-text">
              <div className="emergency-intro-kicker">
                <span className="emergency-status-dot" />
                EMERGENCY SUPPORT
              </div>
              <h2 id="emergency-intro-title">
                What’s happening with {petLoading ? "your pet" : petName}?
              </h2>
              <p>
                Describe what you’re noticing in your own words. PawSense will
                ask a few questions to understand the situation and provide
                relevant first-aid information.
              </p>
            </div>
          </div>

          <div className="emergency-steps" aria-label="How it works">
            <div className="emergency-step">
              <span className="emergency-step-number">01</span>
              <span className="emergency-step-copy">
                <strong>Describe</strong>
                <small>Tell us what you notice</small>
              </span>
            </div>
            <span className="emergency-step-line" aria-hidden="true" />
            <div className="emergency-step">
              <span className="emergency-step-number">02</span>
              <span className="emergency-step-copy">
                <strong>Answer</strong>
                <small>Reply to a few questions</small>
              </span>
            </div>
            <span className="emergency-step-line" aria-hidden="true" />
            <div className="emergency-step">
              <span className="emergency-step-number">03</span>
              <span className="emergency-step-copy">
                <strong>Get guidance</strong>
                <small>Review first-aid information</small>
              </span>
            </div>
          </div>

          <div className="emergency-note" role="note">
            <span className="emergency-note-icon" aria-hidden="true">!</span>
            <div>
              <strong>Important to know</strong>
              <p>
                PawSense provides general first-aid guidance and urgency
                information. It does not replace professional veterinary care.
              </p>
            </div>
          </div>
        </section>

        <section className="emergency-chat-card" aria-label="Emergency conversation">
          <div className="emergency-chat-heading">
            <div>
              <span className="emergency-chat-kicker">PAWSENSE ASSISTANT</span>
              <h2>Your conversation</h2>
            </div>
            <span className="emergency-chat-secure">Pet-care guidance</span>
          </div>

          <div className="emergency-chat" aria-live="polite" aria-relevant="additions">
            {messages.length === 0 && (
              <div className="emergency-bot-row">
                <div className="emergency-bot-icon">
                  <img src={logo} alt="" />
                </div>
                <div className="emergency-message-bubble bot-bubble">
                  <span className="emergency-message-name">PawSense</span>
                  <p>
                    {petLoading
                      ? "Loading your pet's profile..."
                      : `Tell me what is happening with ${petName}. You can describe the symptoms in your own words.`}
                  </p>
                  {!petLoading && (
                    <div className="emergency-suggestions">
                      <span>Not sure where to start?</span>
                      <button type="button" onClick={() => setMessage("My pet is having trouble breathing.")}>Breathing difficulty</button>
                      <button type="button" onClick={() => setMessage("My pet is bleeding.")}>Bleeding</button>
                      <button type="button" onClick={() => setMessage("My pet may have eaten something toxic.")}>Possible poisoning</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {messages.map((chatMessage, index) =>
              chatMessage.sender === "bot" ? (
                <div className="emergency-bot-row" key={`${index}-bot`}>
                  <div className="emergency-bot-icon">
                    <img src={logo} alt="" />
                  </div>
                  <div className="emergency-message-bubble bot-bubble">
                    <span className="emergency-message-name">PawSense</span>
                    <p>{chatMessage.text}</p>
                  </div>
                </div>
              ) : (
                <div className="emergency-user-row" key={`${index}-user`}>
                  <div className="emergency-message-bubble user-bubble">
                    <span className="emergency-message-name">You</span>
                    <p>{chatMessage.text}</p>
                  </div>
                </div>
              )
            )}

            {loading && (
              <div className="emergency-bot-row">
                <div className="emergency-bot-icon">
                  <img src={logo} alt="" />
                </div>
                <div className="emergency-message-bubble bot-bubble">
                  <div className="emergency-loading">
                    <span>PawSense is thinking</span>
                    <span className="emergency-loading-dots" aria-label="Loading">
                      <i /> <i /> <i />
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <form
            className="emergency-input-wrapper"
            onSubmit={(event) => {
              event.preventDefault();
              handleSend();
            }}
          >
            <input
              className="emergency-input"
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what is happening with your pet..."
              aria-label="Describe your pet's symptoms"
              disabled={loading || petLoading}
            />
            <button
              className="emergency-send-btn"
              type="submit"
              disabled={loading || petLoading || !message.trim()}
              aria-label="Send message"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M21.5 3.5L10.5 14.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21.5 3.5L14.5 21L10.5 14.5L3 10.5L21.5 3.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>

          <p className="emergency-disclaimer">
            If your pet has difficulty breathing, collapses, has severe bleeding,
            or may have been poisoned, contact an emergency veterinarian immediately.
          </p>
        </section>
      </main>
    </div>
  );
}

export default Emergency;
