import { useState } from "react";
import "./App.css";

const defaultKnowledge = {
  className: "ABC Coaching Classes",
  course: "Python Full Stack",
  fees: "₹8,000",
  batch: "10 October",
  timing: "7:00 PM - 9:00 PM",
  location: "Main Road, Pune",
  demo: "Yes",
};

const quickQuestions = [
  "Course कोणता आहे?",
  "Fees किती आहे?",
  "Next batch कधी आहे?",
  "Class कुठे आहे?",
  "Demo lecture आहे का?",
];

function getAIResponse(question, knowledge) {
  const q = question.toLowerCase();

  if (
    q.includes("course") ||
    q.includes("कोर्स")
  ) {
    return `${knowledge.className} मध्ये ${knowledge.course} course available आहे.`;
  }

  if (
    q.includes("fee") ||
    q.includes("fees") ||
    q.includes("फीस")
  ) {
    return `${knowledge.course} course ची fee ${knowledge.fees} आहे.`;
  }

  if (
    q.includes("batch") ||
    q.includes("start") ||
    q.includes("सुरू") ||
    q.includes("कधी")
  ) {
    return `Next batch ${knowledge.batch} पासून सुरू होते. Timing ${knowledge.timing} आहे.`;
  }

  if (
    q.includes("location") ||
    q.includes("where") ||
    q.includes("कुठे") ||
    q.includes("address")
  ) {
    return `Class location: ${knowledge.location}.`;
  }

  if (
    q.includes("demo") ||
    q.includes("डेमो")
  ) {
    if (knowledge.demo === "Yes") {
      return "हो 👍 Free demo lecture available आहे. तुम्ही खाली Book Free Demo वर click करू शकता.";
    }

    return "सध्या demo lecture available नाही.";
  }

  return `मी ${knowledge.className} बद्दल course, fees, batch, timing, location आणि demo याबद्दल माहिती देऊ शकतो.`;
}

function App() {
  const [knowledge, setKnowledge] = useState(defaultKnowledge);

  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: `Hi 👋 मी ${defaultKnowledge.className} चा AI Admission Assistant आहे. तुम्हाला course, fees, batch किंवा demo बद्दल काहीही विचारू शकता.`,
    },
  ]);

  const [input, setInput] = useState("");
  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  const [setupData, setSetupData] = useState(defaultKnowledge);

  const sendMessage = (question = input) => {
    const text = question.trim();

    if (!text) return;

    const userMessage = {
      type: "user",
      text,
    };

    const aiMessage = {
      type: "ai",
      text: getAIResponse(text, knowledge),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      aiMessage,
    ]);

    setInput("");
  };

  const updateSetup = (field, value) => {
    setSetupData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveKnowledge = () => {
    setKnowledge(setupData);

    setMessages([
      {
        type: "ai",
        text: `Hi 👋 मी ${setupData.className} चा AI Admission Assistant आहे. तुम्हाला course, fees, batch किंवा demo बद्दल काहीही विचारू शकता.`,
      },
    ]);

    setShowSetup(false);

    alert("Class information saved successfully!");
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div className="logo">
          <span className="logo-icon">✦</span>
          ClassAI
        </div>

        <div className="nav-links">
          <a href="#features">Features</a>
          <a href="#demo">Demo</a>
          <a href="#faq">FAQ</a>
        </div>

        <button
          className="nav-button"
          onClick={() => setShowSetup(true)}
        >
          Owner Setup
        </button>
      </nav>


      {/* HERO */}
      <section className="hero">

        <div className="hero-content">

          <div className="badge">
            ✨ AI Admission Assistant for Coaching Classes
          </div>

          <h1>
            Turn Student Questions
            <span> Into Admissions.</span>
          </h1>

          <p>
            ClassAI answers student questions automatically and
            captures interested students for your coaching class.
          </p>

          <div className="hero-buttons">

            <a
              href="#demo"
              className="primary-button"
            >
              See Live Demo →
            </a>

            <button
              className="secondary-button"
              onClick={() => setShowSetup(true)}
            >
              Setup Your Class
            </button>

          </div>

          <div className="trust-text">
            ✓ No credit card &nbsp;&nbsp;
            ✓ Setup in minutes
          </div>

        </div>


        {/* CHAT */}
        <div
          className="chat-wrapper"
          id="demo"
        >

          <div className="chat-window">

            <div className="chat-header">

              <div className="class-avatar">
                {knowledge.className.charAt(0)}
              </div>

              <div>
                <strong>
                  {knowledge.className}
                </strong>

                <small>
                  <span className="online-dot"></span>
                  AI Assistant online
                </small>
              </div>

            </div>


            <div className="chat-messages">

              {messages.map((message, index) => (

                <div
                  key={index}
                  className={`message ${
                    message.type === "user"
                      ? "user-message"
                      : "ai-message"
                  }`}
                >
                  {message.text}
                </div>

              ))}


              <button
                className="demo-button"
                onClick={() => setShowLeadForm(true)}
              >
                📅 Book Free Demo
              </button>

            </div>


            {/* QUICK QUESTIONS */}
            <div className="quick-questions">

              {quickQuestions.map((question) => (

                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                >
                  {question}
                </button>

              ))}

            </div>


            {/* CHAT INPUT */}
            <div className="chat-input">

              <input
                type="text"
                placeholder="Ask about courses, fees, batches..."
                value={input}
                onChange={(e) =>
                  setInput(e.target.value)
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />

              <button
                onClick={() => sendMessage()}
              >
                ➤
              </button>

            </div>

          </div>

        </div>

      </section>


      {/* FEATURES */}
      <section
        className="features"
        id="features"
      >

        <div className="section-heading">

          <span>HOW IT WORKS</span>

          <h2>
            From Question to Lead
          </h2>

          <p>
            ClassAI helps coaching classes respond
            faster and capture interested students.
          </p>

        </div>


        <div className="workflow">

          <div className="workflow-card">

            <div className="workflow-number">
              01
            </div>

            <div className="workflow-icon">
              💬
            </div>

            <h3>
              Student asks
            </h3>

            <p>
              Students ask questions about courses,
              fees, batches and demos.
            </p>

          </div>


          <div className="workflow-arrow">
            →
          </div>


          <div className="workflow-card">

            <div className="workflow-number">
              02
            </div>

            <div className="workflow-icon">
              🤖
            </div>

            <h3>
              AI answers
            </h3>

            <p>
              ClassAI provides answers based on
              your class information.
            </p>

          </div>


          <div className="workflow-arrow">
            →
          </div>


          <div className="workflow-card">

            <div className="workflow-number">
              03
            </div>

            <div className="workflow-icon">
              🎯
            </div>

            <h3>
              Lead captured
            </h3>

            <p>
              Interested students can submit
              their details for follow-up.
            </p>

          </div>

        </div>

      </section>


      {/* OWNER SETUP */}
      {showSetup && (

        <div
          className="modal-overlay"
          onClick={() => setShowSetup(false)}
        >

          <div
            className="lead-modal setup-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-button"
              onClick={() => setShowSetup(false)}
            >
              ×
            </button>

            <div className="modal-icon">
              ⚙️
            </div>

            <h2>
              Setup Your Class
            </h2>

            <p>
              Add your coaching class information.
            </p>


            <input
              type="text"
              placeholder="Class Name"
              value={setupData.className}
              onChange={(e) =>
                updateSetup(
                  "className",
                  e.target.value
                )
              }
            />


            <input
              type="text"
              placeholder="Course Name"
              value={setupData.course}
              onChange={(e) =>
                updateSetup(
                  "course",
                  e.target.value
                )
              }
            />


            <input
              type="text"
              placeholder="Course Fees"
              value={setupData.fees}
              onChange={(e) =>
                updateSetup(
                  "fees",
                  e.target.value
                )
              }
            />


            <input
              type="text"
              placeholder="Next Batch"
              value={setupData.batch}
              onChange={(e) =>
                updateSetup(
                  "batch",
                  e.target.value
                )
              }
            />


            <input
              type="text"
              placeholder="Class Timing"
              value={setupData.timing}
              onChange={(e) =>
                updateSetup(
                  "timing",
                  e.target.value
                )
              }
            />


            <input
              type="text"
              placeholder="Location"
              value={setupData.location}
              onChange={(e) =>
                updateSetup(
                  "location",
                  e.target.value
                )
              }
            />


            <select
              value={setupData.demo}
              onChange={(e) =>
                updateSetup(
                  "demo",
                  e.target.value
                )
              }
            >
              <option value="Yes">
                Free Demo Available
              </option>

              <option value="No">
                No Demo
              </option>
            </select>


            <button
              className="primary-button full-button"
              onClick={saveKnowledge}
            >
              Save Class Information
            </button>

          </div>

        </div>

      )}


      {/* FAQ */}
      <section
        className="faq-section"
        id="faq"
      >

        <div className="section-heading">

          <span>FAQ</span>

          <h2>
            Frequently Asked Questions
          </h2>

        </div>


        <div className="faq-list">

          <details>

            <summary>
              ClassAI म्हणजे काय?
            </summary>

            <p>
              ClassAI हे coaching classes साठी
              बनवलेले AI admission assistant आहे.
            </p>

          </details>


          <details>

            <summary>
              Student काय विचारू शकतो?
            </summary>

            <p>
              Courses, fees, batches, demo lectures,
              location आणि इतर class-related questions.
            </p>

          </details>


          <details>

            <summary>
              Lead कसा मिळेल?
            </summary>

            <p>
              Student interested असल्यास त्याचे
              नाव आणि mobile number submit करू शकतो.
            </p>

          </details>

        </div>

      </section>


      {/* FOOTER */}
      <footer>

        <div className="logo">
          <span className="logo-icon">
            ✦
          </span>
          ClassAI
        </div>

        <p>
          AI-powered admission assistant
          for coaching classes.
        </p>

        <span>
          © 2026 ClassAI
        </span>

      </footer>


      {/* LEAD FORM */}
      {showLeadForm && (

        <div
          className="modal-overlay"
          onClick={() =>
            setShowLeadForm(false)
          }
        >

          <div
            className="lead-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-button"
              onClick={() =>
                setShowLeadForm(false)
              }
            >
              ×
            </button>

            <div className="modal-icon">
              🎯
            </div>

            <h2>
              Book Your Free Demo
            </h2>

            <p>
              Enter your details and the
              coaching class can contact you.
            </p>

            <input
              type="text"
              placeholder="Your Name"
            />

            <input
              type="tel"
              placeholder="Mobile Number"
            />

            <button
              className="primary-button full-button"
              onClick={() => {
                alert(
                  "Demo request submitted!"
                );

                setShowLeadForm(false);
              }}
            >
              Submit Request
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;