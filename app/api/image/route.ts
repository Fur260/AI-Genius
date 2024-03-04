import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { increaseApiLimit, checkApiLimit } from "../../../lib/api-limit";
import { checkSubscription } from "../../../lib/subscription";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // This is also the default, can be omitted
});

export const POST = async (req: Request) => {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { prompt, amount = 1, resolution = "512x512" } = body;

    if (!userId) return new NextResponse("Unauthorized!", { status: 401 });

    if (!openai.apiKey)
      return new NextResponse("OpenAi Api key not configured", { status: 500 });

    if (!prompt) return new NextResponse("Prompt is required", { status: 40 });

    const freeTrial = await checkApiLimit();
    const isPro = await checkSubscription();

    if (!freeTrial && !isPro)
      return NextResponse.json("Free tiral has expired", { status: 403 });

    const response = await openai.images.generate({
      prompt,
      n: parseInt(amount, 10),
      size: resolution,
    });

    if (!isPro) await increaseApiLimit();

    return NextResponse.json(response.data);
  } catch (error) {
    console.log("Image Generation Error,", error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
