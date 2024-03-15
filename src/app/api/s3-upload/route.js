import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION,
  credentials: {
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
  },
});

async function uploadFileToS3(file, fileName) {
  const fileBuffer = file;
  console.log("filename", fileName);
  const uploadParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: `images/${fileName}`,
    Body: fileBuffer,
    "content-type}": "image/jpeg",
  };
  const uploadCommand = new PutObjectCommand(uploadParams);
  const response = await s3Client.send(uploadCommand);
  return fileName;
}

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.error(new Error("No file found in the request"));
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = await uploadFileToS3(buffer, file.name);
    NextResponse.json({ success: true, fileName });
  } catch (error) {
    console.error("Error: ", error);
    return NextResponse.error(
      new Error("An error occurred whilst uploading the file")
    );
  }
}
