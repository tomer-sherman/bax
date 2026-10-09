import exp from "constants";
import { z } from "zod";
import { pageService } from "../service/page-service";
import { DynamicStructuredTool } from "@langchain/core/tools";


class CreateMdToolBuilder {

    private name = "mark_down_overview";

    private readonly description = "Returns a filtered mark down version of the whole HTML of the page with the main text content of the page"

    private scheme = z.object({});

    private async run() {
        return await pageService.getPageLines();
    }

    public build(): DynamicStructuredTool {
        const tool = new DynamicStructuredTool({
            name: this.name,
            description: this.description,
            schema: this.scheme,
            func: this.run
        })

        return tool

    }

}



export const createMdToolBuilder = new CreateMdToolBuilder().build();