import { ClientError, StatusCode } from "~node_modules/error-color-logger/build";

class BaxService {

    public async getBaxCompletion(prompt: string): Promise<string> {

        console.log("Front bax service activated");
        const response = await chrome.runtime.sendMessage({ type: "ask-bax", prompt });
        console.log("Recived bax completion in the front.");
        if ("error" in response) throw new ClientError(StatusCode.InternalServerError, "Bax response has failed.")

        return response.answer;


    }



}

export const baxService = new BaxService();