import FormData from "form-data";
import { client } from "./auth";

export async function uploadPhoto(photoBuffer: Buffer, fileName: string) {
  try {
    const form = new FormData();

    // Имя поля 'file' нужно уточнить в DevTools (вкладка Network -> Payload)
    // Обычно это 'file', 'myfile' или 'image'
    form.append("file", photoBuffer, {
      filename: fileName,
      contentType: "image/jpeg",
    });

    const response = await client.post("/moduls/uplodeFile.php", form, {
      headers: {
        ...form.getHeaders(),
        Referer: "http://ukrgo.com/my_posts.php",
      },
    });

    console.log("📸 Ответ сервера на фото:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Ошибка при загрузке фото:", error);
    return null;
  }
}
