import * as fs from 'fs';
import z from "zod";
import type { Tool } from "./tool";
import type { ChatCompletionTool } from 'openai/resources';
import { Tools } from './tool-call';

const ReadToolArguments = z.object({
  file_path: z.string(),
  content: z.string(),
})

export class WriteTool implements Tool {
  private filePath: string;
  private fileContents: string;

  constructor(args: string) {
    const parsedArguments = ReadToolArguments.parse(JSON.parse(args))
    this.filePath = parsedArguments.file_path;
    this.fileContents = parsedArguments.content;
  }

  execute(): string {
    this.writeToFilePath();
    return this.getFileContents();
  }

  private writeToFilePath(): void {
    fs.writeFileSync(this.filePath, this.fileContents);
  }

  private getFileContents(): string {
    return this.fileContents;
  }

  static definition(): ChatCompletionTool {
    return {
      "type": "function",
      "function": {
        "name": Tools.WRITE,
        "description": "Write content to a file",
        "parameters": {
          "type": "object",
          "required": ["file_path", "content"],
          "properties": {
            "file_path": {
              "type": "string",
              "description": "The path of the file to write to"
            },
            "content": {
              "type": "string",
              "description": "The content to write to the file"
            }
          }
        }
      }
    }
  }
}