import { baxAgent } from "./agent/bax";
import "./agent/bax-listener"

console.log("Chrome run time working.");

(globalThis as any).testAgent = async (userPrompt: string) => {
    console.log(await baxAgent.run(userPrompt));

};

