import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Cloud,
  Heart,
  Smile,
  Moon,
  Flower2,
  UserRound,
  Settings,
  MoreVertical,
  History,
  PlusCircle,
  Send,
  Paperclip,
  SmilePlus,
  X
} from "lucide-react";
import "./index.css";

const moods = [
  { name: "Anxious", icon: Cloud },
  { name: "Lonely", icon: Heart },
  { name: "Overwhelmed", icon: Smile },
  { name: "Restless", icon: Moon },
  { name: "Quiet", icon: Flower2 },
];

const initialMessages = [
  {
    type: "bot",
    text: "Hello! I'm Aria. I've noticed you're feeling a bit overwhelmed today. It's perfectly okay to feel that way. I'm here to listen or just sit in the quiet with you. What's on your mind right now?",
    time: "10:02 AM",
  },
  {
    type: "user",
    text: "Everything just feels like it's moving too fast. I can't seem to catch my breath with all the tasks piling up at work.",
    time: "10:05 AM",
  },
  {
    type: "bot",
    text: "That sounds really heavy. When the world spins that fast, sometimes the best thing we can do is find one small, still point. Shall we try a 2-minute grounding exercise together, or would you prefer to just vent some more?",
    time: "10:06 AM",
  },
];

function RobotAvatar({ small = false }) {
  return (
    <div
      className={[
        "relative flex items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_42%,#dffdf7_0%,#7dd5d0_34%,#165b5b_78%,#123f42_100%)] robot-glow",
        small ? "h-9 w-9" : "h-16 w-16"
      ].join(" ")}
    >
      <div className={small ? "text-[18px]" : "text-[32px]"}>🤖</div>
      {!small && (
        <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-[#537a77] ring-2 ring-white" />
      )}
    </div>
  );
}

function App() {
  const [activeMood, setActiveMood] = useState("Overwhelmed");
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const sendMessage = (text = input) => {
    const value = text.trim();
    if (!value) return;

    setMessages((current) => [
      ...current,
      { type: "user", text: value, time: "10:08 AM" },
    ]);
    setInput("");
  };

  const quickReplies = [
    "Let's try the exercise",
    "I need to vent more",
    "Tell me a gentle story",
    "Just sit with me",
  ];

  return (
    <div className="min-h-screen bg-[#f7f7f5] text-[#314a49]">
      {/* Top navigation */}
      <header className="carebridge-sans flex h-12 items-center justify-between border-b border-[#e9e9e6] bg-white px-7">
        <div className="logo-font text-[20px] font-semibold tracking-tight text-[#236667]">
          CareBridge
        </div>

        <nav className="desktop-nav flex h-full items-center gap-7 text-[12px] text-[#5d6565]">
          <a href="#" className="hover:text-[#236667]">Home</a>
          <a href="#" className="hover:text-[#236667]">About Us</a>
          <a
            href="#"
            className="flex h-full items-center border-b-2 border-[#277473] font-semibold text-[#236667]"
          >
            Contact Us
          </a>
        </nav>

        <button className="carebridge-sans rounded-md bg-[#286d6c] px-8 py-2 text-[12px] font-medium text-white shadow-sm hover:bg-[#205e5d]">
          Get Started
        </button>
      </header>

      {/* Main application */}
      <main className="flex min-h-[calc(100vh-84px)]">
        {/* Sidebar */}
        <aside className="sidebar flex w-[156px] shrink-0 flex-col border-r border-[#dedfdd] bg-[#f5f5f3]">
          <div className="flex flex-col items-center border-b border-[#e4e4e1] px-3 pb-5 pt-8">
            <RobotAvatar />
            <h2 className="logo-font mt-9 text-center text-[17px] leading-6 text-[#52706d]">
              How are you
              <br />
              today?
            </h2>
          </div>

          <div className="carebridge-sans flex flex-col gap-2 px-3 py-4">
            {moods.map(({ name, icon: Icon }) => {
              const active = name === activeMood;
              return (
                <button
                  key={name}
                  onClick={() => setActiveMood(name)}
                  className={[
                    "flex h-10 items-center gap-3 rounded-lg px-4 text-left text-[11px] transition",
                    active
                      ? "border border-[#a6ded8] bg-[#c8eee9] text-[#355d5b]"
                      : "bg-[#e9e9e8] text-[#4f5e5d] hover:bg-[#e1e6e5]"
                  ].join(" ")}
                >
                  <Icon size={17} strokeWidth={1.7} />
                  <span className="mood-label">{name}</span>
                </button>
              );
            })}
          </div>

          <button className="carebridge-sans mt-auto flex items-center gap-2 px-8 pb-7 text-[9px] text-[#4e5a59] hover:text-[#226968]">
            <History size={11} />
            View History
          </button>
        </aside>

        {/* Chat panel */}
        <section className="flex min-w-0 flex-1 flex-col">
          {/* Chat heading */}
          <div className="flex h-12 shrink-0 items-center justify-between border-b border-[#dfe3e2] bg-[#f7f7f5] px-5">
            <div>
              <h1 className="logo-font text-[17px] leading-5 text-[#536b68]">
                Aria — AI Companion
              </h1>
              <p className="carebridge-sans mt-0.5 flex items-center gap-1 text-[8px] text-[#687c79]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#487f78]" />
                Listening carefully
              </p>
            </div>

            <div className="relative flex items-center gap-4 text-[#3f4d4c]">
              <button aria-label="Settings" className="hover:text-[#226968]">
                <Settings size={17} strokeWidth={1.8} />
              </button>
              <button
                aria-label="More options"
                onClick={() => setMenuOpen((v) => !v)}
                className="hover:text-[#226968]"
              >
                <MoreVertical size={18} strokeWidth={1.8} />
              </button>
              {menuOpen && (
                <div className="carebridge-sans absolute right-0 top-7 z-20 w-32 rounded-lg border border-[#ddd] bg-white p-1 text-[10px] shadow-lg">
                  <button className="w-full rounded px-2 py-2 text-left hover:bg-[#f0f4f3]">
                    Clear chat
                  </button>
                  <button className="w-full rounded px-2 py-2 text-left hover:bg-[#f0f4f3]">
                    Export chat
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-[#d8e9f4] px-5 py-7">
            <div className="mx-auto flex max-w-[680px] flex-col gap-7">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={[
                    "flex items-start gap-4",
                    message.type === "user" ? "justify-end" : "justify-start"
                  ].join(" ")}
                >
                  {message.type === "bot" && <RobotAvatar small />}

                  <div
                    className={[
                      "message-shadow max-w-[82%] rounded-[15px] px-5 py-4",
                      message.type === "bot"
                        ? "rounded-tl-[3px] bg-white"
                        : "rounded-tr-[3px] bg-[#c8eee9]"
                    ].join(" ")}
                  >
                    <p className="logo-font text-[12px] leading-[1.75] text-[#384a49]">
                      {message.text}
                    </p>
                    <p className="carebridge-sans mt-1 text-[7px] text-[#a4b0af]">
                      {message.time}
                    </p>
                  </div>

                  {message.type === "user" && (
                    <div className="hidden w-9 shrink-0 sm:block" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Composer area */}
          <div className="shrink-0 border-t border-[#dedfdd] bg-[#fafaf9] px-5 pb-5 pt-5">
            <div className="mx-auto max-w-[700px]">
              <div className="mb-5 flex flex-wrap justify-center gap-3">
                {quickReplies.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => sendMessage(reply)}
                    className="carebridge-sans rounded-full border border-[#cfd7d5] bg-white px-4 py-2 text-[9px] font-medium text-[#53615f] shadow-sm transition hover:border-[#91c7c1] hover:bg-[#f1f8f6]"
                  >
                    {reply}
                  </button>
                ))}
              </div>

              <div className="flex h-[52px] items-center gap-3 rounded-[11px] border border-[#cdd6d4] bg-white px-3 shadow-sm">
                <button
                  aria-label="Add attachment"
                  className="rounded-full p-1 text-[#536260] hover:bg-[#edf2f1]"
                >
                  <PlusCircle size={17} strokeWidth={1.8} />
                </button>

                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Share what's on your heart..."
                  className="carebridge-sans min-w-0 flex-1 bg-transparent text-[10px] text-[#415250] outline-none placeholder:text-[#9ba5a3]"
                />

                <button
                  aria-label="Emoji"
                  className="rounded-full p-1 text-[#536260] hover:bg-[#edf2f1]"
                >
                  <SmilePlus size={17} strokeWidth={1.7} />
                </button>

                <button
                  onClick={() => sendMessage()}
                  aria-label="Send"
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#456c69] text-white shadow-sm transition hover:bg-[#315b58]"
                >
                  <Send size={17} strokeWidth={1.8} />
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="carebridge-sans flex h-9 items-center justify-between border-t border-[#dedfdd] bg-[#f4f4f2] px-14 text-[8px] text-[#596361]">
        <span>© 2024 CareBridge. All rights reserved. Your safety is our priority.</span>
        <div className="flex gap-5">
          <a href="#" className="underline hover:text-[#246c69]">Privacy Policy</a>
          <a href="#" className="underline hover:text-[#246c69]">Terms of Service</a>
          <a href="#" className="font-semibold underline hover:text-[#246c69]">Crisis Resources</a>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);