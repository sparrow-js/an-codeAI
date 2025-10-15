import { pgTable, foreignKey, uuid, text, boolean, integer, timestamp, jsonb, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const previews = pgTable("previews", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	chatId: uuid("chat_id"),
	baseUrl: text("base_url").notNull(),
	port: text(),
	ready: boolean().default(false),
	isLoading: boolean("is_loading").default(true),
	loadingProgress: integer("loading_progress").default(0),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [chats.id],
			name: "previews_chat_id_chats_id_fk"
		}),
]);

export const chats = pgTable("chats", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	messages: jsonb(),
	urlId: text("url_id").notNull(),
	description: text(),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
	metadata: jsonb(),
	userId: text("user_id"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "chats_user_id_user_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const verificationToken = pgTable("verificationToken", {
	identifier: text().notNull(),
	token: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text("refresh_token"),
	accessToken: text("access_token"),
	expiresAt: integer("expires_at"),
	tokenType: text("token_type"),
	scope: text(),
	idToken: text("id_token"),
	sessionState: text("session_state"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const authenticator = pgTable("authenticator", {
	credentialId: text().notNull(),
	userId: text().notNull(),
	providerAccountId: text().notNull(),
	credentialPublicKey: text().notNull(),
	counter: integer().notNull(),
	credentialDeviceType: text().notNull(),
	credentialBackedUp: boolean().notNull(),
	transports: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "authenticator_userId_user_id_fk"
		}).onDelete("cascade"),
	unique("authenticator_credentialID_unique").on(table.credentialId),
]);

export const session = pgTable("session", {
	sessionToken: text().primaryKey().notNull(),
	userId: text().notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const deploy = pgTable("deploy", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	status: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	userId: text("user_id"),
	chatId: uuid("chat_id"),
	sitName: text("sit_name"),
	siteId: text("site_id"),
	url: text(),
}, (table) => [
	foreignKey({
			columns: [table.chatId],
			foreignColumns: [chats.id],
			name: "deploy_chat_id_chats_id_fk"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "deploy_user_id_user_id_fk"
		}),
]);

export const credits = pgTable("credits", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text().notNull(),
	credits: integer().default(0).notNull(),
	usage: integer().default(0).notNull(),
	modelName: text(),
	provider: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "credits_userId_user_id_fk"
		}).onDelete("cascade"),
]);
