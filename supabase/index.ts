import { customAlphabet } from 'nanoid';

// ============================================
// Supabase Management API Types & Functions
// ============================================

export interface CreateSupabaseProjectParams {
  name: string;
  organizationId: string;
  region?: string;
  plan?: 'free' | 'pro' | 'team' | 'enterprise';
  dbPassword?: string;
  kpsEnabled?: boolean;
}

export interface SupabaseProjectResponse {
  id: string;
  organization_id: string;
  name: string;
  region: string;
  created_at: string;
  database?: {
    host: string;
    version: string;
  };
  status?: string;
}

export interface CreateSupabaseProjectResult {
  success: boolean;
  data?: SupabaseProjectResponse;
  error?: string;
  message?: string;
}

/**
 * 调用 Supabase Management API 创建新项目
 * @param params 项目创建参数
 * @param accessToken Supabase Access Token (从环境变量或参数传入)
 * @returns 创建结果
 */
export async function createSupabaseProject(
  params: CreateSupabaseProjectParams,
  accessToken?: string
): Promise<CreateSupabaseProjectResult> {
  const {
    name,
    organizationId,
    region = 'us-east-1',
    plan = 'free',
    dbPassword,
    kpsEnabled = false,
  } = params;

  // 使用传入的 token 或从环境变量获取
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required. Please set SUPABASE_ACCESS_TOKEN environment variable.',
    };
  }

  try {
    // 生成随机密码（如果未提供）
    const password = dbPassword;

    const requestBody = {
      name,
      organization_id: organizationId,
      region,
      plan,
      db_pass: password,
      kps_enabled: kpsEnabled,
    };

    console.log('Creating Supabase project with params:', {
      name,
      organizationId,
      region,
      plan,
    });

    // 调用 Supabase Management API
    const response = await fetch('https://api.supabase.com/v1/projects', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Supabase API error: ${response.status} - ${errorText}`);
      
      let errorMessage = 'Failed to create Supabase project';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
        message: `HTTP ${response.status}: ${errorMessage}`,
      };
    }

    const data: SupabaseProjectResponse = await response.json();

    console.log('Supabase project created successfully:', data);

    return {
      success: true,
      data,
      message: `Project "${name}" created successfully with ID: ${data.id}`,
    };
  } catch (error: any) {
    console.error('Error creating Supabase project:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred while creating Supabase project',
    };
  }
}

/**
 * 获取 Supabase 项目详情
 * @param projectId 项目 ID
 * @param accessToken Supabase Access Token
 * @returns 项目详情
 */
export async function getSupabaseProject(
  projectId: string,
  accessToken?: string
): Promise<CreateSupabaseProjectResult> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Failed to get project: ${errorText}`,
      };
    }

    const data: SupabaseProjectResponse = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Error getting Supabase project:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * 列出组织的所有 Supabase 项目
 * @param organizationId 组织 ID
 * @param accessToken Supabase Access Token
 * @returns 项目列表
 */
export async function listSupabaseProjects(
  organizationId?: string,
  accessToken?: string
): Promise<{ success: boolean; data?: SupabaseProjectResponse[]; error?: string }> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    const url = organizationId 
      ? `https://api.supabase.com/v1/projects?organization_id=${organizationId}`
      : 'https://api.supabase.com/v1/projects';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Failed to list projects: ${errorText}`,
      };
    }

    const data: SupabaseProjectResponse[] = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Error listing Supabase projects:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * 删除 Supabase 项目
 * @param projectId 项目 ID
 * @param accessToken Supabase Access Token
 * @returns 删除结果
 */
export async function deleteSupabaseProject(
  projectId: string,
  accessToken?: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Failed to delete project: ${errorText}`,
      };
    }

    return {
      success: true,
      message: `Project ${projectId} deleted successfully`,
    };
  } catch (error: any) {
    console.error('Error deleting Supabase project:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * 获取项目的 API Keys (包括 PUBLISHABLE_KEY/anon key)
 * @param projectId 项目 ID
 * @param accessToken Supabase Access Token
 * @returns API Keys 信息
 */
export async function getSupabaseProjectApiKeys(
  projectId: string,
  accessToken?: string
): Promise<{
  success: boolean;
  data?: {
    projectId: string;
    url: string;
    publishableKey: string;
  };
  error?: string;
}> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    console.log(`Fetching API keys for project: ${projectId}`);
    
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}/api-keys`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get API keys: ${response.status} - ${errorText}`);
      return {
        success: false,
        error: `Failed to get API keys: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    console.log('API keys response data:', data);

    // API 返回的是数组格式
    const anonKeyObj = data.find((item: any) => item.name === 'anon');
    const serviceRoleKeyObj = data.find((item: any) => item.name === 'service_role');

    if (!anonKeyObj || !serviceRoleKeyObj) {
      return {
        success: false,
        error: 'Failed to find API keys in response',
      };
    }

    // 构建项目 URL
    const projectUrl = `https://${projectId}.supabase.co`;

    return {
      success: true,
      data: {
        projectId: projectId,
        url: projectUrl,
        publishableKey: anonKeyObj.api_key,
      },
    };
  } catch (error: any) {
    console.error('Error getting Supabase project API keys:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * 获取项目的 PUBLISHABLE_KEY (anon key)
 * @param projectId 项目 ID
 * @param accessToken Supabase Access Token
 * @returns PUBLISHABLE_KEY (anon key)
 */
export async function getSupabaseProjectPublishableKey(
  projectId: string,
  accessToken?: string
): Promise<{ success: boolean; data?: string; error?: string }> {
  const result = await getSupabaseProjectApiKeys(projectId, accessToken);

  if (!result.success || !result.data) {
    return {
      success: false,
      error: result.error || 'Failed to get publishable key',
    };
  }

  return {
    success: true,
    data: result.data.publishableKey,
  };
}

/**
 * 获取项目的数据库连接信息
 * @param projectId 项目 ID
 * @param accessToken Supabase Access Token
 * @returns 数据库连接信息
 */
export async function getSupabaseProjectDatabase(
  projectId: string,
  accessToken?: string
): Promise<{
  success: boolean;
  data?: {
    host: string;
    user: string;
    port: number;
    database: string;
  };
  error?: string;
}> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Failed to get project info: ${errorText}`,
      };
    }

    const project = await response.json();
    
    // Supabase 数据库连接信息
    const host = `db.${projectId}.supabase.co`;
    
    return {
      success: true,
      data: {
        host,
        user: 'postgres',
        port: 5432,
        database: 'postgres',
      },
    };
  } catch (error: any) {
    console.error('Error getting database info:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * 通过 PostgreSQL 连接直接执行 SQL
 * @param projectId 项目 ID
 * @param dbPassword 数据库密码
 * @param query SQL 查询语句
 * @param accessToken Supabase Access Token
 * @returns 执行结果
 */
export async function executeSupabaseSQLWithPostgres(
  projectId: string,
  dbPassword: string,
  query: string,
  accessToken?: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log(`Executing SQL on project: ${projectId}`);
    
    // 获取数据库连接信息
    const dbInfoResult = await getSupabaseProjectDatabase(projectId, accessToken);
    
    if (!dbInfoResult.success || !dbInfoResult.data) {
      return {
        success: false,
        error: dbInfoResult.error || 'Failed to get database info',
      };
    }

    const { host, user, port, database } = dbInfoResult.data;
    
    // 构建连接字符串
    const connectionString = `postgresql://${user}:${dbPassword}@${host}:${port}/${database}`;
    
    console.log('Connection string:', connectionString);

    // 动态导入 postgres
    const postgres = (await import('postgres')).default;
    
    // 创建连接
    const sql = postgres(connectionString, {
      max: 1, // 只使用一个连接
      idle_timeout: 20,
      connect_timeout: 10,
    });

    try {
      // 执行 SQL
      const result = await sql.unsafe(query);
      
      // 关闭连接
      await sql.end();
      
      console.log('SQL execution successful');
      
      return {
        success: true,
        data: result,
      };
    } catch (sqlError: any) {
      // 确保关闭连接
      await sql.end();
      throw sqlError;
    }
  } catch (error: any) {
    console.error('Error executing SQL:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * 获取初始化表结构的 SQL 脚本
 * @returns SQL 脚本
 */
export function getInitTableSQL(): string {
  return `
-- 创建用户档案表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 用户可以查看所有档案
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = '用户可以查看所有档案'
  ) THEN
    CREATE POLICY "用户可以查看所有档案"
      ON public.profiles FOR SELECT
      USING (true);
  END IF;
END $$;

-- 用户只能更新自己的档案
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = '用户可以更新自己的档案'
  ) THEN
    CREATE POLICY "用户可以更新自己的档案"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

-- 用户可以插入自己的档案
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = '用户可以插入自己的档案'
  ) THEN
    CREATE POLICY "用户可以插入自己的档案"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 创建客户表
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用RLS
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的客户
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = '用户可以查看自己的客户'
  ) THEN
    CREATE POLICY "用户可以查看自己的客户"
      ON public.customers FOR SELECT
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 用户可以创建自己的客户
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = '用户可以创建客户'
  ) THEN
    CREATE POLICY "用户可以创建客户"
      ON public.customers FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 用户可以更新自己的客户
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = '用户可以更新自己的客户'
  ) THEN
    CREATE POLICY "用户可以更新自己的客户"
      ON public.customers FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 用户可以删除自己的客户
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'customers' AND policyname = '用户可以删除自己的客户'
  ) THEN
    CREATE POLICY "用户可以删除自己的客户"
      ON public.customers FOR DELETE
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- 创建自动更新时间戳的函数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 为profiles表添加更新触发器
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 为customers表添加更新触发器
DROP TRIGGER IF EXISTS set_updated_at_customers ON public.customers;
CREATE TRIGGER set_updated_at_customers
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 创建自动创建用户档案的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 创建触发器：当新用户注册时自动创建档案
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
`;
}

/**
 * 初始化 Supabase 项目的默认表结构（通过 PostgreSQL 连接）
 * @param projectId 项目 ID
 * @param dbPassword 数据库密码
 * @param accessToken Supabase Access Token（可选）
 * @returns 执行结果
 */
export async function initializeSupabaseProjectTables(
  projectId: string,
  dbPassword: string,
  accessToken?: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  const initSQL = getInitTableSQL();
  
  const result = await executeSupabaseSQLWithPostgres(
    projectId,
    dbPassword,
    initSQL,
    accessToken
  );

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  return {
    success: true,
    message: '表结构初始化成功',
  };
}

/**
 * 生成随机密码
 * @param length 密码长度（默认 20）
 * @returns 随机密码
 */
export function generateRandomPassword(length: number = 20): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomPassword = customAlphabet(charset, length);
  return randomPassword();
}

// ============================================
// Edge Functions Management
// ============================================

export interface EdgeFunction {
  id: string;
  slug: string;
  name: string;
  status: string;
  version: number;
  created_at: string;
  updated_at: string;
  verify_jwt?: boolean;
  import_map?: boolean;
}

export interface DeployEdgeFunctionParams {
  projectRef: string;
  functionSlug: string;
  verifyJwt?: boolean;
  importMap?: boolean;
  importMapPath?: string;
  entrypointPath?: string;
  body?: ArrayBuffer;
}

export interface DeployEdgeFunctionResult {
  success: boolean;
  data?: EdgeFunction;
  error?: string;
  message?: string;
}

/**
 * 列出项目的所有 Edge Functions
 * @param projectRef 项目 ref
 * @param accessToken Supabase Access Token
 * @returns Edge Functions 列表
 */
export async function listEdgeFunctions(
  projectRef: string,
  accessToken?: string
): Promise<{
  success: boolean;
  data?: EdgeFunction[];
  error?: string;
}> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/functions`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to list functions: ${response.status} - ${errorText}`);
      return {
        success: false,
        error: `Failed to list functions: ${response.status} - ${errorText}`,
      };
    }

    const data: EdgeFunction[] = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Error listing Edge Functions:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * 获取单个 Edge Function 详情
 * @param projectRef 项目 ref
 * @param functionSlug 函数 slug
 * @param accessToken Supabase Access Token
 * @returns Edge Function 详情
 */
export async function getEdgeFunction(
  projectRef: string,
  functionSlug: string,
  accessToken?: string
): Promise<{
  success: boolean;
  data?: EdgeFunction;
  error?: string;
}> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/functions/${functionSlug}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get function: ${response.status} - ${errorText}`);
      return {
        success: false,
        error: `Failed to get function: ${response.status} - ${errorText}`,
      };
    }

    const data: EdgeFunction = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error('Error getting Edge Function:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * 创建新的 Edge Function
 * @param projectRef 项目 ref
 * @param functionName 函数名称
 * @param functionSlug 函数 slug（可选，默认使用 name）
 * @param accessToken Supabase Access Token
 * @returns 创建结果
 */
export async function createEdgeFunction(
  projectRef: string,
  functionName: string,
  functionSlug?: string,
  accessToken?: string
): Promise<DeployEdgeFunctionResult> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    const slug = functionSlug || functionName.toLowerCase().replace(/\s+/g, '-');
    
    const requestBody = {
      name: functionName,
      slug: slug,
      verify_jwt: false,
    };

    console.log('Creating Edge Function with params:', requestBody);

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/functions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create function: ${response.status} - ${errorText}`);
      
      let errorMessage = 'Failed to create Edge Function';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
        message: `HTTP ${response.status}: ${errorMessage}`,
      };
    }

    const data: EdgeFunction = await response.json();

    console.log('Edge Function created successfully:', data);

    return {
      success: true,
      data,
      message: `Function "${functionName}" created successfully`,
    };
  } catch (error: any) {
    console.error('Error creating Edge Function:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred while creating Edge Function',
    };
  }
}

/**
 * 部署 Edge Function
 * 根据 Supabase Management API 文档: https://supabase.com/docs/reference/api/v1-deploy-a-function
 * @param params 部署参数
 * @param accessToken Supabase Access Token
 * @returns 部署结果
 */
export async function deployEdgeFunction(
  params: DeployEdgeFunctionParams,
  accessToken?: string
): Promise<DeployEdgeFunctionResult> {
  const { 
    projectRef, 
    functionSlug, 
    verifyJwt = false, 
    importMapPath,
    entrypointPath = 'index.ts',  // 入口文件路径（Supabase 会自动添加 source/ 前缀）
    body 
  } = params;
  
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required. Please set SUPABASE_ACCESS_TOKEN environment variable.',
    };
  }

  try {
    console.log(`Deploying Edge Function "${functionSlug}" to project ${projectRef}`);

    // 使用正确的 API 端点: /v1/projects/{ref}/functions/deploy
    const url = `https://api.supabase.com/v1/projects/${projectRef}/functions/deploy`;

    // 创建 FormData 对象
    const formData = new FormData();

    // 添加 metadata (必需)
    const metadata: {
      name: string;
      verify_jwt: boolean;
      entrypoint_path: string;
      import_map_path?: string;
    } = {
      name: functionSlug,
      verify_jwt: verifyJwt,
      entrypoint_path: entrypointPath,
    };

    if (importMapPath) {
      metadata.import_map_path = importMapPath;
    }

    formData.append('metadata', JSON.stringify(metadata));

    // 添加文件 (如果有)
    if (body) {
      const blob = new Blob([body], { type: 'application/gzip' });
      formData.append('file', blob, `${functionSlug}.tar.gz`);
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 不要手动设置 Content-Type，让浏览器自动设置 multipart/form-data 的 boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Supabase API error: ${response.status} - ${errorText}`);
      
      let errorMessage = 'Failed to deploy Edge Function';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
        message: `HTTP ${response.status}: ${errorMessage}`,
      };
    }

    const data: EdgeFunction = await response.json();

    console.log('Edge Function deployed successfully:', data);

    return {
      success: true,
      data,
      message: `Function "${functionSlug}" deployed successfully (version ${data.version})`,
    };
  } catch (error: any) {
    console.error('Error deploying Edge Function:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred while deploying Edge Function',
    };
  }
}

/**
 * 更新 Edge Function 配置
 * @param projectRef 项目 ref
 * @param functionSlug 函数 slug
 * @param updates 更新内容
 * @param accessToken Supabase Access Token
 * @returns 更新结果
 */
export async function updateEdgeFunction(
  projectRef: string,
  functionSlug: string,
  updates: {
    name?: string;
    verify_jwt?: boolean;
    import_map?: boolean;
  },
  accessToken?: string
): Promise<DeployEdgeFunctionResult> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    console.log(`Updating Edge Function "${functionSlug}":`, updates);

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/functions/${functionSlug}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to update function: ${response.status} - ${errorText}`);
      
      let errorMessage = 'Failed to update Edge Function';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
        message: `HTTP ${response.status}: ${errorMessage}`,
      };
    }

    const data: EdgeFunction = await response.json();

    console.log('Edge Function updated successfully:', data);

    return {
      success: true,
      data,
      message: `Function "${functionSlug}" updated successfully`,
    };
  } catch (error: any) {
    console.error('Error updating Edge Function:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred while updating Edge Function',
    };
  }
}

/**
 * 删除 Edge Function
 * @param projectRef 项目 ref
 * @param functionSlug 函数 slug
 * @param accessToken Supabase Access Token
 * @returns 删除结果
 */
export async function deleteEdgeFunction(
  projectRef: string,
  functionSlug: string,
  accessToken?: string
): Promise<{
  success: boolean;
  error?: string;
  message?: string;
}> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    console.log(`Deleting Edge Function "${functionSlug}" from project ${projectRef}`);

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/functions/${functionSlug}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to delete function: ${response.status} - ${errorText}`);
      return {
        success: false,
        error: `Failed to delete function: ${response.status} - ${errorText}`,
      };
    }

    return {
      success: true,
      message: `Function "${functionSlug}" deleted successfully`,
    };
  } catch (error: any) {
    console.error('Error deleting Edge Function:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred',
    };
  }
}

/**
 * 部署 Edge Function（使用代码字符串直接部署）
 * @param projectId 项目 ID
 * @param functionName 函数名称
 * @param functionCode 函数代码
 * @param accessToken Supabase Access Token
 * @returns 部署结果
 */
export async function deployEdgeFunctionWithCode(
  projectId: string,
  functionName: string,
  functionCode: string,
  accessToken?: string
): Promise<DeployEdgeFunctionResult> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token not configured',
    };
  }

  try {
    // 生成 function slug（将名称转为小写并替换空格为连字符）
    const functionSlug = functionName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    // 使用 multipart/form-data 格式部署函数
    const url = `https://api.supabase.com/v1/projects/${projectId}/functions/deploy`;
    
    const formData = new FormData();
    
    // 添加 metadata
    const metadata = {
      name: functionSlug,
      verify_jwt: false,
      import_map: false,
      entrypoint_path: 'index.ts',
      import_map_path: null,
      ezbr_sha256: null,
    };
    
    formData.append('metadata', JSON.stringify(metadata));
    
    // 添加文件内容（不压缩，直接发送文本）
    const blob = new Blob([functionCode], { type: 'text/plain' });
    formData.append('file', blob, 'index.ts');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // 不设置 Content-Type，让浏览器自动设置 multipart/form-data 的 boundary
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Supabase API error: ${response.status} - ${errorText}`);
      
      let errorMessage = 'Failed to deploy Edge Function';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
        message: `HTTP ${response.status}: ${errorMessage}`,
      };
    }

    const data = await response.json();
    console.log('Edge Function deployed successfully:', data);

    return {
      success: true,
      data: data,
      message: `Function "${functionName}" deployed successfully`,
    };
  } catch (error) {
    console.error('Error deploying Edge Function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to deploy Edge Function';
    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * 更新 Supabase 项目的 site_url 配置
 * @param projectId 项目 ID
 * @param siteUrl 新的 site_url
 * @param accessToken Supabase Access Token
 * @returns 更新结果
 */
export async function updateSupabaseProjectSiteUrl(
  projectId: string,
  siteUrl: string,
  accessToken?: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  const token = accessToken || process.env.SUPABASE_ACCESS_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'Supabase access token is required',
    };
  }

  try {
    console.log(`Updating site_url for project ${projectId} to: ${siteUrl}`);

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectId}/config/auth`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          site_url: siteUrl,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to update site_url: ${response.status} - ${errorText}`);
      
      let errorMessage = 'Failed to update site_url';
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
        message: `HTTP ${response.status}: ${errorMessage}`,
      };
    }

    console.log('Site URL updated successfully');

    return {
      success: true,
      message: `Site URL updated successfully to: ${siteUrl}`,
    };
  } catch (error: any) {
    console.error('Error updating site_url:', error);
    return {
      success: false,
      error: error.message || 'Unexpected error occurred while updating site_url',
    };
  }
}




