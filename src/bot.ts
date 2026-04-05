import { conversations, createConversation } from "@grammyjs/conversations";
import "dotenv/config";
import { Bot, session } from "grammy";
import http from "http";
import { createLoginDialog } from "./dialogs/login";
import { createPostDialog } from "./dialogs/post";
import { client } from "./utils/auth";
import type { MyContext } from "./utils/types";

http
  .createServer((_, res) => {
    res.write("I am alive");
    res.end();
  })
  .listen(process.env.PORT || 8080);

const token = process.env.TELEGRAM_TOKEN;
if (!token) throw new Error("TELEGRAM_TOKEN is not defined!");

export const bot = new Bot<MyContext>(token);

const sessionMiddleware = session({
  initial: () => ({
    idUser: "",
    emailPost: "",
  }),
});

bot.use(sessionMiddleware);
bot.use(conversations({ plugins: [sessionMiddleware] }));
bot.use(createConversation(createLoginDialog, "login"));
bot.use(createConversation(createPostDialog, "create_post"));

bot.command("start", async (ctx) => {
  await ctx.reply(
    '✅ Бот успещно запущен.\nДля коректной работы нам нужно авторизоваться на сайте "ukrgo.com", сейчас мы это сделаем.',
  );
  await ctx.conversation.enter("login");
});

bot.callbackQuery("action:logout_start", async (ctx) => {
  try {
    await ctx.answerCallbackQuery();

    await client.get("/session_destroy.php", {
      headers: {
        Referer: "http://ukrgo.com/addcountry.php",
      },
    });

    await client.defaults.jar?.removeAllCookies();
    delete client.defaults.headers.common["Cookie"];

    await ctx.reply("✅ Вы успешно вышли из аккаунта.\nДавайте зайдем заново.");
    await ctx.conversation.enter("login");
  } catch (e) {
    console.error(e);
    await ctx.reply("❌ Ошибка. Не удалось выйти из аккаунта.");
  }
});

bot.callbackQuery("action:post_start", async (ctx) => {
  await ctx.answerCallbackQuery();
  if (!ctx.session.idUser) {
    await ctx.reply("❌ Ошибка. Вы не авторизованы.\nПожалуйста авторизуйтесь");
    await ctx.conversation.enter("login");
  } else {
    await ctx.conversation.enter("create_post");
  }
});

bot.start();

export const viteNodeApp = bot;
