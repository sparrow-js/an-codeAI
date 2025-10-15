"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/shadui/button";
import { Input } from "@/components/shadui/input";
import { Label } from "@/components/shadui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shadui/select";
import { Badge } from "@/components/shadui/badge";
import { Loader2, Plus, RefreshCw, Trash2, Eye, Database, Key, Copy, Check, Code, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/shadui/dialog";

interface SupabaseProject {
  id: string;
  name: string;
  region: string;
  organization_id: string;
  created_at: string;
  status?: string;
}

interface ProjectApiKeys {
  projectId: string;
  url: string;
  publishableKey: string;
  serviceRoleKey: string;
}

const REGIONS = [
  { value: "us-east-1", label: "美国东部（弗吉尼亚）" },
  { value: "us-west-1", label: "美国西部（加利福尼亚）" },
  { value: "eu-west-1", label: "欧洲（爱尔兰）" },
  { value: "ap-southeast-1", label: "亚太（新加坡）" },
];

const PLANS = [
  { value: "free", label: "免费计划" },
  { value: "pro", label: "专业计划" },
];

const INIT_SQL = `-- 创建用户档案表
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
  EXECUTE FUNCTION public.handle_new_user();`;

export default function SupabasePage() {
  const { data: session } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [projectApiKeys, setProjectApiKeys] = useState<Record<string, ProjectApiKeys>>({});
  const [loadingApiKeys, setLoadingApiKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showSqlDialog, setShowSqlDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [dbPassword, setDbPassword] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [systemPrompts, setSystemPrompts] = useState<Record<string, string>>({});
  const [showPromptDialog, setShowPromptDialog] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    organizationId: "",
    region: "us-east-1",
    plan: "free",
    dbPassword: "",
  });

  const loadProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await fetch("/api/supabase/projects");
      const result = await response.json();
      if (result.success) {
        setProjects(result.data || []);
      } else {
        toast.error(result.error || "加载项目列表失败");
      }
    } catch (error: any) {
      toast.error("加载项目列表失败");
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.organizationId) {
      toast.error("请填写项目名称和组织 ID");
      return;
    }
    setIsCreating(true);
    try {
      const response = await fetch("/api/supabase/create-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message || "项目创建成功！");
        setFormData({
          name: "",
          organizationId: formData.organizationId,
          region: "us-east-1",
          plan: "free",
          dbPassword: "",
        });
        setShowCreateForm(false);
        loadProjects();
      } else {
        toast.error(result.error || "创建项目失败");
      }
    } catch (error: any) {
      toast.error("创建项目失败");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("确定要删除这个项目吗？")) return;
    try {
      const response = await fetch("/api/supabase/projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("项目删除成功");
        loadProjects();
      } else {
        toast.error(result.error || "删除项目失败");
      }
    } catch (error: any) {
      toast.error("删除项目失败");
    }
  };

  const handleGetApiKeys = async (projectId: string) => {
    setLoadingApiKeys(prev => ({ ...prev, [projectId]: true }));
    try {
      const response = await fetch(`/api/supabase/api-keys?projectId=${projectId}`);
      const result = await response.json();
      
      console.log('API Keys result:', result); // Debug log
      
      if (result.success) {
        setProjectApiKeys(prev => ({ ...prev, [projectId]: result.data }));
        if (result.systemPrompt) {
          setSystemPrompts(prev => ({ ...prev, [projectId]: result.systemPrompt }));
        }
        toast.success("API Keys 获取成功");
      } else {
        toast.error(result.error || "获取 API Keys 失败");
      }
    } catch (error: any) {
      console.error('Error fetching API keys:', error);
      toast.error("获取 API Keys 失败: " + error.message);
    } finally {
      setLoadingApiKeys(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const handleShowPrompt = (projectId: string) => {
    setSelectedPrompt(systemPrompts[projectId] || "");
    setShowPromptDialog(true);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(selectedPrompt);
      toast.success("System Prompt 已复制到剪贴板！");
    } catch (error) {
      toast.error("复制失败");
    }
  };

  const handleCopyKey = async (key: string, keyType: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      toast.success(`${keyType} 已复制到剪贴板`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      toast.error("复制失败");
    }
  };

  const handleShowSql = (projectId: string) => {
    setSelectedProjectId(projectId);
    setDbPassword("");
    setShowSqlDialog(true);
  };

  const handleCopySql = async () => {
    try {
      await navigator.clipboard.writeText(INIT_SQL);
      toast.success("SQL 已复制到剪贴板！");
    } catch (error) {
      toast.error("复制失败");
    }
  };

  const handleOpenSqlEditor = () => {
    if (selectedProjectId) {
      window.open(`https://app.supabase.com/project/${selectedProjectId}/sql/new`, "_blank");
    }
  };

  const handleAutoInitialize = async () => {
    if (!selectedProjectId || !dbPassword) {
      toast.error("请输入数据库密码");
      return;
    }

    setIsInitializing(true);
    try {
      const response = await fetch("/api/supabase/initialize-tables", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProjectId,
          dbPassword,
        }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast.success("表结构初始化成功！");
        setShowSqlDialog(false);
        setDbPassword("");
      } else {
        toast.error(result.error || "初始化失败");
      }
    } catch (error: any) {
      console.error('Error initializing tables:', error);
      toast.error("初始化失败: " + error.message);
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (session) loadProjects();
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>需要登录</CardTitle>
            <CardDescription>请先登录后才能管理 Supabase 项目</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Database className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">Supabase 项目管理</h1>
          </div>
          <p className="text-gray-600">创建和管理你的 Supabase 项目</p>
        </div>

        <div className="flex gap-3 mb-6">
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            <Plus className="w-4 h-4 mr-2" />
            {showCreateForm ? "取消创建" : "创建新项目"}
          </Button>
          <Button variant="outline" onClick={loadProjects} disabled={isLoadingProjects}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingProjects ? "animate-spin" : ""}`} />
            刷新
          </Button>
        </div>

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>创建新项目</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">项目名称 *</Label>
                    <Input id="name" placeholder="my-project" value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationId">组织 ID *</Label>
                    <Input id="organizationId" placeholder="org-id" value={formData.organizationId}
                      onChange={(e) => setFormData({ ...formData, organizationId: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region">区域</Label>
                    <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {REGIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan">计划</Label>
                    <Select value={formData.plan} onValueChange={(value) => setFormData({ ...formData, plan: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {PLANS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="dbPassword">数据库密码（可选）</Label>
                    <Input id="dbPassword" type="password" placeholder="留空自动生成" value={formData.dbPassword}
                      onChange={(e) => setFormData({ ...formData, dbPassword: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>取消</Button>
                  <Button type="submit" disabled={isCreating}>
                    {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />创建中...</> : "创建项目"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>我的项目</CardTitle>
            <CardDescription>{projects.length} 个项目</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProjects ? (
              <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : projects.length === 0 ? (
              <div className="text-center py-12">
                <Database className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">还没有项目</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{project.name}</h3>
                          {project.status && <Badge variant="outline">{project.status}</Badge>}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><span className="font-medium">ID:</span> <code className="bg-gray-100 px-2 py-1 rounded text-xs">{project.id}</code></div>
                          <div><span className="font-medium">区域:</span> {project.region}</div>
                          <div><span className="font-medium">创建:</span> {new Date(project.created_at).toLocaleString("zh-CN")}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm"
                          onClick={() => handleGetApiKeys(project.id)}
                          disabled={loadingApiKeys[project.id]}>
                          {loadingApiKeys[project.id] ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Key className="w-4 h-4 mr-1" />
                          )}
                          API Keys
                        </Button>
                        {systemPrompts[project.id] && (
                          <Button variant="outline" size="sm"
                            onClick={() => handleShowPrompt(project.id)}>
                            <FileText className="w-4 h-4 mr-1" />
                            System Prompt
                          </Button>
                        )}
                        <Button variant="outline" size="sm"
                          onClick={() => handleShowSql(project.id)}>
                          <Code className="w-4 h-4 mr-1" />
                          初始化表 SQL
                        </Button>
                        <Button variant="outline" size="sm"
                          onClick={() => window.open(`https://app.supabase.com/project/${project.id}`, "_blank")}>
                          <Eye className="w-4 h-4 mr-1" />查看
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteProject(project.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />删除
                        </Button>
                      </div>
                    </div>
                    
                    {/* Loading state */}
                    {loadingApiKeys[project.id] && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-500">正在加载 API Keys...</p>
                      </div>
                    )}
                    
                    {/* Display API Keys */}
                    {projectApiKeys[project.id] && projectApiKeys[project.id].publishableKey && projectApiKeys[project.id].serviceRoleKey && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">PROJECT_ID</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyKey(projectApiKeys[project.id].projectId, "PROJECT_ID")}
                            >
                              {copiedKey === projectApiKeys[project.id].projectId ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <code className="block w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded text-xs break-all font-mono">
                            {projectApiKeys[project.id].projectId}
                          </code>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">URL</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyKey(projectApiKeys[project.id].url, "URL")}
                            >
                              {copiedKey === projectApiKeys[project.id].url ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <code className="block w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded text-xs break-all font-mono">
                            {projectApiKeys[project.id].url}
                          </code>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">PUBLISHABLE_KEY (anon)</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyKey(projectApiKeys[project.id].publishableKey, "PUBLISHABLE_KEY")}
                            >
                              {copiedKey === projectApiKeys[project.id].publishableKey ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <code className="block w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded text-xs break-all font-mono">
                            {projectApiKeys[project.id].publishableKey}
                          </code>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">SERVICE_ROLE_KEY</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopyKey(projectApiKeys[project.id].serviceRoleKey, "SERVICE_ROLE_KEY")}
                            >
                              {copiedKey === projectApiKeys[project.id].serviceRoleKey ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <code className="block w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 rounded text-xs break-all font-mono">
                            {projectApiKeys[project.id].serviceRoleKey}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* SQL 对话框 */}
        <Dialog open={showSqlDialog} onOpenChange={(open) => {
          setShowSqlDialog(open);
          if (!open) setDbPassword("");
        }}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>初始化表结构</DialogTitle>
              <DialogDescription>
                输入数据库密码自动执行，或手动复制 SQL 到 Supabase SQL Editor 中执行
              </DialogDescription>
            </DialogHeader>
            
            {/* 自动执行选项 */}
            <div className="space-y-3 pb-4 border-b">
              <Label htmlFor="dbPassword">数据库密码（用于自动执行）</Label>
              <div className="flex gap-3">
                <Input
                  id="dbPassword"
                  type="password"
                  placeholder="输入项目的数据库密码"
                  value={dbPassword}
                  onChange={(e) => setDbPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && dbPassword) {
                      handleAutoInitialize();
                    }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={handleAutoInitialize} 
                  disabled={!dbPassword || isInitializing}
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      执行中...
                    </>
                  ) : (
                    <>
                      <Database className="w-4 h-4 mr-2" />
                      自动执行
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                💡 提示：这是您在创建项目时设置的数据库密码
              </p>
            </div>

            {/* SQL 预览 */}
            <div className="flex-1 overflow-auto">
              <Label className="text-sm font-medium mb-2 block">SQL 脚本预览</Label>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                <code>{INIT_SQL}</code>
              </pre>
            </div>
            
            {/* 手动执行选项 */}
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleCopySql} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                复制 SQL
              </Button>
              <Button onClick={handleOpenSqlEditor} variant="outline" className="flex-1">
                <Code className="w-4 h-4 mr-2" />
                打开 SQL Editor
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* System Prompt 对话框 */}
        <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>System Prompt</DialogTitle>
              <DialogDescription>
                生成的系统提示词，包含了 Supabase 项目配置信息
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-auto">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap">
                <code>{selectedPrompt}</code>
              </pre>
            </div>
            
            <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleCopyPrompt} variant="outline" className="flex-1">
                <Copy className="w-4 h-4 mr-2" />
                复制 System Prompt
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
