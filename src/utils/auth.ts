import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import qs from "qs";
import iconv from "iconv-lite";
import * as cheerio from "cheerio";

const jar = new CookieJar();
export const client = wrapper(
  axios.create({
    jar,
    withCredentials: true,
    // Важно: работаем по HTTP, так как сайт старый
    baseURL: "http://ukrgo.com",
    // Имитируем реальный браузер
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Content-Type": "application/x-www-form-urlencoded",
      Connection: "close",
    },
    // Получаем ответ как Buffer, чтобы самим декодировать из 1251
    responseType: "arraybuffer",
  }),
);

export async function loginToSite(username: string, password: string) {
  try {
    // Кодируем слово "Войти" и другие данные в windows-1251
    const formData = {
      login: username,
      password: password,
      submit: "Войти",
    };

    const encodedData = qs.stringify(formData);
    // Превращаем строку в Buffer в кодировке 1251
    const body = iconv.encode(encodedData, "win1251");

    const response = await client.post("/author.php", body);

    // Декодируем ответ сайта обратно в читаемый текст
    const html = iconv.decode(Buffer.from(response.data), "win1251");

    // Проверка: на этом сайте при успехе обычно редирект или пропадает форма логина
    if (html.includes("Выход") || html.includes("Личный кабинет")) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Auth Error:", error);
    return false;
  }
}

export async function getAccountData() {
  try {
    const response = await client.get("/my_posts.php", {
      responseType: "arraybuffer",
    });

    const html = iconv.decode(Buffer.from(response.data), "win1251");
    const $ = cheerio.load(html);

    // Достаем значения из атрибута value
    const idUser = $("#id_user").val();
    const emailPost = $("#email_post").val();

    console.log(`🔎 Спарсили данные: ID=${idUser}, Email=${emailPost}`);

    return {
      idUser: idUser ? String(idUser) : null,
      emailPost: emailPost ? String(emailPost) : null,
    };
  } catch (error) {
    console.error("❌ Ошибка парсинга данных аккаунта:", error);
    return { idUser: null, emailPost: null };
  }
}
