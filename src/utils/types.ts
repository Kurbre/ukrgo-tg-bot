import type { Conversation, ConversationFlavor } from "@grammyjs/conversations";
import type { Context, SessionFlavor } from "grammy";

export interface SessionData {
  idUser: string;
  emailPost: string;
}

// контекст без разговоров, но с сессией
export type MyBaseContext = Context & SessionFlavor<SessionData>;

// полный контекст: Context + Session + Conversations (для внешнего middleware)
export type MyContext = ConversationFlavor<MyBaseContext>;

// контекст внутри самого диалога
export type MyConversationContext = MyBaseContext;

// объект conversation
export type MyConversation = Conversation<MyContext, MyConversationContext>;

export type PostData = {
  sectionId: string;
  subsectionId: string;
  age: string;
  weight: string;
  height: string;
  regionId: string;
  cityId: string;
  phones: string;
  text: string;
  title: string;
  captchaCode: string;
  email: string;
  userId: string;
  districtId: string;
};
