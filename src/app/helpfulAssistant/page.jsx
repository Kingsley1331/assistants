"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { Input } from "@nextui-org/react";
import Navigation from "../components/Navigation";

const Chat = () => {
  const [messagesText, setMessagesText] = useState([]);
  const [assistant, setAssistant] = useState([]);
  const [selectedThread, setSelectedThread] = useState("");
  const [threads, setThreads] = useState([]);
  const [thread, setThread] = useState([]);
  const [userInput, setUserInput] = useState("What is the mass of the sun?");
  const [streamingMessage, setStreamingMessage] = useState({});
  const [threadId, setThreadId] = useState("");

  const assistantId = "asst_nsN6ZIzVHRtkL89Lwyg1deO4";

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
    fetch("/api/helpfulassistant", {
      method: "POST",
      body: JSON.stringify({
        userInput: { message: userInput, assistantId },
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      const reader = response.body.getReader();
      return new ReadableStream({
        async start(controller) {
          let textChunk = "";
          let strChunk;
          let totalMessage = "";
          while (true) {
            const { done, value } = await reader.read();

            if (done) break;
            controller.enqueue(value);
            // Process chunk here
            strChunk = new TextDecoder().decode(value).trim();

            const strServerEvents = strChunk.split("\n");
            console.log("strServerEvents", strServerEvents);
            // process each event
            for (const strServerEvent of strServerEvents) {
              // const serverEvent = strServerEvent;
              const serverEvent = JSON.parse(strServerEvent);
              console.log("serverEvent", serverEvent);
              let contentSnapshot;
              switch (serverEvent.event) {
                // create new message
                case "thread.message.created":
                  // newThreadId = serverEvent.data.thread_id;
                  setThreadId(serverEvent.data.thread_id);
                  break;

                // update streaming message content
                case "thread.message.delta":
                  contentSnapshot +=
                    serverEvent.data.delta.content[0].text.value;
                  const newStreamingMessage = {
                    ...streamingMessage,
                    content: contentSnapshot,
                  };
                  totalMessage += contentSnapshot.replaceAll("undefined", "");
                  setStreamingMessage(newStreamingMessage);
                  break;
              }
            }

            textChunk += strChunk;
            console.log("strChunk", strChunk);
            // console.log("textChunk", new TextDecoder().decode(value));

            setMessagesText([
              ...messagesText,
              {
                role: "user",
                content: [{ type: "text", text: userInput }],
              },
              {
                role: "assistant",
                content: [{ type: "text", text: totalMessage }],
                // content: [{ type: "text", text: textChunk }],
              },
            ]);
          }

          controller.close();
          reader.releaseLock();
        },
      });
    });
    // getDataStream();
  };
  console.log("streamingMessage", streamingMessage);
  useEffect(() => {
    axios.get(`/api/assistant/${assistantId}`).then(({ data }) => {
      const { assistant, threads } = data;
      console.log("get data ==>", data);
      setAssistant(assistant);
      setThreads(threads);
    });
  }, [assistantId]);

  useEffect(() => {
    setMessagesText([]);
  }, [selectedThread]);

  const renderMessages = (messages) =>
    messages.map((message) => {
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
    });

  return (
    <div>
      <Navigation />
      <h1>Helpful Assistant</h1>
      <div className="w-10/12">
        <h1 className="mb-8 mt-4 text-2xl text-center">{assistant?.name}</h1>
        {renderMessages(convertThreadToMessages(thread, assistant.name))}
        {renderMessages(messagesText)}
        <div className="flex items-center justify-center w-full mt-32">
          <Input
            // style={{ width: "100%" }}
            onChange={handleChange}
            type="text"
            value={userInput}
            placeholder="Please ask anything you want"
            className="w-full"
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded m-3"
            onClick={send}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
