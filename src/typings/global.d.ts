declare global {
    namespace NodeJS {
        interface ProcessEnv {
            BOT_TOKEN: string;
            DEV_GUILD_ID: string;
            ENV: string;
            MONGO_URI: string;
            RESET_COMMANDS: string;
        }
    }
}

export { };
