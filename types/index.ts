export interface ChatCompletionMessageRequest {
  role: "user" | "system";
  content: string;
}
