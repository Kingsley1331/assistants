"use client";
// import { useChat } from "ai/react";
import axios from "axios";
import { useState, useEffect } from "react";
import Image from "next/image";
// import S3UploadForm from "../components/S3UploadForm";

const Chat = () => {
  const [imageUrl, setImageUrl] = useState(null);
  const [userInput, setUserInput] = useState("Please describe this image");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "system", content: "You are a helpful assistant." },
  ]);

  useEffect(() => {
    // axios.get("/api/vision").then(({ data }) => {
    //   console.log("get data ==>", data);
    //   if (data?.messages) {
    //     return setMessages(data.messages);
    //   }
    // });
  }, []);

  const sendmessage = async (image_url) => {
    // const response = await axios.post("/api/vision", {
    //   messages: [...messages, { role: "user", content: userInput }],
    // });

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
            // content: [
            //   { type: "text", text: userInput },
            //   ...(selectedFile?.name && {
            //     type: "image",
            //     url: imgUrl,
            //   }),
            // ],
            // content: [
            //   { type: "text", text: userInput },
            //   {
            //     type: "image_url",
            //     image_url,
            //   },
            // ],
          },
        ],
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
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
    console.log("====================================================3");
    setSelectedFile(e.target.files[0]);
  };

  const handleFileSubmit = async (e) => {
    console.log("====================================================1");
    e.preventDefault();
    if (!selectedFile) {
      return await sendmessage();
    }
    console.log("====================================================2");
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
      console.log("data", data);
      console.log("filename", data?.fileName);

      setUploading(false);
      const imgUrl = `https://vision-model-images1.s3.eu-north-1.amazonaws.com/images/${data?.fileName}`;
      setImageUrl(imgUrl);
      await sendmessage(imgUrl);
    } catch (error) {
      console.error("Error: ", error);
      setUploading(false);
    }
  };

  // const handleSubmit = () => {
  //   axios
  //     .post("/api/vision", {
  //       messages,
  //       data: {
  //         imageUrl,
  //       },
  //     })
  //     .then(({ data }) => {
  //       console.log("data", data);
  //       setMessages((msgs) => [...msgs, ...data.messages]);
  //     });
  // };
  // const {
  //   input,
  //   handleInputChange,
  //   handleSubmit,
  //   isLoading,
  //   messages,
  //   setMessages,
  // } = useChat({
  //   api: "/api/vision",
  //   initialInput: "Can you describe this image?",
  // });

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

  // console.log("messages", messages);
  console.log("selectedFile", selectedFile);

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  // const handleFileInput = (e) => {
  //   const file = e.target.files[0];

  //   setSelectedFile(file);
  //   if (!file) {
  //     setImageUrl(null);
  //     setSelectedFile(null);
  //     return;
  //   }
  //   const reader = new FileReader();

  //   reader.onloadend = () => {
  //     setImageUrl(reader.result);
  //   };

  //   reader.readAsDataURL(file);
  // };
  // console.log("userInput", userInput);
  console.log("imageUrl", imageUrl);

  return (
    <div>
      <h1>Vision</h1>
      <form
        className="mt-12"
        onSubmit={handleFileSubmit}
        // onSubmit={(e) => {
        //   handleSubmit(e, {
        //     data: {
        //       imageUrl,
        //       // imageUrl:
        //       //   "https://vision-model-images1.s3.eu-north-1.amazonaws.com/images/life.jpg",
        //     },
        //   });
        // }}
        // onSubmit={handleSubmit}
      >
        <input
          style={{ width: "100%" }}
          onChange={handleInputChange}
          type="text"
          value={userInput}
          placeholder="Please ask anything you want"
          // value={input}
        />
        <br />
        <button type="submit">Send</button>
        {/* <div className="file-input">
          <input
            type="file"
            id="file"
            className="file"
            onChange={handleFileInput}
          />
          <label htmlFor="file"></label> */}
        {/* <Image width="100" height="100" src="/getty.jpg" alt="close"></Image> */}
        {/* <Image
            width="100"
            height="100"
            src="/images/test.jpg"
            alt="close"
          ></Image> */}
        {/* {imageUrl && (
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
        {/* </div>
            </div>
          )}
        </div>  */}

        {/* <button onClick={handleSubmit}>Send</button> */}
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
        <Image
          width="100"
          height="100"
          src={imageUrl}
          // src="https://vision-model-images1.s3.eu-north-1.amazonaws.com/images/life.jpg"
          // src="https://vision-model-images1.s3.eu-north-1.amazonaws.com/bounty.jpg"
          alt="close"
        ></Image>
      )}
    </div>
  );
};

export default Chat;
