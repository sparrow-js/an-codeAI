import { map } from 'nanostores';

// Cloud project info
export interface CloudProject {
  id: string;
  cloudId: string;
  chatId: string;
  projectId: string;
  publishableKey?: string;
  supabaseUrl?: string;
  workspaceId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Database table info
export interface DatabaseTable {
  name: string;
  rowCount: number;
  schema?: string;
}

// Storage bucket info
export interface StorageBucket {
  name: string;
  id: string;
  public: boolean;
  createdAt?: string;
}

// Storage file info
export interface StorageFile {
  name: string;
  id: string;
  size?: number;
  type?: string;
  lastModified?: string;
  createdAt?: string;
  isFolder?: boolean;
  publicUrl?: string;
}

// Edge function info
export interface EdgeFunction {
  verify_jwt: boolean;
  id: string;
  slug: string;
  version: number;
  name: string;
  status: string;
  entrypoint_path: string;
  import_map_path: string | null;
  import_map: boolean;
  created_at: number;
  updated_at: number;
  // Additional fields for UI display (calculated or fetched separately)
  invocations?: number;
  failed?: number;
  successRate?: number;
  deployments?: number;
  url?: string;
  code?: string;
}

// User info
export interface CloudUser {
  id: string;
  email?: string;
  phone?: string;
  createdAt?: string;
  lastSignInAt?: string;
  providers?: string[];
}

// Signup stats
export interface SignupStats {
  date: string;
  count: number;
}

  // Table column info
export interface TableColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: unknown;
  isPrimary?: boolean;
}

// Table data
export interface TableData {
  columns: TableColumn[];
  rows: unknown[];
  totalCount: number;
}

// Cloud state
interface CloudState {
  isEnabled: boolean;
  isLoading: boolean;
  currentProject: CloudProject | null;
  
  // Database
  tables: DatabaseTable[];
  loadingTables: boolean;
  
  // Table detail
  selectedTable: string | null;
  tableData: TableData | null;
  loadingTableData: boolean;
  
  // Users
  users: CloudUser[];
  loadingUsers: boolean;
  userCount: number;
  signupStats: SignupStats[];
  
  // Storage
  buckets: StorageBucket[];
  loadingBuckets: boolean;
  
  // Bucket detail
  selectedBucket: string | null;
  bucketFiles: StorageFile[];
  loadingBucketFiles: boolean;
  selectedFile: StorageFile | null;
  
  // Edge Functions
  functions: EdgeFunction[];
  loadingFunctions: boolean;
  
  // Current view
  currentView: 'overview' | 'database' | 'table-detail' | 'users' | 'auth-settings' | 'storage' | 'bucket-detail' | 'edge-functions' | 'secrets' | 'logs';
}

// Initialize cloud store
export const cloudStore = map<CloudState>({
  isEnabled: false,
  isLoading: false,
  currentProject: null,
  
  tables: [],
  loadingTables: false,
  
  selectedTable: null,
  tableData: null,
  loadingTableData: false,
  
  users: [],
  loadingUsers: false,
  userCount: 0,
  signupStats: [],
  
  buckets: [],
  loadingBuckets: false,
  
  selectedBucket: null,
  bucketFiles: [],
  loadingBucketFiles: false,
  selectedFile: null,
  
  functions: [],
  loadingFunctions: false,
  
  currentView: 'overview',
});

// Actions
export const cloudActions = {
  // Set current view
  setCurrentView(view: CloudState['currentView']) {
    cloudStore.setKey('currentView', view);
  },
  
  // Check if cloud is enabled for current chat
  async checkCloudStatus(chatId: string): Promise<boolean> {
    try {
      cloudStore.setKey('isLoading', true);
      
      const response = await fetch(`/api/supabase/status?chatId=${chatId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        cloudStore.setKey('isEnabled', true);
        cloudStore.setKey('currentProject', result.data);
        return true;
      } else {
        cloudStore.setKey('isEnabled', false);
        cloudStore.setKey('currentProject', null);
        return false;
      }
    } catch (error) {
      console.error('Error checking cloud status:', error);
      cloudStore.setKey('isEnabled', false);
      return false;
    } finally {
      cloudStore.setKey('isLoading', false);
    }
  },
  
  // Load database tables
  async loadTables(chatId: string) {
    try {
      cloudStore.setKey('loadingTables', true);
      
      const response = await fetch(`/api/supabase/tables?chatId=${chatId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        cloudStore.setKey('tables', result.data);
      }
    } catch (error) {
      console.error('Error loading tables:', error);
    } finally {
      cloudStore.setKey('loadingTables', false);
    }
  },
  
  // Select a table and load its data
  async selectTable(chatId: string, tableName: string) {
    cloudStore.setKey('selectedTable', tableName);
    cloudStore.setKey('currentView', 'table-detail');
    await this.loadTableData(chatId, tableName);
  },
  
  // Load table data
  async loadTableData(chatId: string, tableName: string, page: number = 1, pageSize: number = 50) {
    try {
      cloudStore.setKey('loadingTableData', true);
      
      const response = await fetch(
        `/api/supabase/table-data?chatId=${chatId}&tableName=${tableName}&page=${page}&pageSize=${pageSize}`
      );
      const result = await response.json();
      
      if (result.success && result.data) {
        cloudStore.setKey('tableData', result.data);
      }
    } catch (error) {
      console.error('Error loading table data:', error);
    } finally {
      cloudStore.setKey('loadingTableData', false);
    }
  },
  
  // Load users list and stats
  async loadUsers(chatId: string) {
    try {
      cloudStore.setKey('loadingUsers', true);
      
      const response = await fetch(`/api/supabase/users?chatId=${chatId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        cloudStore.setKey('userCount', result.data.count || 0);
        cloudStore.setKey('users', result.data.users || []);
        cloudStore.setKey('signupStats', result.data.signups || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      cloudStore.setKey('loadingUsers', false);
    }
  },
  
  // Load storage buckets
  async loadBuckets(chatId: string) {
    try {
      cloudStore.setKey('loadingBuckets', true);
      
      const response = await fetch(`/api/supabase/buckets?chatId=${chatId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        cloudStore.setKey('buckets', result.data);
      }
    } catch (error) {
      console.error('Error loading buckets:', error);
    } finally {
      cloudStore.setKey('loadingBuckets', false);
    }
  },
  
  // Select a bucket and load its files
  async selectBucket(chatId: string, bucketName: string) {
    cloudStore.setKey('selectedBucket', bucketName);
    cloudStore.setKey('selectedFile', null);
    cloudStore.setKey('currentView', 'bucket-detail');
    await this.loadBucketFiles(chatId, bucketName);
  },
  
  // Select a file
  selectFile(file: StorageFile | null) {
    cloudStore.setKey('selectedFile', file);
  },
  
  // Load bucket files
  async loadBucketFiles(chatId: string, bucketName: string) {
    try {
      cloudStore.setKey('loadingBucketFiles', true);
      
      const response = await fetch(
        `/api/supabase/bucket-files?chatId=${chatId}&bucketName=${bucketName}`
      );
      const result = await response.json();
      
      if (result.success && result.data) {
        cloudStore.setKey('bucketFiles', result.data);
      }
    } catch (error) {
      console.error('Error loading bucket files:', error);
    } finally {
      cloudStore.setKey('loadingBucketFiles', false);
    }
  },
  
  // Load edge functions
  async loadFunctions(chatId: string) {
    try {
      cloudStore.setKey('loadingFunctions', true);
      
      const response = await fetch(`/api/supabase/functions?chatId=${chatId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        cloudStore.setKey('functions', result.data);
      }
    } catch (error) {
      console.error('Error loading functions:', error);
    } finally {
      cloudStore.setKey('loadingFunctions', false);
    }
  },

  // Deploy edge function
  async deployFunction(chatId: string, functionName: string, functionCode: string): Promise<{success: boolean; error?: string; message?: string}> {
    try {
      const response = await fetch('/api/supabase/deploy-function', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          functionName,
          functionCode,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Reload functions list
        await this.loadFunctions(chatId);
      }
      
      return result;
    } catch (error) {
      console.error('Error deploying function:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to deploy function',
      };
    }
  },
  
  // Load all data for overview
  async loadOverview(chatId: string) {
    await Promise.all([
      this.loadTables(chatId),
      this.loadUsers(chatId),
      this.loadBuckets(chatId),
      this.loadFunctions(chatId),
    ]);
  },
  
  // Reset store
  reset() {
    cloudStore.set({
      isEnabled: false,
      isLoading: false,
      currentProject: null,
      tables: [],
      loadingTables: false,
      selectedTable: null,
      tableData: null,
      loadingTableData: false,
      users: [],
      loadingUsers: false,
      userCount: 0,
      signupStats: [],
      buckets: [],
      loadingBuckets: false,
      selectedBucket: null,
      bucketFiles: [],
      loadingBucketFiles: false,
      selectedFile: null,
      functions: [],
      loadingFunctions: false,
      currentView: 'overview',
    });
  },
};

