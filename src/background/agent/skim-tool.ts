import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

import { pageService } from "../service/page-service";
import { scraper } from "../utils/scraper";

class CreateSkimToolBuilder {

    private name = "skim_page";

    private readonly description = "Returns every line of the current page, combined with numbers for each line, If there are ... in the end of the sentence it means that, you do not see the full sentence since you are only getting a skim view.";

    private scheme = z.object({});

    private async run() {
        return scraper.getSkimView(await pageService.getPageLines());
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

export const createSkimToolBuilder = new CreateSkimToolBuilder().build();