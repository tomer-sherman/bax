import { ClientError, StatusCode } from "error-color-logger";

import { scraper } from "../utils/scraper";


class PageService {

    public async getPageLines(): Promise<string[]> {

        const browserWindow = await chrome.windows.getLastFocused({ windowTypes: ["normal"] });
        const [tab] = await chrome.tabs.query({ active: true, windowId: browserWindow.id });
        if (!tab?.id) throw new ClientError(StatusCode.NotFound, "No active tab found.");

        const response = await chrome.tabs.sendMessage(tab.id, { type: "get-html" });
        const html = response.data;

        return scraper.getPageMarkdown(html);

    }




}

export const pageService = new PageService();