import { pgTable, serial, text, integer, timestamp, uuid, jsonb, boolean, primaryKey, pgEnum, unique, index } from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters"

// Enums for various functionalities
export const planEnum = pgEnum('plan', ['FREE', 'ONETIME', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE']);
export const workspaceRoleEnum = pgEnum('workspace_role', ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);
export const invitationStatusEnum = pgEnum('invitation_status', ['PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED']);
export const visibilityEnum = pgEnum('visibility', ['PRIVATE', 'PUBLIC', 'WORKSPACE_ONLY']);
export const machineStateEnum = pgEnum('machine_state', ['created', 'starting', 'started', 'stopping', 'stopped', 'suspended', 'destroying', 'destroyed']);
export const deployMachineStatusEnum = pgEnum('deploy_machine_status', ['creating', 'created', 'starting', 'started', 'stopping', 'stopped', 'error', 'deleted']);

export const chats = pgTable('chats', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  workspaceId: text("workspace_id").references(() => workspaces.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  messages: jsonb('messages').$type<any[]>(),
  shortId: text('short_id'), // 重命名并添加唯一约束
  description: text('description'),
  status: text('status').notNull().default('INIT'), // 使用枚举
  artifactSnapshots: jsonb('artifact_snapshots').$type<any[]>(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  previewImageUrl: text('preview_image_url'),
  visibility: visibilityEnum('visibility').notNull().default('PRIVATE'),
}, (table) => [
  {
    shortIdIndex: index('chats_short_id_idx').on(table.shortId),
    workspaceIdIndex: index('chats_workspace_id_idx').on(table.workspaceId),
    visibilityIndex: index('chats_visibility_idx').on(table.visibility),
  }
]);

export const previews = pgTable('previews', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chat_id').references(() => chats.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  baseUrl: text('base_url').notNull(),
  port: text('port'),
  ready: boolean('ready').default(false),
  isLoading: boolean('is_loading').default(true),
  loadingProgress: integer('loading_progress').default(0),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
})
 
export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
)
 
export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})
 
export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
)
 
export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    {
      compositePK: primaryKey({
        columns: [authenticator.userId, authenticator.credentialID],
      }),
    },
  ]
)

// 重构credits表为一对一关系
export const credits = pgTable('credits', {
  id: uuid('id').primaryKey().defaultRandom(),
  workspaceId: text("workspace_id").notNull().unique().references(() => workspaces.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  totalCredits: integer("total_credits").notNull().default(0),
  usedCredits: integer("used_credits").notNull().default(0),
  lastResetAt: timestamp("last_reset_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
});

export const deploy = pgTable('deploy', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text("user_id").references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  chatId: uuid('chat_id').references(() => chats.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  siteName: text("site_name"), // 修复拼写错误
  siteId: text("site_id"),
  status: text("status"), // netlify status
  hostingStatus: text("hosting_status"), // hosting status
  machineStatus: text("machine_status"),
  repoStatus: text("repo_status"), // repo status
  url: text("url"),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull().defaultNow(),
});

export const temporaryStorage = pgTable(
  "temporary_storage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
    eventName: text("event_name").notNull(),
    key: text("key").notNull(),
    value: jsonb("value").$type<Record<string, any>>().notNull(),
    expiresAt: timestamp("expires_at", { mode: "date" }),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    {
      userEventKeyIndex: index('temp_storage_user_event_key_idx').on(table.userId, table.eventName, table.key),
    }
  ]
);

// Workspace-related tables
export const workspaces = pgTable('workspaces', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  name: text('name').notNull(),
  icon: text('icon'),
  plan: planEnum('plan').notNull().default('FREE'),
  stripeId: text('stripe_id').unique(),
  additionalChatsCount: integer('additional_chats_count').notNull().default(0),
  additionalStorageCount: integer('additional_storage_count').notNull().default(0),
  chatsLimitFirstEmailSentAt: timestamp('chats_limit_first_email_sent_at', { mode: 'date' }),
  storageLimitFirstEmailSentAt: timestamp('storage_limit_first_email_sent_at', { mode: 'date' }),
  chatsLimitSecondEmailSentAt: timestamp('chats_limit_second_email_sent_at', { mode: 'date' }),
  storageLimitSecondEmailSentAt: timestamp('storage_limit_second_email_sent_at', { mode: 'date' }),
  customChatsLimit: integer('custom_chats_limit'),
  customStorageLimit: integer('custom_storage_limit'),
  customSeatsLimit: integer('custom_seats_limit'),
  isQuarantined: boolean('is_quarantined').notNull().default(false),
  isSuspended: boolean('is_suspended').notNull().default(false),
  isPastDue: boolean('is_past_due').notNull().default(false),
  isVerified: boolean('is_verified').notNull().default(false),
  description: text('description'),
});

export const memberInWorkspace = pgTable('member_in_workspace', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  role: workspaceRoleEnum('role').notNull(),
}, (table) => [
  {
    userWorkspaceUnique: unique().on(table.userId, table.workspaceId),
  }
]);

export const workspaceInvitations = pgTable('workspace_invitations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
  email: text('email').notNull(),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  role: workspaceRoleEnum('role').notNull(),
  // Optional fields for enhanced invitation management
  invitedBy: text('invited_by').references(() => users.id),
  status: invitationStatusEnum('status').notNull().default('PENDING'),
  token: text('token').unique(),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  acceptedAt: timestamp('accepted_at', { mode: 'date' }),
  rejectedAt: timestamp('rejected_at', { mode: 'date' }),
});

export const subscription = pgTable('subscription', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  // 操作人可选，支持系统自动续费等场景
  purchasedBy: text('purchased_by').references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  product: text('product').notNull(),
  providerCustomerId: text('provider_customer_id').notNull(),
  providerSubscriptionId: text('provider_subscription_id'), // Stripe subscription ID等
  status: text('status').notNull(), // active, canceled, past_due等
  currentPeriodStart: timestamp('current_period_start', { mode: 'date' }),
  currentPeriodEnd: timestamp('current_period_end', { mode: 'date' }),
  cancelAtPeriodEnd: boolean('cancel_at_period_end').notNull().default(false),
  price: integer('price'), // 价格（分）
  currency: text('currency').default('USD'),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

export const oneTimePurchase = pgTable('onetimepurchase', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  // 购买人可选
  purchasedBy: text('purchased_by').references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  product: text('product').notNull(),
  providerCustomerId: text('provider_customer_id').notNull(),
  providerPaymentId: text('provider_payment_id'), // Stripe payment intent ID等
  price: integer('price').notNull(), // 价格（分）
  currency: text('currency').notNull().default('USD'),
  status: text('status').notNull().default('completed'), // completed, failed, refunded等
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});

// Machine table for Fly.io machine management
export const machines = pgTable('machines', {
  id: uuid('id').primaryKey().defaultRandom(),
  // 关联的chat或deploy记录
  chatId: uuid('chat_id').references(() => chats.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),

  // 机器状态和类型
  state: machineStateEnum('state').notNull().default('created'), // 机器状态
  region: text('region').notNull().default('ord'), // 部署区域
  url: text('url'), // 访问URL
  // 状态和元数据
  isActive: boolean('is_active').notNull().default(true), // 是否活跃
  lastHealthCheck: timestamp('last_health_check', { mode: 'date' }), // 最后健康检查时间
  metadata: jsonb('metadata').$type<Record<string, any>>(), // 额外元数据
  // 时间戳
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
}, (table) => [
  {
    stateIndex: index('machines_state_idx').on(table.state),
    chatIdIndex: index('machines_chat_id_idx').on(table.chatId),
    activeIndex: index('machines_active_idx').on(table.isActive),
  }
]);


export const cloud = pgTable('cloud', {
  id: uuid('id').primaryKey().defaultRandom(),
  cloudId: text('cloud_id').notNull(),
  chatId: uuid('chat_id').references(() => chats.id, { onDelete: 'cascade' }),
  projectId: text('project_id').notNull(),
  publishableKey: text('publishable_key'),
  supabaseUrl: text('supabase_url'),
  dbPassword: text('db_password'),
  workspaceId: text('workspace_id').notNull().references(() => workspaces.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).notNull().defaultNow(),
});




