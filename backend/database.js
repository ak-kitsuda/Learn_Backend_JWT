/**
 * 【Phase1 ステップ4】データベース接続基盤モジュール
 * 
 * 学習目標:
 * - SQLite3の基本的な使用方法
 * - ES6モジュールでのデータベース操作
 * - 非同期処理 (Promise, async/await)
 * - エラーハンドリングの実装
 */

import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// __dirname のES6モジュール版実装
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// データベースファイルのパス設定
const DB_DIR = join(__dirname, 'data');
const DB_PATH = join(DB_DIR, 'todo.db');

/**
 * データベース接続クラス
 * 
 * 学習ポイント:
 * - クラスベースでの設計
 * - シングルトンパターンの実装
 * - リソース管理（接続の開閉）
 */
class Database {
  constructor() {
    this.db = null;
    this.isConnected = false;
  }

  /**
   * データベース接続の初期化
   * 
   * 学習ポイント:
   * - 非同期処理での Promise 化
   * - ディレクトリの自動作成
   * - 接続エラーのハンドリング
   */
  async connect() {
    return new Promise((resolve, reject) => {
      try {
        // データベースディレクトリの作成（存在しない場合）
        if (!existsSync(DB_DIR)) {
          mkdirSync(DB_DIR, { recursive: true });
          console.log('📁 データベースディレクトリを作成しました:', DB_DIR);
        }

        // SQLite3 データベース接続
        this.db = new sqlite3.Database(DB_PATH, (err) => {
          if (err) {
            console.error('❌ データベース接続エラー:', err.message);
            this.isConnected = false;
            reject(err);
          } else {
            console.log('✅ SQLite データベースに接続しました:', DB_PATH);
            this.isConnected = true;
            resolve();
          }
        });

      } catch (error) {
        console.error('❌ データベース初期化エラー:', error.message);
        this.isConnected = false;
        reject(error);
      }
    });
  }

  /**
   * データベース接続の終了
   * 
   * 学習ポイント:
   * - リソースの適切な解放
   * - 非同期での接続終了処理
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err) => {
        if (err) {
          console.error('❌ データベース切断エラー:', err.message);
          reject(err);
        } else {
          console.log('✅ データベース接続を終了しました');
          this.isConnected = false;
          this.db = null;
          resolve();
        }
      });
    });
  }

  /**
   * データベース接続状態の確認
   * 
   * 学習ポイント:
   * - ヘルスチェック機能の実装
   * - 簡単なSQLクエリでの接続確認
   */
  async testConnection() {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.isConnected) {
        reject(new Error('データベースに接続されていません'));
        return;
      }

      // 簡単なクエリで接続テスト
      this.db.get('SELECT 1 as test', (err, row) => {
        if (err) {
          console.error('❌ 接続テストエラー:', err.message);
          reject(err);
        } else {
          console.log('✅ データベース接続テスト成功:', row);
          resolve(row);
        }
      });
    });
  }

  /**
   * データベースの初期化
   * 
   * 学習ポイント:
   * - テーブル作成の基本的な流れ
   * - CREATE TABLE IF NOT EXISTS 構文
   * - データベーススキーマの設計
   */
  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.isConnected) {
        reject(new Error('データベースに接続されていません'));
        return;
      }

      // 学習用の簡単なテーブル作成
      const createTestTable = `
        CREATE TABLE IF NOT EXISTS test_table (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;

      this.db.run(createTestTable, (err) => {
        if (err) {
          console.error('❌ テーブル作成エラー:', err.message);
          reject(err);
        } else {
          console.log('✅ テーブル初期化完了');
          resolve();
        }
      });
    });
  }

  /**
   * データベース情報の取得
   * 
   * 学習ポイント:
   * - SQLite のメタデータ取得
   * - デバッグ用情報の表示
   */
  async getDatabaseInfo() {
    return new Promise((resolve, reject) => {
      if (!this.db || !this.isConnected) {
        reject(new Error('データベースに接続されていません'));
        return;
      }

      const info = {
        path: DB_PATH,
        connected: this.isConnected,
        sqlite_version: null,
        tables: []
      };

      // SQLite バージョン取得
      this.db.get('SELECT sqlite_version() as version', (err, row) => {
        if (err) {
          reject(err);
        } else {
          info.sqlite_version = row.version;
          
          // テーブル一覧取得
          this.db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
            if (err) {
              reject(err);
            } else {
              info.tables = rows.map(row => row.name);
              resolve(info);
            }
          });
        }
      });
    });
  }
}

// シングルトンインスタンス
const dbInstance = new Database();

export default dbInstance;

/**
 * 使用例とテスト用関数
 * 
 * 学習用デモ: このコメントブロックは実際のコードではありません
 * 
 * // データベース接続
 * await dbInstance.connect();
 * 
 * // データベース初期化（テーブル作成）
 * await dbInstance.initializeDatabase();
 * 
 * // 接続テスト
 * await dbInstance.testConnection();
 * 
 * // データベース情報取得
 * const info = await dbInstance.getDatabaseInfo();
 * console.log(info);
 * 
 * // 接続終了
 * await dbInstance.close();
 */ 