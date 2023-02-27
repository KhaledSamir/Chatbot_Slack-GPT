import pkg from '@slack/bolt';
import {SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET, SLACK_APP_TOKEN, OPENAI_API_KEY} from './secrets.js';
import {OpenAI} from "langchain/llms";
import {BufferMemory} from "langchain/memory";
import {ConversationChain} from "langchain/chains";

const app = new pkg.App({
    token: SLACK_BOT_TOKEN,
    socketMode: true,
    signingSecret: SLACK_SIGNING_SECRET,
    appToken: SLACK_APP_TOKEN,
    port: process.env.PORT || 3000
});

export async function startApp() {
    await app.start();
    await startListen();
    console.log('App has started!!');
}

const model = new OpenAI({openAIApiKey: OPENAI_API_KEY});
const memory = new BufferMemory();
const chain = new ConversationChain({llm: model, memory: memory});

async function chatGPTHandle(text) {
    // process text
    const res1 = await chain.call({input: text});
    return res1.response;
}

async function startListen() {
    app.message('', async({body, ack, say}) => {
        let message = await chatGPTHandle(body.event.text);
        await say(message)
    })
}