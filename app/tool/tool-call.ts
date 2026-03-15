import type OpenAI from "openai";
import { ReadTool } from "./read";
import { WriteTool } from "./write";
import type { ChatCompletionTool } from "openai/resources";

export enum Tools {
  READ = "Read",
  WRITE = "Write"
}

const ToolMapping = Object.freeze({
  [Tools.READ]: ReadTool,
  [Tools.WRITE]: WriteTool,
});

export type ToolCallOutput = Record<string, any>

export class ToolCall {
  static execute(toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]): ToolCallOutput {  
    const outputs: ToolCallOutput = {};
  
    toolCalls.forEach((toolCall) => {
      // Not handling custom tools for now
      if (toolCall.type !== 'function') {
        return;
      }
  
      const toolCallFunction = toolCall.function;
      const toolName = toolCallFunction.name as Tools;
      const toolArguments = toolCall.function.arguments;
  
      let toolClass = null;
  
      // Tool selection
      switch(toolName) {
        case Tools.READ:
          toolClass = ReadTool; 
          break;
        case Tools.WRITE:
          toolClass = WriteTool;
          break;
        default:
          const _exhaustiveCheck: Tools = toolName;
          throw new Error(`Unhandled case: ${_exhaustiveCheck}`);
      }
  
      if (!toolClass) {
        return;
      }
          
      const tool = new toolClass(toolArguments);
      outputs[toolCall.id] = tool.execute();
    });
  
    return outputs;
  }

  static getTools(): Array<ChatCompletionTool> {
    return Object.values(ToolMapping).map((toolClass) => {
      return toolClass.definition();
    });
  }
}

