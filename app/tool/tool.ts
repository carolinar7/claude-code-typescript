import type { ChatCompletionTool } from "openai/resources";

export abstract class Tool {
  constructor(_args: string) {}
  abstract execute(): Promise<string> | string | null
  static definition(): ChatCompletionTool {
    throw new Error(`Tool definition for ${this.name} is not implemented.`)
  }
}