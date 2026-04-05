import * as cheerio from "cheerio";
import iconv from "iconv-lite";
import { client } from "./auth"; // Импортируем ваш настроенный клиент с cookie

export async function getCaptchaData() {
  try {
    // 1. Загружаем страницу, где должна быть капча
    const response = await client.get("/my_posts.php");
    const html = iconv.decode(Buffer.from(response.data), "win1251");

    const $ = cheerio.load(html);

    // 2. Ищем тег с id="captcha" или нужным селектором
    // Судя по твоему запросу, ищем элемент с id="captcha" или <img> внутри него
    const captchaSrc =
      $("#captcha").attr("src") || $("img#captcha").attr("src");

    if (!captchaSrc) {
      throw new Error("Не удалось найти URL капчи на странице");
    }

    // 3. Скачиваем саму картинку (важно: используем тот же client для куки!)
    const imageResponse = await client.get(captchaSrc, {
      responseType: "arraybuffer",
    });

    return Buffer.from(imageResponse.data);
  } catch (error) {
    console.error("Ошибка при получении капчи:", error);
    return null;
  }
}
