"use client";
import { useState } from "react";

const S3UploadForm = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    console.log("====================================================3");
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    console.log("====================================================1");
    e.preventDefault();
    if (!file) return;
    console.log("====================================================2");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("/api/s3-upload", {
        method: "POST",
        body: formData,
      });
      // const data = await response;
      const data = await response.json();
      console.log("data", data);
      setUploading(false);
    } catch (error) {
      console.error("Error: ", error);
      setUploading(false);
    }
  };

  return (
    <>
      <h1>Upload image to S3 Bucket</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" name="file" onChange={handleFileChange} />
        <button type="submit" disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>{" "}
      </form>
    </>
  );
};

export default S3UploadForm;
