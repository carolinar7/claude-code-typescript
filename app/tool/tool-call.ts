import type OpenAI from "openai";
import { ReadTool } from "./read";
import { WriteTool } from "./write";
import { BashTool } from "./bash";
import type { ChatCompletionTool } from "openai/resources";

export enum Tools {
  READ = "Read",
  WRITE = "Write",
  BASH = "Bash",
}

const ToolMapping = Object.freeze({
  [Tools.READ]: ReadTool,
  [Tools.WRITE]: WriteTool,
  [Tools.BASH]: BashTool,
});

export type ToolCallOutput = Record<string, any>

export class ToolCall {
  static async execute(toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]): Promise<ToolCallOutput> {  
    const outputs: ToolCallOutput = {};
  
    for (const toolCall of toolCalls) {
      // Not handling custom tools for now
      if (toolCall.type !== 'function') {
        continue;
      }
  
      const toolCallFunction = toolCall.function;
      const toolName = toolCallFunction.name as Tools;
      const toolArguments = toolCall.function.arguments;
      const toolClass = ToolMapping[toolName];
  
      if (!toolClass) {
        throw new Error(`Unhandled case: ${toolName}`)
      }

      const tool = new toolClass(toolArguments);
      outputs[toolCall.id] = await tool.execute();
    }
  
    return outputs;
  }

  static getTools(): Array<ChatCompletionTool> {
    return Object.values(ToolMapping).map((toolClass) => {
      return toolClass.definition();
    });
  }
}

