import { getAccountData, loginToSite } from "../utils/auth";
import { renderMenu } from "../utils/profile/menu";
import type { MyConversation, MyConversationContext } from "../utils/types";

export const createLoginDialog = async (
  conversation: MyConversation,
  ctx: MyConversationContext,
) => {
  let success = false;

  while (!success) {
    await ctx.reply("Введите логин:");
    const loginCtx = await conversation.waitFor("message:text");
    const login = loginCtx.message.text;

    await ctx.reply("Введите пароль:");
    const passwordCtx = await conversation.waitFor("message:text");
    const password = passwordCtx.message.text;

    await ctx.reply("🔄 Пытаюсь зайти на сайт...");

    success = await loginToSite(login, password);

    if (success) {
      const accountData = await conversation.external(() => getAccountData());

      ctx.session.idUser = accountData.idUser || "";
      ctx.session.emailPost = accountData.emailPost || "";

      await ctx.reply("✅ Вы успешно авторизовались.");
      await renderMenu(ctx);

      return;
    } else {
      await ctx.reply(
        "❌ Не удалось авторизоваться. Проверьте логин/пароль. \nДавайте попробуем ещё раз",
      );
    }
  }
};
