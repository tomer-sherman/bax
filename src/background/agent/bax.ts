import { AIMessage, HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

import { appConfig } from "../utils/app-config";
import type { ChatMessage } from "~src/shared/models";
import { createMdToolBuilder } from "./read-markdown-tool";

class BaxAgent {

    // Agent tools:
    private tools = [createMdToolBuilder];

    // Agent LLM, with the tools attached:
    private model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: appConfig.openAiApiKey,
    }).bindTools(this.tools);

    // System Prompt:
    private systemPrompt = `
    You are bax, a personal browser extention assistant, when initiated use first the mark_down_overview tool
    to view the page content. then answer then help the user.
    You may answer not only from the content of the page, But if you do say so.
    Be concise.
    `;

    // Safety net against endless loops:
    private maxSteps = 8;

    // Run the agent:
    public async run(chat: ChatMessage[]): Promise<string> {


        console.log("Agent activated.");
        const messages: BaseMessage[] = [
            new SystemMessage(this.systemPrompt),
            ...chat.map(m => m.role === "human" ? new HumanMessage(m.content) : new AIMessage(m.content))
        ];

        for (let step = 0; step < this.maxSteps; step++) {
            const aiMessage = await this.model.invoke(messages);
            messages.push(aiMessage);

            // No tool calls = final answer:
            if (!aiMessage.tool_calls?.length) return aiMessage.content as string;

            // Run every tool the AI asked for:
            for (const toolCall of aiMessage.tool_calls) {
                const tool = this.tools.find((t) => t.name === toolCall.name);
                const result = tool ? await tool.invoke(toolCall.args) : `Unknown tool: ${toolCall.name}`;
                messages.push(new ToolMessage({ content: String(result), tool_call_id: toolCall.id ?? "" }));
            }
        }

        return "Stopped: too many steps.";
    }

}

export const baxAgent = new BaxAgent();