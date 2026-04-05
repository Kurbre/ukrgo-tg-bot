import iconv from "iconv-lite";
import { client } from "./auth";

export async function getCitiesByRegion(regionId: string) {
  try {
    // В теле запроса сайт ждет id_region. Передаем как x-www-form-urlencoded
    const response = await client.post(
      "/moduls/get_search.php",
      `id_region=${regionId}`,
      {
        responseType: "arraybuffer",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const data = iconv.decode(Buffer.from(response.data), "win1251");

    // Ответ выглядит так: Название1|,|Название2@|,|ID1|,|ID2
    // Разделяем на часть с именами и часть с ID
    const [namesPart, idsPart] = data.split("@");
    if (!namesPart || !idsPart) return [];

    // Чистим от разделителей |,|, превращая в массивы
    const names = namesPart.split("|,|").map((n) => n.trim());
    const ids = idsPart.split(",").map((id) => id.trim());

    const cities: { id: string; name: string }[] = [];

    // Сопоставляем имя и ID по индексу
    // Начинаем с 1, так как 0-й элемент обычно "Не важно"
    for (let i = 1; i < names.length; i++) {
      if (names[i] && ids[i - 1]) {
        // ID обычно на 1 меньше в массиве, если "Не важно" нет во второй части
        cities.push({
          id: ids[i],
          name: names[i],
        });
      }
    }

    return cities;
  } catch (error) {
    console.error("❌ Ошибка парсинга городов:", error);
    return [];
  }
}
