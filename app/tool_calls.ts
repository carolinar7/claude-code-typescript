import * as fs from 'fs';
import type OpenAI from "openai";
import * as z from 'zod';

enum Tools {
  READ = "Read"
}

const ReadToolArguments = z.object({
  file_path: z.string(),
})

export type ToolCallOutput = Record<string, any>

class ReadTool {
  private filepath: string;
  private fileContents: string | null;

  constructor(args: string) {
    const parsedArguments = ReadToolArguments.parse(JSON.parse(args))
    this.filepath = parsedArguments.file_path;
    this.fileContents = null;
  }

  private readFilePath(): void {
    this.fileContents = fs.readFileSync(this.filepath, 'utf-8');
  }

  private getFileContents(): string | null {
    return this.fileContents;
  }

  execute(): string | null {
    this.readFilePath();
    return this.getFileContents();    
  }
}

export function executeToolCalls(toolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[]): ToolCallOutput {  
  const outputs: ToolCallOutput = {};
  toolCalls.forEach((toolCall) => {
    if (toolCall.type !== 'function') {
      return;
    }

    const toolCallFunction = toolCall.function;
    const toolName = toolCallFunction.name;
    const toolArguments = toolCall.function.arguments;
    let output: any = null;

    switch(toolName) {
      case Tools.READ:
        const readTool = new ReadTool(toolArguments);
        output = readTool.execute();
        break;
      default:
        console.error(`Unexpected tool call: ${toolName}`);
        break;
    }

    outputs[toolCall.id] = output
  });
  return outputs;
}