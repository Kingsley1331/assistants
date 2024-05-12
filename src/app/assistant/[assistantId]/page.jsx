"use client";
import { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Image from "next/image";
import { Input } from "@nextui-org/react";
import axios from "axios";
import Navigation from "../../components/Navigation";
import {
  startRecording,
  stopRecording,
  playAudio,
  sendAudio,
  getAudioReponse,
} from "../../utils/audio";
import MarkdownRenderer from "../../tools/MarkdownRenderer";
import hljs from "highlight.js";
import Microphone from "../../components/icons/microphone.js";
import SendIcon from "../../components/icons/send.js";
import close from "../../components/icons/close.png";
import Clipboard from "../../components/icons/clipboard.js";
import "highlight.js/styles/github.css";
import "highlight.js/styles/felipec.css";

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
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loadingResponse, setLoadingResponse] = useState(false);

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
      if (!threads.length) {
        setThreads([threadId]);
      } else {
        setThreads([...threads, threadId]);
      }
      console.log("NEW THREAD ==>", data);
      getMessages(threadId);
      setSelectedThread(threadId);
    });
  };

  const deleteThread = (threadId) => {
    const deleteThread = window.confirm(
      "Are you sure you want to delete this chat?"
    );

    if (deleteThread) {
      console.log("delete chat");
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
      setLoadingResponse(true);
      return new ReadableStream({
        async start(controller) {
          setLoadingResponse(false);
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
          getAudio(totalMessage);
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
      if (threads) {
        setThreads(threads);
      }
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

  const copyToClipboard = (e) => {
    // e.preventDefault();
    const element =
      e.target.parentElement.parentElement.parentElement.parentElement.querySelectorAll(
        "code"
      )[0];

    if (!element) {
      return;
    }
    const text = element.innerText;

    navigator.clipboard
      .writeText(text)
      .then(() => {
        // You can add some notification code here to alert the user that text has been copied
        console.log("Text copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  useEffect(() => {
    hljs.highlightAll();

    const highlights = document.querySelectorAll("pre");
    console.log("highlights", highlights);

    const doesIconContainerAlreadyExist = (idx) =>
      document.querySelectorAll(`.clipboard-icon-container_${idx}`).length;

    highlights.forEach((div, index) => {
      const sendIconContainer = document.createElement("div");

      sendIconContainer.className = `clipboard-icon-container clipboard-icon-container_${index}`;

      const lang = div
        .querySelectorAll("code")[0]
        .className.split(" ")
        .map((a) => a)
        .map((b) => b.match(/language-.*/))
        .filter((c) => c)
        .map((d) => d[0].split("language-")[1])
        .join(", ");

      const root = createRoot(sendIconContainer);
      root.render(
        <Clipboard
          language={lang}
          className="clipboard-icon"
          copyToClipboard={copyToClipboard}
        />
      );

      if (!doesIconContainerAlreadyExist(index)) {
        div.prepend(sendIconContainer);
      }
    });
  });

  const getAudio = async (text) => {
    const arrayBuffer = await getAudioReponse(text);
    let blob = new Blob([arrayBuffer], { type: "audio/mpeg" });

    playAudio(blob);
  };

  const renderMessages = (messages) =>
    messages?.map((message) => {
      const { content, role, name, id } = message;
      const text = typeof content === "string" ? content : content[0]?.text;
      return (
        <div key={id} className="markdown">
          <h3 className="chat_name">
            <strong>{role === "user" ? "User" : name}</strong>
          </h3>
          <MarkdownRenderer content={text} />
        </div>
      );
    });

  return (
    <>
      <Navigation />
      <div className="p-4">
        <div className="flex relative h-full">
          <div className="min-w-60 overflow-y-scroll hgt-half scrollbar-webkit">
            <table className="w-52">
              {threads?.map((thread, indx) => (
                <tr key={thread}>
                  <td
                    className={`${thread === selectedThread && "bg-slate-200"} w-32`}
                  >
                    <div
                      className={"m-4 text-center"}
                      role="button"
                      onClick={() => {
                        getMessages(thread);
                        setSelectedThread(thread);
                      }}
                    >
                      <span className=" p-1">{`Chat ${indx + 1}`}</span>
                    </div>
                  </td>
                  <td>
                    <div
                      className="ml-6"
                      onClick={() => deleteThread(thread)}
                      role="button"
                    >
                      <Image width="20" src={close} alt="close" />
                    </div>
                  </td>
                </tr>
              ))}
            </table>
            <button
              onClick={startNewChat}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded mt-4"
            >
              Start new chat
            </button>
          </div>
          <div className="w-2/3 h-96 pl-6">
            <h1 className="mb-8 mt-4 text-2xl text-center">
              {assistant?.name}
            </h1>
            <div className="chat_window">
              {/* <div className="w-full h-full border-4 border-solid overflow-scroll"> */}
              {renderMessages(convertThreadToMessages(thread, assistant.name))}
              {renderMessages(messagesText)}
            </div>

            {selectedThread && (
              <div className="flex items-center justify-center fixed bottom-4 w-2/3">
                <Input
                  // style={{ width: "100%" }}
                  onChange={handleChange}
                  type="text"
                  value={userInput}
                  placeholder="Please ask anything you want"
                  className="w-full"
                />
                <div onClick={send} role="button" className="w-9 ml-4">
                  <SendIcon opacity={userInput && !loadingResponse ? 1 : 0.4} />
                </div>

                {disableRecord ? (
                  <div
                    className="w-8 h-8 bg-red-500 border-red-700 rounded-full"
                    onClick={() => {
                      stopRecording(recorder);
                      setIsRecording(false);
                      setDisableRecord(false);
                    }}
                  />
                ) : (
                  <div
                    className={"w-9"}
                    role="button"
                    disabled
                    onClick={() => {
                      startRecording(setAudioBlob, setRecorder);
                      setIsRecording(true);
                      setDisableRecord(true);
                    }}
                  >
                    <Microphone />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Assistant;
