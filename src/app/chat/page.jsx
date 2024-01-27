"use client";
import { useState, useEffect, useId } from "react";
import axios from "axios";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("What is the mass of the sun?");

  const handleChange = (e) => {
    setUserInput(e.target.value);
  };

  const send = (e) => {
    axios
      .post("/api/chat", {
        messages: [
          ...messages,
          { role: "user", content: [{ type: "text", text: userInput }] },
        ],
      })
      .then((res) => {
        console.log(res.data);
        setMessages(res.data.messages);
      });
  };

  // useEffect(() => {
  //   axios.get("/api/chat").then(({ data }) => {
  //     console.log("get data ==>", data);
  //   });
  // }, []);

  // console.log("message", message);
  return (
    <div>
      <h1>Chat</h1>
      <input
        style={{ width: "100%" }}
        onChange={handleChange}
        type="text"
        placeholder="Please ask anything you want"
        value={userInput}
      />
      <br />
      <button onClick={send}>Send</button>
      {messages.map((message) => {
        const { content } = message;
        const text = typeof content === "string" ? content : content[0]?.text;
        return <div key={content}>{text}</div>;
      })}
    </div>
  );
};

export default Chat;
