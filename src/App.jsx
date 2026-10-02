import { useState } from "react";
import "./App.css";

const faqs = [
  {
    question: "Python course ची fees किती आहे?",
    answer: "Python Full Stack course ची fee ₹8,000 आहे."
  },
  {
    question: "Next batch कधी सुरू होते?",
    answer: "Next batch 10 October पासून सुरू होते."
  },
  {
    question: "Demo lecture आहे का?",
    answer: "हो. तुम्ही free demo lecture book करू शकता."
  }
];

function App() {
  const [selectedFaq, setSelectedFaq] = useState(null);

  return (
    <div className="app">
      <nav className="navbar">
        <div className="logo">Class<span>AI</span></div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#demo">Demo</a>
          <button>Start Free</button>
        </div>
      </nav>

      <main>
        <section className="hero">
          <div className="hero-content">
            <div className="badge">
              AI Admission Assistant for Coaching Classes
            </div>

            <h1>
              Turn Student Questions
              <span> Into Admissions.</span>
            </h1>

            <p>
              ClassAI answers student questions, captures interested leads,
              and helps coaching classes follow up faster.
            </p>

            <div className="hero-buttons">
              <button className="primary-btn">See Live Demo →</button>
              <button className="secondary-btn">Start Free</button>
            </div>

            <div className="trust">
              No credit card · Setup in minutes · AI-powered
            </div>
          </div>

          <div className="chat-card" id="demo">
            <div className="chat-header">
              <div>
                <strong>ABC Coaching Classes</strong>
                <small>AI Admission Assistant</small>
              </div>
              <div className="online">● Online</div>
            </div>

            <div className="chat-body">
              <div className="message student">
                Python course ची fees किती आहे?
              </div>

              <div className="message ai">
                Python Full Stack course ची fee ₹8,000 आहे.
                <br />
                Next batch 10 October ला सुरू होते.
              </div>

              <div className="message student">
                Demo lecture आहे का?
              </div>

              <div className="message ai">
                हो! तुम्ही free demo lecture book करू शकता.
                <button className="demo-btn">Book Demo</button>
              </div>
            </div>

            <div className="chat-input">
              <span>Ask about courses...</span>
              <button>➤</button>
            </div>
          </div>
        </section>

        <section className="workflow">
          <div>
            <small>HOW IT WORKS</small>
            <h2>From question to lead.</h2>
          </div>

          <div className="steps">
            <div>
              <b>01</b>
              <h3>Student asks</h3>
              <p>Questions about courses, fees and batches.</p>
            </div>

            <div>
              <b>02</b>
              <h3>AI answers</h3>
              <p>Instant answers using the class information.</p>
            </div>

            <div>
              <b>03</b>
              <h3>Lead captured</h3>
              <p>Interested students become actionable leads.</p>
            </div>
          </div>
        </section>

        <section className="faq" id="features">
          <small>PRODUCT DEMO</small>
          <h2>Try common student questions.</h2>

          <div className="faq-list">
            {faqs.map((faq, index) => (
              <button
                key={index}
                onClick={() =>
                  setSelectedFaq(selectedFaq === index ? null : index)
                }
              >
                <div>
                  <strong>{faq.question}</strong>
                  {selectedFaq === index && <p>{faq.answer}</p>}
                </div>
                <span>{selectedFaq === index ? "−" : "+"}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <strong>ClassAI</strong>
        <span>AI admission assistant for modern coaching classes.</span>
      </footer>
    </div>
  );
}

export default App;