import axios from "axios";

export const startRecording = async (setAudioBlob, setRecorder) => {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const newRecorder = new MediaRecorder(stream);
  newRecorder.ondataavailable = (e) => {
    setAudioBlob(e.data);
    console.log("audioBlob", e.data);
  };
  newRecorder.start();
  setRecorder(newRecorder);
};

export const stopRecording = (recorder) => {
  recorder.stop();
};

export const playAudio = (audioBlob) => {
  const audio = new Audio(URL.createObjectURL(audioBlob));
  audio.play();
  audio.onended = () => {
    console.log("audio ended");
  };
};

export const sendAudio = async (audioBlob, url) => {
  const formData = new FormData();
  formData.append("audio", audioBlob, "audioFileName.mp3");
  const {
    data: { transcription },
  } = await axios.post(url, formData);

  return transcription;
};

export const getAudioReponse = async (text) => {
  const { data: buffer } = await axios.post(
    "/api/text_to_speech",
    { text },
    { responseType: "arraybuffer" }
  );
  console.log("buffer", buffer);
  return buffer;
};
