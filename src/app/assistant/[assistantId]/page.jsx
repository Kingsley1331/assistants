"use client";
import { useState, useEffect } from "react";
import { Input } from "@nextui-org/react";
import axios from "axios";
import Navigation from "../../components/Navigation";
import {
  startRecording,
  stopRecording,
  playAudio,
  sendAudio,
} from "../../utils/audio";

const Assistant = ({ params: { assistantId } }) => {
  const [messagesText, setMessagesText] = useState([]);
  const [assistant, setAssistant] = useState([]);
  const [selectedThread, setSelectedThread] = useState("");
  const [threads, setThreads] = useState([]);
  const [thread, setThread] = useState([]);
  const [userInput, setUserInput] = useState("What is the mass of the sun?");
  const [streamingMessage, setStreamingMessage] = useState({});
  const [recorder, setRecorder] = useState(null);
  const [disableRecord, setDisableRecord] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

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
    fetch("/api/assistant_message", {
      method: "POST",
      body: JSON.stringify({
        content: userInput,
        assistantId,
        threadId: selectedThread,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    }).then((response) => {
      const reader = response.body.getReader();
      return new ReadableStream({
        async start(controller) {
          let textChunk = "";
          let totalMessage = "";
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
            // Process chunk here
            textChunk = new TextDecoder().decode(value).trim();

            const strServerEvents = textChunk.split("\n");
            console.log("strServerEvents", strServerEvents);
            // process each event
            for (const strServerEvent of strServerEvents) {
              const serverEvent = JSON.parse(strServerEvent);
              console.log("serverEvent", serverEvent);
              let contentSnapshot;

              if (serverEvent.event === "thread.message.delta") {
                // update streaming message content
                contentSnapshot += serverEvent.data.delta.content[0].text.value;
                const newStreamingMessage = {
                  ...streamingMessage,
                  content: contentSnapshot,
                };
                totalMessage += contentSnapshot.replaceAll("undefined", "");
                setStreamingMessage(newStreamingMessage);
              }
            }
            setMessagesText([
              ...messagesText,
              {
                role: "user",
                content: [{ type: "text", text: userInput }],
              },
              {
                role: "assistant",
                content: [{ type: "text", text: totalMessage }],
              },
            ]);
          }

          controller.close();
          reader.releaseLock();
        },
      });
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

  useEffect(() => {
    setMessagesText([]);
  }, [selectedThread]);

  useEffect(() => {
    const handleAudioRecording = async () => {
      const transcription = await sendAudio(audioBlob, "/api/speech_to_text");
      setUserInput(transcription);
    };
    if (audioBlob) {
      handleAudioRecording();
    }
  }, [audioBlob]);

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
    <>
      <Navigation />
      <div className="p-4">
        <div className="flex relative">
          <div className="min-w-60">
            <table>
              {threads.map((thread, indx) => (
                <tr key={thread}>
                  <td
                    className={`${thread === selectedThread && "bg-slate-200"}`}
                  >
                    <div
                      className={"m-4"}
                      role="button"
                      onClick={() => {
                        getMessages(thread);
                        setSelectedThread(thread);
                      }}
                    >
                      <span className=" p-1">{`Thread ${indx + 1}`}</span>
                    </div>
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
          </div>
          <div className="w-10/12">
            <h1 className="mb-8 mt-4 text-2xl text-center">
              {assistant?.name}
            </h1>
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
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded m-3"
                onClick={() => startRecording(setAudioBlob, setRecorder)}
              >
                Record voice
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded m-3"
                onClick={() => stopRecording(recorder)}
              >
                Stop recording
              </button>
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded m-3"
                onClick={() => playAudio(audioBlob)}
              >
                play audio
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Assistant;
