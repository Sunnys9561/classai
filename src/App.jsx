import { useEffect, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";

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

function App() {
  const [knowledge, setKnowledge] = useState(defaultKnowledge);

  const [messages, setMessages] = useState([
    {
      type: "ai",
      text: `Hi 👋 मी ${defaultKnowledge.className} चा AI Admission Assistant आहे. तुम्हाला course, fees, batch किंवा demo बद्दल काहीही विचारू शकता.`,
    },
  ]);

  const [input, setInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [showLeadForm, setShowLeadForm] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  const [setupData, setSetupData] = useState(defaultKnowledge);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Current class ID
  const [classId, setClassId] = useState(null);

  // Lead form
  const [leadName, setLeadName] = useState("");
  const [leadMobile, setLeadMobile] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadMessage, setLeadMessage] = useState("");

  // Owner dashboard
  const [leads, setLeads] = useState([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsMessage, setLeadsMessage] = useState("");

  // Authentication
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authMessage, setAuthMessage] = useState("");

  /*
   * LOAD OWNER'S CLASS
   */
  const loadClassInformation = async (userId) => {
    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Class loading error:", error);
      return;
    }

    if (data) {
      setClassId(data.id);

      const classData = {
        className: data.class_name,
        course: data.course,
        fees: data.fees,
        batch: data.batch,
        timing: data.timing,
        location: data.location,
        demo: data.demo,
      };

      setKnowledge(classData);
      setSetupData(classData);

      setMessages([
        {
          type: "ai",
          text: `Hi 👋 मी ${classData.className} चा AI Admission Assistant आहे. तुम्हाला course, fees, batch किंवा demo बद्दल काहीही विचारू शकता.`,
        },
      ]);
    }
  };

  /*
   * LOAD OWNER LEADS
   */
  const loadLeads = async () => {
    if (!user) {
      return;
    }

    setLeadsLoading(true);
    setLeadsMessage("");

    let query = supabase
      .from("leads")
      .select("id, class_id, student_name, mobile, created_at")
      .order("created_at", { ascending: false });

    if (classId) {
      query = query.eq("class_id", classId);
    } else {
      const { data: ownerClass, error: classError } = await supabase
        .from("classes")
        .select("id")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (classError) {
        console.error("Owner class error:", classError);
        setLeadsMessage("Could not find your class.");
        setLeads([]);
        setLeadsLoading(false);
        return;
      }

      if (!ownerClass) {
        setLeads([]);
        setLeadsMessage("Please setup your class first.");
        setLeadsLoading(false);
        return;
      }

      setClassId(ownerClass.id);
      query = query.eq("class_id", ownerClass.id);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Lead loading error:", error);
      setLeadsMessage(`Could not load leads: ${error.message}`);
      setLeads([]);
      setLeadsLoading(false);
      return;
    }

    setLeads(data || []);
    setLeadsLoading(false);
  };

  /*
   * DELETE LEAD
   */
  const deleteLead = async (leadId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this lead?"
    );

    if (!confirmed) {
      return;
    }

    const { error } = await supabase
      .from("leads")
      .delete()
      .eq("id", leadId);

    if (error) {
      console.error("Delete lead error:", error);
      alert(`Could not delete lead: ${error.message}`);
      return;
    }

    setLeads((prev) =>
      prev.filter((lead) => lead.id !== leadId)
    );
  };

  /*
   * OPEN DASHBOARD
   */
  const openDashboard = async () => {
    if (!user) {
      setAuthMode("login");
      setAuthMessage("");
      setShowAuth(true);
      return;
    }

    setShowDashboard(true);
    await loadLeads();
  };

  /*
   * CHECK LOGIN SESSION
   */
  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        await loadClassInformation(session.user.id);
      }
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadClassInformation(session.user.id);
        } else {
          setClassId(null);
          setLeads([]);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /*
   * CHAT
   */
  const sendMessage = async (question = input) => {
    const text = question.trim();

    if (!text || aiLoading) return;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text,
      },
    ]);

    setInput("");
    setAiLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke(
        "classai-chat",
        {
          body: {
            question: text,
            classInfo: {
              class_name: knowledge.className,
              course: knowledge.course,
              fees: knowledge.fees,
              batch: knowledge.batch,
              timing: knowledge.timing,
              location: knowledge.location,
              demo: knowledge.demo,
            },
          },
        }
      );

      if (error) {
        console.error("ClassAI chat error:", error);
        throw error;
      }

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text:
            data?.answer ||
            "Sorry, I could not generate an answer right now.",
        },
      ]);
    } catch (error) {
      console.error("Gemini chat failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Sorry, I’m having trouble answering right now. Please try again.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  /*
   * SETUP FORM
   */
  const updateSetup = (field, value) => {
    setSetupData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /*
   * OPEN OWNER SETUP
   */
  const openOwnerSetup = () => {
    if (!user) {
      setAuthMessage("");
      setShowAuth(true);
      return;
    }

    setShowSetup(true);
  };

  /*
   * SAVE CLASS TO SUPABASE
   */
  const saveKnowledge = async () => {
    if (!user) {
      setShowSetup(false);
      setShowAuth(true);
      return;
    }

    if (
      !setupData.className.trim() ||
      !setupData.course.trim() ||
      !setupData.fees.trim()
    ) {
      alert("Please fill Class Name, Course and Fees.");
      return;
    }

    const classRecord = {
      owner_id: user.id,
      class_name: setupData.className,
      course: setupData.course,
      fees: setupData.fees,
      batch: setupData.batch,
      timing: setupData.timing,
      location: setupData.location,
      demo: setupData.demo,
    };

    const {
      data: existingClass,
      error: existingError,
    } = await supabase
      .from("classes")
      .select("id")
      .eq("owner_id", user.id)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error(existingError);
      alert("Could not check your class information.");
      return;
    }

    let error;
    let savedClassId = existingClass?.id ?? null;

    if (existingClass) {
      const result = await supabase
        .from("classes")
        .update(classRecord)
        .eq("id", existingClass.id)
        .eq("owner_id", user.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("classes")
        .insert(classRecord)
        .select("id")
        .single();

      error = result.error;

      if (result.data) {
        savedClassId = result.data.id;
      }
    }

    if (error) {
      console.error("Save error:", error);
      alert(`Could not save class information: ${error.message}`);
      return;
    }

    setClassId(savedClassId);
    setKnowledge(setupData);

    setMessages([
      {
        type: "ai",
        text: `Hi 👋 मी ${setupData.className} चा AI Admission Assistant आहे. तुम्हाला course, fees, batch किंवा demo बद्दल काहीही विचारू शकता.`,
      },
    ]);

    setShowSetup(false);

    alert("Class information saved to Supabase successfully!");
  };

  /*
   * SAVE STUDENT LEAD
   */
  const submitLead = async () => {
    setLeadMessage("");

    const name = leadName.trim();
    const mobile = leadMobile.trim();

    if (!name) {
      setLeadMessage("Please enter your name.");
      return;
    }

    if (!mobile) {
      setLeadMessage("Please enter your mobile number.");
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, "");

    if (cleanMobile.length < 10) {
      setLeadMessage("Please enter a valid mobile number.");
      return;
    }

    if (!classId) {
      setLeadMessage(
        "Class information is not available yet. Please try again."
      );
      return;
    }

    setLeadLoading(true);

    const { error } = await supabase
      .from("leads")
      .insert({
        class_id: classId,
        student_name: name,
        mobile: mobile,
      });

    if (error) {
      console.error("Lead save error:", error);
      setLeadMessage(
        `Could not submit your request: ${error.message}`
      );
      setLeadLoading(false);
      return;
    }

    setLeadLoading(false);

    alert(
      "🎉 Demo request submitted successfully! The coaching class can now contact you."
    );

    setLeadName("");
    setLeadMobile("");
    setLeadMessage("");
    setShowLeadForm(false);
  };

  /*
   * LOGIN / SIGNUP
   */
  const handleAuth = async () => {
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthMessage("Please enter email and password.");
      return;
    }

    if (authPassword.length < 6) {
      setAuthMessage("Password must be at least 6 characters.");
      return;
    }

    setAuthLoading(true);
    setAuthMessage("");

    if (authMode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email: authEmail.trim(),
        password: authPassword,
      });

      if (error) {
        setAuthMessage(error.message);
        setAuthLoading(false);
        return;
      }

      if (data.session) {
        setShowAuth(false);
        setAuthEmail("");
        setAuthPassword("");
        setAuthMessage("");
        setShowSetup(true);
      } else {
        setAuthMessage(
          "Account created! You can now login with your email and password."
        );
      }
    } else {
      const {
        data,
        error,
      } = await supabase.auth.signInWithPassword({
        email: authEmail.trim(),
        password: authPassword,
      });

      if (error) {
        setAuthMessage(error.message);
        setAuthLoading(false);
        return;
      }

      setUser(data.user);
      setShowAuth(false);
      setAuthEmail("");
      setAuthPassword("");
      setAuthMessage("");
      setShowSetup(true);
    }

    setAuthLoading(false);
  };

  /*
   * LOGOUT
   */
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setUser(null);
    setClassId(null);
    setLeads([]);
    setShowSetup(false);
    setShowDashboard(false);

    alert("Logged out successfully.");
  };

  /*
   * FORMAT DATE
   */
  const formatLeadDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        Loading ClassAI...
      </div>
    );
  }

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

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >

          {user && (
            <button
              className="secondary-button"
              onClick={openDashboard}
              style={{
                padding: "10px 14px",
                fontSize: "13px",
              }}
            >
              📊 Dashboard
            </button>
          )}

          {user && (
            <button
              className="secondary-button"
              onClick={handleLogout}
              style={{
                padding: "10px 14px",
                fontSize: "13px",
              }}
            >
              Logout
            </button>
          )}

          <button
            className="nav-button"
            onClick={openOwnerSetup}
          >
            {user ? "Owner Setup" : "Owner Login"}
          </button>

        </div>

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
              onClick={openOwnerSetup}
            >
              {user ? "Setup Your Class" : "Owner Login"}
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
                onClick={() => {
                  setLeadMessage("");
                  setShowLeadForm(true);
                }}
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

      {/* AUTH MODAL */}
      {showAuth && (

        <div
          className="modal-overlay"
          onClick={() => setShowAuth(false)}
        >

          <div
            className="lead-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-button"
              onClick={() => setShowAuth(false)}
            >
              ×
            </button>

            <div className="modal-icon">
              🔐
            </div>

            <h2>
              {authMode === "login"
                ? "Owner Login"
                : "Create Owner Account"}
            </h2>

            <p>
              {authMode === "login"
                ? "Login to manage your coaching class."
                : "Create an account to start using ClassAI."}
            </p>

            <input
              type="email"
              placeholder="Owner Email"
              value={authEmail}
              onChange={(e) =>
                setAuthEmail(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) =>
                setAuthPassword(e.target.value)
              }
            />

            {authMessage && (
              <p
                style={{
                  margin: "10px 0",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                {authMessage}
              </p>
            )}

            <button
              className="primary-button full-button"
              onClick={handleAuth}
              disabled={authLoading}
            >
              {authLoading
                ? "Please wait..."
                : authMode === "login"
                ? "Login"
                : "Create Account"}
            </button>

            <button
              type="button"
              className="secondary-button full-button"
              onClick={() => {
                setAuthMessage("");
                setAuthMode(
                  authMode === "login"
                    ? "signup"
                    : "login"
                );
              }}
              style={{
                marginTop: "10px",
              }}
            >
              {authMode === "login"
                ? "Create New Account"
                : "Already have an account? Login"}
            </button>

          </div>

        </div>

      )}

      {/* OWNER DASHBOARD */}
      {showDashboard && user && (

        <div
          className="modal-overlay"
          onClick={() => setShowDashboard(false)}
        >

          <div
            className="lead-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
            style={{
              width: "min(900px, 94vw)",
              maxWidth: "900px",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >

            <button
              className="close-button"
              onClick={() => setShowDashboard(false)}
            >
              ×
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                marginBottom: "20px",
                paddingRight: "30px",
              }}
            >

              <div>
                <div className="modal-icon">
                  📊
                </div>

                <h2 style={{ marginBottom: "5px" }}>
                  Owner Dashboard
                </h2>

                <p style={{ margin: 0 }}>
                  Manage your student leads.
                </p>
              </div>

              <button
                className="secondary-button"
                onClick={loadLeads}
                disabled={leadsLoading}
              >
                {leadsLoading
                  ? "Refreshing..."
                  : "↻ Refresh"}
              </button>

            </div>

            {/* STATS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "15px",
                marginBottom: "25px",
              }}
            >

              <div
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  background: "#f5f7ff",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: "700",
                    marginBottom: "5px",
                  }}
                >
                  {leads.length}
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.7,
                  }}
                >
                  Total Leads
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  background: "#f5f7ff",
                  border: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    fontSize: "30px",
                    fontWeight: "700",
                    marginBottom: "5px",
                  }}
                >
                  🎯
                </div>

                <div
                  style={{
                    fontSize: "14px",
                    opacity: 0.7,
                  }}
                >
                  Demo Requests
                </div>
              </div>

            </div>

            {leadsMessage && (
              <div
                style={{
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "12px",
                  background: "#fff7ed",
                  fontSize: "14px",
                }}
              >
                {leadsMessage}
              </div>
            )}

            {/* EMPTY STATE */}
            {!leadsLoading && leads.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "45px 20px",
                  border: "1px dashed #d1d5db",
                  borderRadius: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "42px",
                    marginBottom: "10px",
                  }}
                >
                  📭
                </div>

                <h3>
                  No leads yet
                </h3>

                <p
                  style={{
                    opacity: 0.7,
                  }}
                >
                  When students submit the demo form,
                  their leads will appear here.
                </p>
              </div>
            )}

            {/* LEADS */}
            {leads.length > 0 && (

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >

                {leads.map((lead, index) => (

                  <div
                    key={lead.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "15px",
                      padding: "18px",
                      border: "1px solid #e5e7eb",
                      borderRadius: "16px",
                      background: "#ffffff",
                    }}
                  >

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        minWidth: 0,
                      }}
                    >

                      <div
                        style={{
                          width: "45px",
                          height: "45px",
                          minWidth: "45px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#eef2ff",
                          fontWeight: "700",
                        }}
                      >
                        {index + 1}
                      </div>

                      <div
                        style={{
                          minWidth: 0,
                        }}
                      >

                        <strong
                          style={{
                            display: "block",
                            fontSize: "16px",
                            marginBottom: "4px",
                          }}
                        >
                          {lead.student_name}
                        </strong>

                        <a
                          href={`tel:${lead.mobile}`}
                          style={{
                            display: "block",
                            fontSize: "14px",
                            textDecoration: "none",
                          }}
                        >
                          📞 {lead.mobile}
                        </a>

                        <small
                          style={{
                            display: "block",
                            marginTop: "5px",
                            opacity: 0.6,
                          }}
                        >
                          {formatLeadDate(
                            lead.created_at
                          )}
                        </small>

                      </div>

                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexShrink: 0,
                      }}
                    >

                      <a
                        href={`tel:${lead.mobile}`}
                        className="primary-button"
                        style={{
                          textDecoration: "none",
                          padding: "9px 12px",
                          fontSize: "13px",
                        }}
                      >
                        📞 Call
                      </a>

                      <button
                        className="secondary-button"
                        onClick={() =>
                          deleteLead(lead.id)
                        }
                        style={{
                          padding: "9px 12px",
                          fontSize: "13px",
                        }}
                      >
                        🗑️
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

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
          onClick={() => {
            if (!leadLoading) {
              setShowLeadForm(false);
            }
          }}
        >

          <div
            className="lead-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <button
              className="close-button"
              onClick={() => {
                if (!leadLoading) {
                  setShowLeadForm(false);
                }
              }}
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
              value={leadName}
              onChange={(e) =>
                setLeadName(e.target.value)
              }
            />

            <input
              type="tel"
              placeholder="Mobile Number"
              value={leadMobile}
              onChange={(e) =>
                setLeadMobile(e.target.value)
              }
            />

            {leadMessage && (
              <p
                style={{
                  margin: "10px 0",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              >
                {leadMessage}
              </p>
            )}

            <button
              className="primary-button full-button"
              onClick={submitLead}
              disabled={leadLoading}
            >
              {leadLoading
                ? "Submitting..."
                : "Submit Request"}
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;