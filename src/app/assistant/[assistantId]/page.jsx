"use client";
import { useState, useEffect, useId } from "react";
import axios from "axios";

const Assistant = ({ params: { assistantId } }) => {
  // const [messages, setMessages] = useState([]);
  const [assistant, setAssistant] = useState([]);
  const [selectedThread, setSelectedThread] = useState("");
  const [threads, setThreads] = useState([]);
  const [thread, setThread] = useState([]);
  const [userInput, setUserInput] = useState("What is the mass of the sun?");
  // const [assistantList, setAssistantList] = useState("");
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

  const startNewChat = (e) => {
    console.log("startNewChat");
    axios.post(`/api/create_chat/${assistantId}`).then(({ data }) => {
      const threadId = data.message.id;
      setThreads([...threads, threadId]);
      console.log("NEW THREAD ==>", data);
      getMessages(threadId);
      setSelectedThread(threadId);
    });
  };

  const deleteThread = (threadId) => {
    const deleteThread = window.confirm(
      "Are you sure you want to delete this thread?"
    );

    if (deleteThread) {
      console.log("delete thread");
      axios
        .delete(`/api/delete_chat/${assistantId}`, {
          data: { threadId: threadId },
        })
        .then((res) => res)
        .then(({ data }) => {
          console.log("DELETE THREAD ==>", data);
          setThreads(threads.filter((thread) => thread !== threadId));
        });
    }
  };

  const send = (e) => {
    axios
      .post(`/api/message/${selectedThread}`, {
        userInput: { message: userInput, assistantId },
      })
      .then((res) => {
        console.log(res.data);
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
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
        onClick={send}
      >
        Send
      </button>
      <table>
        {threads.map((thread, indx) => (
          <tr key={thread}>
            <td>
              <div
                className={thread === selectedThread && "bg-twitter-blue"}
                role="button"
                onClick={() => {
                  getMessages(thread);
                  setSelectedThread(thread);
                }}
              >{`Thread ${indx + 1}`}</div>
            </td>
            <td>
              <button
                onClick={() => deleteThread(thread)}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 border border-red-700 rounded"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </table>
      <button
        onClick={startNewChat}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded"
      >
        Start new chat
      </button>
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
