import { Environment, ParaWeb } from "@getpara/react-sdk";

const API_KEY = process.env.NEXT_PUBLIC_PARA_API_KEY;

if (!API_KEY) {
  throw new Error("API key is not defined. Please set NEXT_PUBLIC_PARA_API_KEY in your environment variables.");
}

export const para = new ParaWeb(Environment.PRODUCTION, API_KEY);
