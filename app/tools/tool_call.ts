import type OpenAI from "openai";
import { ReadTool } from "./read";
import type { ChatCompletionTool } from "openai/resources";

enum Tools {
  READ = "Read"
}

const ToolMapping = Object.freeze({
  [Tools.READ]: ReadTool,
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
      const toolName = toolCallFunction.name;
      const toolArguments = toolCall.function.arguments;
  
      let toolClass = null;
  
      // Tool selection
      switch(toolName) {
        case Tools.READ:
          toolClass = ReadTool; 
          break;
        default:
          console.error(`Unexpected tool call: ${toolName}`);
          return;
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

