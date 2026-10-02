import { HumanMessage, SystemMessage, ToolMessage, type BaseMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";

import { appConfig } from "../utils/app-config";
import { createReadLinesTool } from "./read-lines-tool";
import { createSkimToolBuilder } from "./skim-tool";

class BaxAgent {

    // Agent tools:
    private tools = [createSkimToolBuilder, createReadLinesTool];

    // Agent LLM, with the tools attached:
    private model = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        apiKey: appConfig.openAiApiKey,
    }).bindTools(this.tools);

    // System Prompt:
    private systemPrompt = `
    You are Bax, an assistant that answers questions about the web page the user is viewing.
    Always start by calling skim_page to see the page structure.
    Then call read_lines on the ranges you need before answering.
    Answer only from the page content. If the answer isn't on the page, say so.
    Be concise.
    `;

    // Safety net against endless loops:
    private maxSteps = 8;

    // Run the agent:
    public async run(userPrompt: string): Promise<string> {

        console.log("Agent activated.");
        const messages: BaseMessage[] = [
            new SystemMessage(this.systemPrompt),
            new HumanMessage(userPrompt)
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