/**
 * Database field encryption utilities
 * 用于加密和解密数据库中的敏感字段
 */

import { encrypt, decrypt } from './crypto';

/**
 * 获取数据库加密密钥
 * 从环境变量中获取，如果没有则抛出错误
 */
function getEncryptionKey(): string {
  const key = process.env.DB_ENCRYPTION_KEY;
  if (!key) {
    throw new Error('DB_ENCRYPTION_KEY environment variable is not set');
  }
  // 确保密钥长度为32字节（256位）
  if (key.length !== 32) {
    throw new Error('DB_ENCRYPTION_KEY must be exactly 32 characters long');
  }
  return key;
}

/**
 * 加密数据库字段
 * @param value 要加密的值
 * @returns 加密后的字符串，如果输入为null/undefined则返回null
 */
export async function encryptField(value: string | null | undefined): Promise<string | null> {
  if (!value) {
    return null;
  }
  
  try {
    const key = getEncryptionKey();
    const encrypted = await encrypt(key, value);
    return encrypted;
  } catch (error) {
    console.error('Error encrypting field:', error);
    throw new Error('Failed to encrypt field');
  }
}

/**
 * 解密数据库字段
 * @param encryptedValue 加密的值
 * @returns 解密后的字符串，如果输入为null/undefined则返回null
 */
export async function decryptField(encryptedValue: string | null | undefined): Promise<string | null> {
  if (!encryptedValue) {
    return null;
  }
  
  try {
    const key = getEncryptionKey();
    const decrypted = await decrypt(key, encryptedValue);
    return decrypted;
  } catch (error) {
    console.error('Error decrypting field:', error);
    throw new Error('Failed to decrypt field');
  }
}

/**
 * 批量加密敏感字段
 * @param data 包含敏感字段的数据对象
 * @returns 加密后的数据对象
 */
export async function encryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): Promise<T> {
  const result = { ...data };
  
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = await encryptField(result[field] as string) as any;
    }
  }
  
  return result;
}

/**
 * 批量解密敏感字段
 * @param data 包含加密字段的数据对象
 * @returns 解密后的数据对象
 */
export async function decryptSensitiveFields<T extends Record<string, any>>(
  data: T,
  fields: (keyof T)[]
): Promise<T> {
  const result = { ...data };
  
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      result[field] = await decryptField(result[field] as string) as any;
    }
  }
  
  return result;
}

/**
 * Cloud表敏感字段列表
 */
export const CLOUD_SENSITIVE_FIELDS = ['dbPassword', 'publishableKey'] as const;

/**
 * 加密Cloud表记录的敏感字段
 */
export async function encryptCloudRecord<T extends { dbPassword?: string | null; publishableKey?: string | null }>(
  record: T
): Promise<T> {
  return encryptSensitiveFields(record, ['dbPassword', 'publishableKey'] as (keyof T)[]);
}

/**
 * 解密Cloud表记录的敏感字段
 */
export async function decryptCloudRecord<T extends { dbPassword?: string | null; publishableKey?: string | null }>(
  record: T
): Promise<T> {
  return decryptSensitiveFields(record, ['dbPassword', 'publishableKey'] as (keyof T)[]);
}

