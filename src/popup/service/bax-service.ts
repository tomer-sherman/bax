import { ClientError, StatusCode } from "~node_modules/error-color-logger/build";
import type { ChatMessage } from "~src/shared/models";

class BaxService {

    public async getBaxCompletion(chat: ChatMessage[]): Promise<string> {
        console.log("Hello?????????????" + chat);
        const response = await chrome.runtime.sendMessage({ type: "ask-bax", chat });
        console.log(response);
        console.log("Recived bax completion in the front.");
        if ("error" in response) throw new ClientError(StatusCode.InternalServerError, "Bax response has failed.")

        return response.answer;


    }



}

export const baxService = new BaxService();