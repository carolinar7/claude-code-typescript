import * as fs from 'fs';
import z from "zod";
import type { Tool } from "./tool";
import type { ChatCompletionTool } from 'openai/resources';

const ReadToolArguments = z.object({
  file_path: z.string(),
})

export class ReadTool implements Tool {
  private filepath: string;
  private fileContents: string | null;

  constructor(args: string) {
    const parsedArguments = ReadToolArguments.parse(JSON.parse(args))
    this.filepath = parsedArguments.file_path;
    this.fileContents = null;
  }

  execute(): string | null {
    this.readFilePath();
    return this.getFileContents();
  }

  private readFilePath(): void {
    this.fileContents = fs.readFileSync(this.filepath, 'utf-8');
  }

  private getFileContents(): string | null {
    return this.fileContents;
  }

  static definition(): ChatCompletionTool {
    return {
      "type": "function",
      "function": {
        "name": "Read",
        "description": "Read and return the contents of a file",
        "parameters": {
          "type": "object",
          "properties": {
            "file_path": {
              "type": "string",
              "description": "The path to the file to read"
            }
          },
          "required": ["file_path"],
        }
      }
    }
  }
}