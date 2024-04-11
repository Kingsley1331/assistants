"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import Image from "next/image";
import { Button } from "@nextui-org/button";
import { Textarea } from "@nextui-org/react";

const Chat = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [userInput, setUserInput] = useState("Please describe this image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant." },
  ]);

  const sendmessage = async (image_url) => {
    const content = [{ type: "text", text: userInput }];

    if (image_url) {
      content.push({
        type: "image_url",
        image_url,
      });
    }

    fetch("/api/vision", {
      method: "POST",
      body: JSON.stringify({
        messages: [
          ...messages,
          {
            role: "user",
            content,
          },
        ],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        setImageUrl(null);
        setUserInput("");
        setSelectedFile(null);

        const reader = response.body.getReader();
        return new ReadableStream({
          async start(controller) {
            let textChunk = "";
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              controller.enqueue(value);
              // Process chunk here
              textChunk += new TextDecoder().decode(value);
              // console.log("textChunk", textChunk);
              // console.count("textChunk");
              setMessages([
                ...messages,
                {
                  role: "user",
                  content,
                },
                {
                  role: "assistant",
                  content: [{ type: "text", text: textChunk }],
                },
              ]);
            }

            controller.close();
            reader.releaseLock();
          },
        });
      })
      .then((stream) => new Response(stream))
      .then((response) => response.text())
      .then((text) => {
        console.log("text", text);
      })
      .catch((err) => console.error(err));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    setSelectedFile(file);
    const reader = new FileReader();

    reader.onloadend = () => {
      setImageUrl(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return await sendmessage();
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const response = await fetch("/api/s3-upload", {
        method: "POST",
        body: formData,
      });
      // const data = await response;
      const data = await response.json();
      // console.log("data", data);
      // console.log("filename", data?.fileName);

      setUploading(false);
      const imgUrl = `https://vision-model-images1.s3.eu-north-1.amazonaws.com/images/${data?.fileName}`;
      setImageUrl(imgUrl);
      await sendmessage(imgUrl);
    } catch (error) {
      console.error("Error: ", error);
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  console.log("messages", messages);
  return (
    <>
      <Navigation />
      <div className="p-4">
        <h1>Vision</h1>
        <form className="mt-12" onSubmit={handleFileSubmit}>
          <Textarea
            style={{ width: "100%" }}
            onChange={handleInputChange}
            type="text"
            value={userInput}
            placeholder="Please ask anything you want"
            className="min-w-60 max-w-lg w-2/5"
            label="Query"
          />
          <br />
          <Button className="mb-5" type="submit" color="primary">
            Send
          </Button>
          {/* <button type="submit">Send</button> */}

          {messages.map((message, idx) => {
            const { content, role } = message;
            const text =
              typeof content === "string" ? content : content[0]?.text;
            if (role === "system") {
              return;
            }

            let imageArray = [];

            if (Array.isArray(content)) {
              const images = content.filter(
                (item) => item.type === "image_url"
              );
              imageArray = images.map((item) => {
                if (item.type === "image_url") {
                  return (
                    <div key={idx}>
                      <Image
                        width="300"
                        height="300"
                        src={item.image_url}
                        alt="close"
                      />
                    </div>
                  );
                }
              });
            }

            const messageRole = role === "assistant" ? "Assistant: " : "User: ";

            return (
              <div key={idx}>
                <strong>{messageRole}</strong>
                {text}
                {imageArray}
                <br></br>
              </div>
            );
          })}
        </form>

        <form onSubmit={handleFileSubmit}>
          {/* <input type="file" name="file" onChange={handleFileChange} /> */}

          <div class="flex items-center justify-center min-w-60 max-w-lg w-2/5 mb-5">
            <label
              for="dropzone-file"
              class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
            >
              <div class="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 16"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                  />
                </svg>
                <p class="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span class="font-semibold">Click to upload</span> or drag and
                  drop
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  SVG, PNG, JPG or GIF (MAX. 800x400px)
                </p>
              </div>
              <input
                id="dropzone-file"
                type="file"
                onChange={handleFileChange}
                class="hidden"
              />
            </label>
          </div>
        </form>

        {imageUrl && (
          <Image width="100" height="100" src={imageUrl} alt="close"></Image>
        )}
      </div>
    </>
  );
};

export default Chat;
