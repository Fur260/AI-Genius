import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { increaseApiLimit, checkApiLimit } from "../../../lib/api-limit";
import { checkSubscription } from "../../../lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

const instructionMessage: ChatCompletionMessageParam = {
  role: "system",
  content:
    "You are a code generator. You must answer only in markdown code snipets. Use code comments for explaination",
};

export const POST = async (req: Request) => {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { messages } = body;

    if (!userId) return new NextResponse("Unauthorized!", { status: 401 });

    if (!openai.apiKey)
      return new NextResponse("OpenAi Api key not configured", { status: 500 });

    if (!messages)
      return new NextResponse("Messages are required", { status: 40 });

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro)
      return NextResponse.json("Free tiral has expired", { status: 403 });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [instructionMessage, ...messages],
    });

    if (!isPro) await increaseApiLimit();

    return NextResponse.json(response.choices[0].message);
  } catch (error) {
    return new NextResponse("Internal Code error", { status: 500 });
  }
};
