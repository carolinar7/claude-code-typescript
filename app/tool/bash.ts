import { $ } from "bun";
import z from "zod";
import { Tool } from "./tool";
import type { ChatCompletionTool } from 'openai/resources';
import { Tools } from './tool-call';

const BashToolArguments = z.object({
  command: z.string(),
})

export class BashTool implements Tool {
  private command: string;

  constructor(args: string) {
    const { command } = BashToolArguments.parse(JSON.parse(args));
    this.command = command;
  }

  execute(): Promise<string> {
    return this.executeCommand();
  }

  private executeCommand(): Promise<string> {
    return $`sh -c ${this.command}`.text();
  }

  static definition(): ChatCompletionTool {
    return {
      "type": "function",
      "function": {
        "name": Tools.BASH,
        "description": "Execute a shell command",
        "parameters": {
          "type": "object",
          "required": ["command"],
          "properties": {
            "command": {
              "type": "string",
              "description": "The command to execute. Only one command can be served. Piping is allowed. It must not end in \\n."
            }
          }
        }
      }
    }
  }
}