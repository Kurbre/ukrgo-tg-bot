import { InlineKeyboard } from "grammy";

export const getMainMenu = () => {
  return new InlineKeyboard()
    .text("📝 Создать обьявление", "action:post_start")
    .row()
    .text("🚪 Выход", "action:logout_start")
    .row()
    .url("🌐 Перейти на UkrGo", "http://ukrgo.com/my_posts.php");
};
