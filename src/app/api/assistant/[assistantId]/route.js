import { NextResponse } from "next/server";
import OpenAI from "openai";
import mongoose from "mongoose";
import assistants from "../../../models/assistants.js";

const openai = new OpenAI(process.env.OPENAI_API_KEY);
console.log("OPENAI_API_KEY", process.env.OPENAI_API_KEY);

const assistantList = [
  {
    assistantId: "asst_Hvvslw02GyI1r8kFQRRVSKPe",
    threadIds: [
      "thread_qNjBZTcVIHCpqYI3fXEriFwI",
      "thread_8o7FO3GVBAGE7TQt2K2f1ApK",
      "thread_2A3OiesssYNG1YL4d0SgXZgG",
      "thread_bM0S3ucyoVJXA0cbv4mglpXn",
      "thread_HXKwvQlaQyYLQC9C18tbzqhH",
    ],
  },
  {
    assistantId: "asst_jQN8jrgUQlSpotKHuHoGbBNH",
    threadIds: [
      "thread_pezwGJ8s8z2AXEeX1HUscwIE",
      "thread_hxuh6xDJIvDvdGToiBrD5tzh",
      "thread_xmZX2sMtqgzbjNof7cpitNN1",
      "thread_sqPKfbXfqwikJv1AdgT8o291",
      "thread_cKelU0NbPB3LsQNJumdNAdkL",
    ],
  },
  {
    assistantId: "asst_cBPbAmQzBDQHeGoE3i3IFwaB",
    threadIds: ["thread_RGdu4nvPOSfbjx4sK13EzVUE"],
  },
  {
    assistantId: "asst_kWci5bij5IpWXmpdTxztBpct",
    threadIds: ["thread_nzC1uh5z9qSsPlYe88wzb7JQ"],
  },
  {
    assistantId: "asst_nsN6ZIzVHRtkL89Lwyg1deO4",
    threadIds: [
      "thread_a6SlWfJ9gnItdxibdfpTYyoL",
      "thread_mIxTuiTzK2Y1NkDMrmPpI13l",
      "thread_gBIKNnrUSRsd0NUKcnsgMzIo",
      "thread_wRl6AgA8UiIS4DX43U5GlVnP",
      "thread_o50mEQV72rpA6lSKRBnn6yfd",
      "thread_uCsO9LKxRq66ZUDn4bjZB1aJ",
      "thread_GWepunPPlvZE7A6p702oGcaR",
      "thread_LSckQtQepP4WXpCOGvUjucPo",
      "thread_tRjFAL5agLXkHNCZ6QCd4zXr",
      "thread_Ws6s0d2SBDNhSqx01Ij3X0FJ",
      "thread_8Jas8wL0O1HpyZgYEmxToUoj",
    ],
  },
];

let messages = [
  {
    role: "user",
    content:
      "Hello there, I'm your personal math tutor. Ask some complicated questions.",
  },
];

const threadId = "thread_a6SlWfJ9gnItdxibdfpTYyoL";

// export async function GET(req, context) {
//   // export async function GET(req) {
//   console.log("context", context);
//   const { assistantId } = context.params;
//   console.log("assistantId", assistantId);
//   // const { threadId = "id" } = req.params;

//   if (threadId) {
//     // messages = await getThread(threadId);
//     //   assistantList = (await getAssistants()).map(({ id, name }) => ({
//     //     id,
//     //     name,
//     //   }));
//     // res.json({ messages, assistantList });
//     return NextResponse.json({ messages, assistantList });
//   }
// }

// app.get("/assistant/:id", async (req, res) => {
//   const { id } = req.params;
//   const assistant = await getAssistant(id);
//   res.json({ assistant });
// });

const getThreads = async (assistant_id) => {
  await mongoose.connect(process.env.MONGODB_URI);
  const assistantList = await assistants.find();
  const threads = assistantList
    .filter(({ assistantId }) => assistantId === assistant_id)
    .map(({ threadIds }) => threadIds)[0];
  return threads;
};

async function getAssistant(assistant_id) {
  const assistantList = (await openai.beta.assistants.list()).data;
  const assistant = assistantList.filter(({ id }) => id === assistant_id)[0];

  return assistant;
}

export async function GET(req, context) {
  console.log("context", context);
  const { assistantId } = context.params;
  console.log("assistantId", assistantId);

  const assistant = await getAssistant(assistantId);
  const threads = await getThreads(assistantId);
  console.log("assistant", assistant);
  console.log("threads", threads);

  if (assistant) {
    return NextResponse.json({ assistant, threads });
  }
}
