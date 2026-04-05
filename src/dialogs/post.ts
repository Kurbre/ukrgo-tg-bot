import { InputFile, Keyboard } from "grammy";
import { getCaptchaData } from "../utils/captcha";
import { getCitiesByRegion } from "../utils/cities";
import { getDistrictsByRegion } from "../utils/district";
import { regions } from "../utils/geo";
import { createPost } from "../utils/posts";
import { renderMenu } from "../utils/profile/menu";
import type { MyConversation, MyConversationContext } from "../utils/types";

export const createPostDialog = async (
  conversation: MyConversation,
  ctx: MyConversationContext,
) => {
  const regionKeyboard = new Keyboard();

  // Область
  regions.forEach((reg, index) => {
    regionKeyboard.text(reg.title);
    // Делаем по 3 кнопки в ряд для компактности
    if ((index + 1) % 3 === 0) regionKeyboard.row();
  });

  await ctx.reply("📍 Выберите область Украины:", {
    reply_markup: regionKeyboard.resized().oneTime(),
  });

  const regionCtx = await conversation.waitFor("message:text");
  const selectedRegion = regions.find(
    (r) => r.title === regionCtx.message.text,
  );

  if (!selectedRegion) {
    await ctx.reply("❌ Область не найдена. Начните создание поста заново.", {
      reply_markup: { remove_keyboard: true },
    });

    return await renderMenu(ctx);
  }

  const regionId = selectedRegion.value;

  // Города
  await ctx.reply(
    `🔄 Загружаю города для области: ${selectedRegion.title}...`,
    {
      reply_markup: { remove_keyboard: true },
    },
  );

  const cities = await conversation.external(() =>
    getCitiesByRegion(selectedRegion.value),
  );

  if (cities.length === 0) {
    await ctx.reply(
      "⚠️ Города не найдены, будет использовано значение 'Весь регион'.",
    );
    return;
  }
  const cityKeyboard = new Keyboard();

  cities.forEach((city, index) => {
    cityKeyboard.text(city.name);
    if ((index + 1) % 3 === 0) cityKeyboard.row();
  });

  await ctx.reply("🏘 Теперь выберите город:", {
    reply_markup: cityKeyboard.resized().oneTime(),
  });

  const cityCtx = await conversation.waitFor("message:text");
  const selectedCity = cities.find((c) => c.name === cityCtx.message.text);

  const cityId = selectedCity?.id || "0";

  // Район
  await ctx.reply(`🔄 Загружаю районы для города: ${selectedCity?.name}...`, {
    reply_markup: { remove_keyboard: true },
  });

  const districts = await conversation.external(() =>
    getDistrictsByRegion(selectedCity?.id || ""),
  );

  let districtId = "";

  if (districts.length >= 1) {
    const cityKeyboard = new Keyboard();

    districts.forEach((city, index) => {
      cityKeyboard.text(city.name);
      if ((index + 1) % 3 === 0) cityKeyboard.row();
    });

    await ctx.reply("🏙️ Теперь выберите район:", {
      reply_markup: cityKeyboard.resized().oneTime(),
    });

    const districtCtx = await conversation.waitFor("message:text");
    const selectedDistrict = districts.find(
      (c) => c.name === districtCtx.message.text,
    );

    districtId = selectedDistrict?.id || "";

    await ctx.reply(
      `✅ Выбрано: ${selectedRegion.title}, г. ${selectedCity?.name || "Центр"}, район ${selectedDistrict?.name}`,
      { reply_markup: { remove_keyboard: true } },
    );
  } else {
    await ctx.reply(
      `✅ Выбрано: ${selectedRegion.title}, г. ${selectedCity?.name || "Центр"}`,
      { reply_markup: { remove_keyboard: true } },
    );
  }

  // Возраст
  await ctx.reply("🧓 Введите возраст: ");
  const ageCtx = await conversation.waitFor("message:text");
  const age = ageCtx.message.text;

  // Рост
  await ctx.reply("📈 Введите рост: ");
  const heightCtx = await conversation.waitFor("message:text");
  const height = heightCtx.message.text;

  // Вес
  await ctx.reply("⚖️ Введите вес: ");
  const weightCtx = await conversation.waitFor("message:text");
  const weight = weightCtx.message.text;

  // Заголовок
  await ctx.reply("📒 Введите заголовок объявления: ");
  const titleCtx = await conversation.waitFor("message:text");
  const title = titleCtx.message.text;

  // Описание
  await ctx.reply("🗒️ Введите описание объявления: ");
  const textCtx = await conversation.waitFor("message:text");
  const text = textCtx.message.text;

  // Номер телефона
  await ctx.reply(
    "📞 Введите до 3-x номеров телефона через запятую:\nПример: 0673890232, 0956780232, 0759832451",
  );
  const phoneCtx = await conversation.waitFor("message:text");
  const phones = phoneCtx.message.text.split(", ").join("|@|");

  // Каптча
  await ctx.reply("🔄 Загружаю капчу...");
  const captchaBuffer = await conversation.external(() => getCaptchaData());

  if (!captchaBuffer) return await ctx.reply("❌ Ошибка при получении капчи.");

  await ctx.replyWithPhoto(new InputFile(captchaBuffer), {
    caption: "Введите код с картинки:",
  });
  const captchaCtx = await conversation.waitFor("message:text");
  const captcha = captchaCtx.message.text.trim();

  // Публикация
  await ctx.reply("🚀 Публикую...");

  const result = await createPost({
    title,
    text,
    captchaCode: captcha,
    cityId,
    regionId, // Например, Харьков
    sectionId: "9", // Услуги
    subsectionId: "146",
    phones,
    age,
    height,
    weight,
    districtId,
    email: ctx.session.emailPost,
    userId: ctx.session.idUser,
  });

  if (result.success) {
    await ctx.reply(
      "✅ Объявление успешно добавлено!\nВам будет выслана ссылка активации объявления на почту",
    );
    await renderMenu(ctx);
  } else {
    await ctx.reply("❌ Ошибка. Возможно, неверный код.");
  }
};
