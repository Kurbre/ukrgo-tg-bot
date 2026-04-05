import iconv from "iconv-lite";
import qs from "qs";
import { client } from "./auth";
import type { PostData } from "./types";

export async function createPost(postData: PostData) {
  try {
    // Данные строго по твоему дампу
    const payload = {
      id_user: postData.userId,
      id_region: postData.regionId,
      id_city: postData.cityId,
      id_district: postData.districtId,
      id_section: postData.sectionId,
      id_subsection: postData.subsectionId,
      filters: `2|!|${postData.age}|!|${postData.weight}|!|${postData.height}|!|`,
      name: postData.title, // Заголовок в поле 'name'
      text: postData.text, // Текст объявления
      email: postData.email, // Твой email
      top: "0",
      keystring: postData.captchaCode, // Поле для капчи
      package: "0",
      terms: "true", // Галочка согласия
      phones: postData.phones, // Телефон строкой
    };

    // Кодируем в win1251 (сайт старый)
    const encodedBody = qs.stringify(payload);
    const bufferBody = iconv.encode(encodedBody, "win1251");

    const response = await client.post("/moduls/add_post.php", bufferBody, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Referer: "http://ukrgo.com/my_posts.php#new_post",
        "X-Requested-With": "XMLHttpRequest",
      },
      // Ожидаем Buffer, так как у нас responseType: 'arraybuffer' в конфиге axios
      responseType: "arraybuffer",
    });

    const htmlResponse = iconv.decode(Buffer.from(response.data), "win1251");

    // Логируем для отладки
    console.log("Статус ответа:", response.status);
    console.log("Тело ответа (фрагмент):", htmlResponse.substring(0, 300));

    // Обычно при успехе скрипт возвращает JSON или текст с ID поста
    // Если видишь цифры или "success", значит сработало
    if (response.status === 200) {
      if (htmlResponse.includes("Не корректно введен текст с картинки."))
        return { success: false };

      return { success: true };
    }

    return { success: false, message: htmlResponse };
  } catch (error: any) {
    console.error(
      "Ошибка при создании объявления:",
      error.response?.status || error.message,
    );
    return { success: false };
  }
}
