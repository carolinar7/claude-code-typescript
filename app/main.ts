import OpenAI from "openai";
import { ToolCall, type ToolCallOutput } from "./tools/tool_call";
import { MessageHistory } from "./message_history";
import type { ChatCompletionAssistantMessageParam } from "openai/resources";

async function main() {
  const [, , flag, prompt] = process.argv;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL =
    process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (flag !== "-p" || !prompt) {
    throw new Error("error: -p flag is required");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  const messageHistory = new MessageHistory([{ role: "user", content: prompt }]);
  const tools = ToolCall.getTools()

  while (true) {
    const response = await client.chat.completions.create({
      model: "anthropic/claude-haiku-4.5",
      messages: messageHistory.getAll(),
      tools,
    });
  
    if (!response.choices || response.choices.length === 0) {
      throw new Error("no choices in response");
    }
  
    const choice = response.choices[0];
    const message = choice["message"];
  
    if (!message) {
      throw new Error("no message in response");
    }

    const content = message.content;
    const assistantHistoryItem: ChatCompletionAssistantMessageParam = {
      role: 'assistant',
      content,
    };
    
    const toolCalls = message["tool_calls"];
    
    let toolOutputs: ToolCallOutput | null = null
    if (!!toolCalls) {
      toolOutputs = ToolCall.execute(toolCalls);
      assistantHistoryItem["tool_calls"] = toolCalls;
    }

    messageHistory.add(assistantHistoryItem);
  
    if (toolOutputs) {
      Object.keys(toolOutputs).forEach((key) => {
         const output = toolOutputs[key]
         messageHistory.add({
          role: 'tool',
          content: output,
          tool_call_id: key,
         })
      })
    } else {
      console.log(messageHistory.getLast()?.content);
      break;
    }
  }
}

main();
