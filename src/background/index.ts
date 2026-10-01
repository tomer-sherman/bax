import { baxAgent } from "./agent/bax";


(globalThis as any).testAgent = async (userPrompt: string) => {
    console.log(await baxAgent.run(userPrompt));

};

