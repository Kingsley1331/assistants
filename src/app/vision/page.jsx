"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";
import { set } from "mongoose";

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
    <div>
      <h1>Vision</h1>
      <form className="mt-12" onSubmit={handleFileSubmit}>
        <input
          style={{ width: "100%" }}
          onChange={handleInputChange}
          type="text"
          value={userInput}
          placeholder="Please ask anything you want"
        />
        <br />
        <button type="submit">Send</button>

        {messages.map((message) => {
          const { content } = message;
          const text = typeof content === "string" ? content : content[0]?.text;
          return <div key={content}>{text}</div>;
        })}
      </form>
      <>
        <h1>Upload image to S3 Bucket</h1>
        <form onSubmit={handleFileSubmit}>
          <input type="file" name="file" onChange={handleFileChange} />
          <button type="submit" disabled={!selectedFile || uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>{" "}
        </form>
      </>
      {imageUrl && (
        <Image width="100" height="100" src={imageUrl} alt="close"></Image>
      )}
    </div>
  );
};

export default Chat;
