import { z } from "zod";
import { scraper } from "../utils/scraper";
import { pageService } from "../service/page-service";
import { DynamicStructuredTool } from "@langchain/core/tools";


class CreateReadLinesTool {

    private readonly name = "read_lines";
    private readonly description = "Returns the full text of lines from 'from' to 'to' (1-based, inclusive). Use line numbers from skim_page. Read at most 50 lines per call.";
    private readonly scheme = z.object({
        from: z.number().int().describe("First line number to read."),
        to: z.number().int().describe("Last line number to read")
    });

    private async run(args: { from: number, to: number }): Promise<string> {
        const selectedLinesString = scraper.getLineRange(await pageService.getPageLines(), args.from, args.to);
        return selectedLinesString;
    }

    public build(): DynamicStructuredTool {
        const tool = new DynamicStructuredTool({
            name: this.name,
            description: this.description,
            schema: this.scheme,
            func: this.run
        })

        return tool;

    }
}

export const createReadLinesTool = new CreateReadLinesTool().build();