'use client';

import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Eye, EyeOff, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Secret {
  name: string;
  value: string;
}

interface SavedSecret {
  name: string;
  createdAt?: string;
}

interface SecretsViewProps {
  chatId: string;
}

export default function SecretsView({ chatId }: SecretsViewProps) {
  const { toast } = useToast();
  const [secrets, setSecrets] = useState<Secret[]>([{ name: '', value: '' }]);
  const [savedSecrets, setSavedSecrets] = useState<SavedSecret[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showValues, setShowValues] = useState<{ [key: number]: boolean }>({});

  // Load saved secrets on mount
  useEffect(() => {
    loadSecrets();
  }, [chatId]);

  const loadSecrets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/supabase/secrets?chatId=${chatId}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setSavedSecrets(result.data);
      }
    } catch (error) {
      console.error('Error loading secrets:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSecretRow = () => {
    setSecrets([...secrets, { name: '', value: '' }]);
  };

  const removeSecretRow = (index: number) => {
    if (secrets.length > 1) {
      setSecrets(secrets.filter((_, i) => i !== index));
      const newShowValues = { ...showValues };
      delete newShowValues[index];
      setShowValues(newShowValues);
    }
  };

  const updateSecret = (index: number, field: 'name' | 'value', value: string) => {
    const newSecrets = [...secrets];
    newSecrets[index][field] = value;
    setSecrets(newSecrets);
  };

  const toggleShowValue = (index: number) => {
    setShowValues({
      ...showValues,
      [index]: !showValues[index],
    });
  };

  const handleSave = async () => {
    // Filter out empty secrets
    const validSecrets = secrets.filter(s => s.name.trim() && s.value.trim());
    
    if (validSecrets.length === 0) {
      toast({
        title: '错误',
        description: '请至少添加一个 Secret',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/supabase/secrets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          secrets: validSecrets,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Reset form
        setSecrets([{ name: '', value: '' }]);
        setShowValues({});
        // Reload secrets list
        await loadSecrets();
        toast({
          title: '成功',
          description: 'Secrets 保存成功',
        });
      } else {
        toast({
          title: '保存失败',
          description: result.error || 'Secrets 保存失败',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving secrets:', error);
      toast({
        title: '保存失败',
        description: error instanceof Error ? error.message : 'Secrets 保存失败',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteSecret = async (secretName: string) => {
    if (!confirm(`Are you sure you want to delete the secret "${secretName}"?`)) {
      return;
    }

    try {
      const response = await fetch('/api/supabase/secrets', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId,
          secretName,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        await loadSecrets();
        toast({
          title: '成功',
          description: 'Secret 删除成功',
        });
      } else {
        toast({
          title: '删除失败',
          description: result.error || 'Secret 删除失败',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting secret:', error);
      toast({
        title: '删除失败',
        description: error instanceof Error ? error.message : 'Secret 删除失败',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-white mb-2">Add New Secret</h2>
        <p className="text-gray-400">Secrets securely save sensitive information like API keys.</p>
      </div>

      {/* Add New Secrets Form */}
      <div className="mb-8">
        <div className="space-y-3">
          {secrets.map((secret, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2">Name</label>
                <input
                  type="text"
                  value={secret.name}
                  onChange={(e) => updateSecret(index, 'name', e.target.value)}
                  placeholder="SECRET_NAME"
                  className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm text-gray-400 mb-2">Value</label>
                <div className="relative">
                  <input
                    type={showValues[index] ? 'text' : 'password'}
                    value={secret.value}
                    onChange={(e) => updateSecret(index, 'value', e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-zinc-600 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowValue(index)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showValues[index] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => removeSecretRow(index)}
                  disabled={secrets.length === 1}
                  className={`p-2.5 rounded-lg transition-colors ${
                    secrets.length === 1
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-400 hover:text-red-400 hover:bg-zinc-800'
                  }`}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-6">
          <button
            onClick={addSecretRow}
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another
          </button>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Saved Secrets */}
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Saved Secrets</h3>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg min-h-[300px] flex items-center justify-center">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : savedSecrets.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No secrets found for this project.</p>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-400">Created At</th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {savedSecrets.map((secret, index) => (
                    <tr key={index} className="border-b border-zinc-800 last:border-0">
                      <td className="px-6 py-4 text-white">{secret.name}</td>
                      <td className="px-6 py-4 text-gray-400">
                        {secret.createdAt 
                          ? new Date(secret.createdAt).toLocaleDateString()
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => deleteSecret(secret.name)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

