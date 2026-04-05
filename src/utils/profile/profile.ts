import * as cheerio from "cheerio";
import { client } from "../auth";
import iconv from "iconv-lite";

export async function parseProfileData() {
  const response = await client.get("/my_posts.php");
  const html = iconv.decode(Buffer.from(response.data), "win1251");
  const $ = cheerio.load(html);

  // 1. Парсим баланс
  // Ищем ссылку, которая ведет на balance.php
  const balanceText = $('a[href*="balance.php"]').text().trim();
  // Извлекаем только число (например, "19.00")
  const balance = parseFloat(balanceText.replace(/[^\d.]/g, "")) || 0;

  // 2. Парсим количество объявлений
  // Ищем текст внутри ссылки, содержащей "my_posts.php"
  const postsLinkText = $(
    'a[href="http://ukrgo.com/my_posts.php"]:contains("Мои объявления")',
  ).text();
  // Регуляркой достаем число из скобок: "Мои объявления (4)" -> "4"
  const postsMatch = postsLinkText.match(/\((\d+)\)/);
  const postsCount = postsMatch ? parseInt(postsMatch[1], 10) : 0;

  // 3. (Бонус) Парсим имя пользователя
  const username = $("b").first().text().trim();

  return {
    username,
    balance,
    postsCount,
  };
}
