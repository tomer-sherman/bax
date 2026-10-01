
class AppConfig {

    public readonly openAiApiKey = process.env.PLASMO_PUBLIC_OPENAI_API_KEY!;

}

export const appConfig = new AppConfig();