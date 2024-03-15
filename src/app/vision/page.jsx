"use client";
import { useChat } from "ai/react";
import { useState } from "react";
import Image from "next/image";
import S3UploadForm from "../components/S3UploadForm";

const Chat = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const {
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    messages,
    setMessages,
  } = useChat({
    api: "/api/vision",
    initialInput: "Can you describe this image?",
  });

  // setMessages((msgs) => [
  //   // ...(msgs ? [...msgs] : []),
  //   {
  //     role: "user",
  //     content: [
  //       { type: "text", text: input },
  //       ,
  //       { type: "image_url", image_url: imageUrl },
  //     ],
  //   },
  // ]);
  // setMessages(messages.map((msg) => ({ ...msg, content: msg.content[0].text })  );
  // setMessages((msgs) => msgs.concat({ role: "user", content: input });

  console.log("messages", messages);

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
              // imageUrl:
              //   "https://vision-model-images1.s3.eu-north-1.amazonaws.com/images/life.jpg",
            },
          });
        }}
        // onSubmit={handleSubmit}
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
          <label htmlFor="file">{/* <UploadIcon role="button" /> */}</label>
          {/* <Image width="100" height="100" src="/getty.jpg" alt="close"></Image> */}
          {/* <Image
            width="100"
            height="100"
            src="/images/test.jpg"
            alt="close"
          ></Image> */}
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
      <S3UploadForm />
      {/* 
      <Image
        width="100"
        height="100"
        src="https://vision-model-images1.s3.eu-north-1.amazonaws.com/images/life.jpg"
        // src="https://vision-model-images1.s3.eu-north-1.amazonaws.com/bounty.jpg"
        alt="close"
      ></Image> */}
    </div>
  );
};

export default Chat;
