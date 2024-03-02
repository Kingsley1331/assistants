"use client";
import { useChat } from "ai/react";
import { useState } from "react";
import Image from "next/image";

const Chat = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { input, handleInputChange, handleSubmit, isLoading, messages } =
    useChat({
      api: "/api/vision",
      initialInput: "Can you describe this image?",
    });

  const handleFileInput = (e) => {
    const file = e.target.files[0];

    setSelectedFile(file);
    if (!file) {
      setImageUrl(null);
      setSelectedFile(null);
      return;
    }
    const reader = new FileReader();

    reader.onloadend = () => {
      setImageUrl(reader.result);
    };

    reader.readAsDataURL(file);
  };
  // console.log("imageUrl", imageUrl);

  return (
    <div>
      <h1>Vision</h1>
      <form
        className="mt-12"
        onSubmit={(e) => {
          handleSubmit(e, {
            data: {
              imageUrl,
            },
          });
        }}
      >
        <input
          style={{ width: "100%" }}
          onChange={handleInputChange}
          type="text"
          placeholder="Please ask anything you want"
          value={input}
        />
        <br />
        <button type="submit">Send</button>
        <div className="file-input">
          <input
            type="file"
            id="file"
            className="file"
            onChange={handleFileInput}
          />
          <label for="file">{/* <UploadIcon role="button" /> */}</label>
          {imageUrl && (
            <div className="preview">
              <Image
                width="100"
                height="100"
                src={imageUrl}
                alt="preview"
              ></Image>
              <div
                className="close"
                role="button"
                onClick={() => {
                  setImageUrl(null);
                  setSelectedFile(null);
                }}
              >
                {/* <Image width="20" src={close} alt="close"></Image> */}
              </div>
            </div>
          )}
        </div>
        {/* <button onClick={handleSubmit}>Send</button> */}
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
