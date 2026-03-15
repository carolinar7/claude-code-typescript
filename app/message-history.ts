import type { ChatCompletionMessageParam } from "openai/resources";

export class MessageHistory {
  history: ChatCompletionMessageParam[] = []

  constructor(initialHistory?: ChatCompletionMessageParam[]) {
    if (!!initialHistory) {
      this.history.push(...initialHistory);
    }
  }

  add(item: ChatCompletionMessageParam) {
    this.history.push(item);
  }

  getAll(): ChatCompletionMessageParam[] {
    return this.history;
  }

  getLast(): ChatCompletionMessageParam | null {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1];
  }
}