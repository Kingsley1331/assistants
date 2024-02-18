"use client";
import { useState, useEffect, useId } from "react";
import axios from "axios";

const Assistant = ({ params: { assistantId } }) => {
  const [messages, setMessages] = useState([]);
  const [assistant, setAssistant] = useState([]);
  const [selectedThread, setSelectedThread] = useState("");
  const [threads, setThreads] = useState([]);
  const [thread, setThread] = useState([]);
  const [userInput, setUserInput] = useState("What is the mass of the sun?");
  const [assistantList, setAssistantList] = useState("");
  console.log("assistantId", assistantId);

  const convertThreadToMessages = (thread, name) => {
    const messages = thread?.map((message) => {
      if (!name && message.role === "assistant") {
        name = "Assistant";
      }

      return {
        id: message.id,
        content: message.content[0].text.value,
        role: message.role,
        name: name ? name : "User",
      };
    });
    return messages;
  };

  const handleChange = (e) => {
    setUserInput(e.target.value);
  };

  const send = (e) => {
    axios
      .post(`/api/message/${selectedThread}`, {
        userInput: { message: userInput, assistantId },
        threadId: selectedThread,
      })
      .then((res) => {
        console.log(res.data);
        // setMessages(res.data.messages);
        setThread(res.data.messages);
      });
  };

  const getMessages = async (threadId) => {
    setSelectedThread(threadId);
    axios
      .get(`/api/thread/${threadId}`)
      .then((res) => res)
      .then(({ data }) => {
        console.log("get data ==>", data);
        if (data?.messages) {
          setThread(data.messages?.data?.reverse()); // do this on the server
        }
        // if (assistants.assistantList.length) {
        //   setAssistantList(assistants.assistantList);
        // } else {
        //   setAssistantList(data?.assistantList);
        // }
      });
  };

  useEffect(() => {
    axios.get(`/api/assistant/${assistantId}`).then(({ data }) => {
      const { assistant, threads } = data;
      console.log("get data ==>", data);
      setAssistant(assistant);
      setThreads(threads);
    });
  }, [assistantId]);

  console.log("thread", thread);
  return (
    <div>
      <h1>{assistant?.name}</h1>
      <input
        style={{ width: "100%" }}
        onChange={handleChange}
        type="text"
        placeholder="Please ask anything you want"
        value={userInput}
      />
      <br />
      <button onClick={send}>Send</button>
      {threads.map((thread, indx) => (
        <div
          className={thread === selectedThread && "bg-twitter-blue"}
          key={thread}
          role="button"
          onClick={() => {
            getMessages(thread);
            setSelectedThread(thread);
          }}
        >{`Thread ${indx + 1}`}</div>
      ))}
      {convertThreadToMessages(thread, assistant.name).map((message) => {
        const { content, role, name, id } = message;
        const text = typeof content === "string" ? content : content[0]?.text;
        return (
          <div key={id}>
            <h3>
              <strong>{role}</strong>
            </h3>
            <p>{text}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Assistant;

// http://localhost:3000/assistant/asst_nsN6ZIzVHRtkL89Lwyg1deO4
