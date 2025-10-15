import { relations } from "drizzle-orm/relations";
import { chats, previews, user, account, authenticator, session, deploy, credits } from "./schema";

export const previewsRelations = relations(previews, ({one}) => ({
	chat: one(chats, {
		fields: [previews.chatId],
		references: [chats.id]
	}),
}));

export const chatsRelations = relations(chats, ({one, many}) => ({
	previews: many(previews),
	user: one(user, {
		fields: [chats.userId],
		references: [user.id]
	}),
	deploys: many(deploy),
}));

export const userRelations = relations(user, ({many}) => ({
	chats: many(chats),
	accounts: many(account),
	authenticators: many(authenticator),
	sessions: many(session),
	deploys: many(deploy),
	credits: many(credits),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const authenticatorRelations = relations(authenticator, ({one}) => ({
	user: one(user, {
		fields: [authenticator.userId],
		references: [user.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const deployRelations = relations(deploy, ({one}) => ({
	chat: one(chats, {
		fields: [deploy.chatId],
		references: [chats.id]
	}),
	user: one(user, {
		fields: [deploy.userId],
		references: [user.id]
	}),
}));

export const creditsRelations = relations(credits, ({one}) => ({
	user: one(user, {
		fields: [credits.userId],
		references: [user.id]
	}),
}));