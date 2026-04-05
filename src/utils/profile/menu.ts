import { getMainMenu } from "../../keyboard";
import type { MyConversationContext } from "../types";
import { parseProfileData } from "./profile";

export const renderMenu = async (ctx: MyConversationContext) => {
  const { balance, postsCount, username } = await parseProfileData();

  await ctx.reply(
    `👤 **Профиль**
    Email: ${ctx.session.emailPost}
    Логин: ${username}
    Баланс: ${balance} грн.
    Кол-во обьявлений: ${postsCount}
    
🤖 **Панель управления**
    Выберите нужное действие:`,
    {
      parse_mode: "Markdown",
      reply_markup: getMainMenu(),
    },
  );
};
