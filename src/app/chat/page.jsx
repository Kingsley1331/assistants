"use client";
import { useChat } from "ai/react";
import Navigation from "../components/Navigation";

const Chat = () => {
  const { input, handleInputChange, handleSubmit, isLoading, messages } =
    useChat({ api: "/api/chat", initialInput: "What is an apple?" });

  return (
    <div>
      <Navigation />
      <h1>Chat</h1>
      <form className="mt-12" onSubmit={handleSubmit}>
        <input
          style={{ width: "100%" }}
          onChange={handleInputChange}
          type="text"
          placeholder="Please ask anything you want"
          value={input}
        />
        <br />
        <button>Send</button>
        {messages.map((message) => {
          const { content } = message;
          const text = typeof content === "string" ? content : content[0]?.text;
          return <div key={content}>{text}</div>;
        })}
      </form>
    </div>
  );
};

export default Chat;
