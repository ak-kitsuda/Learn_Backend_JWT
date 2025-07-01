// Express.js を読み込み (ES6モジュール形式)
import express from 'express';
import cors from 'cors';

// Express アプリケーションを作成
const app = express();

// ミドルウェアの設定
app.use(cors());                      // CORS対応（異なるポート間での通信を許可）
app.use(express.json());              // JSONボディを解析（POST/PUTリクエスト用）

// Hello World エンドポイント
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World' });
});

// データベーステスト用エンドポイント
app.get('/api/db-test', async (req, res) => {
  const database = await import('./database.js');
  const db = database.default;
  
  try {
    // データベース接続
    await db.connect();
    
    // データベース初期化（テーブル作成）
    await db.initializeDatabase();
    
    // 接続テスト実行
    const testResult = await db.testConnection();
    
    // データベース情報取得
    const dbInfo = await db.getDatabaseInfo();
    
    // レスポンス返却
    res.json({
      status: 'success',
      message: 'データベース接続・初期化テスト成功',
      test_result: testResult,
      database_info: dbInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('データベーステストエラー:', error);
    res.status(500).json({
      status: 'error',
      message: 'データベース接続テスト失敗',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}); 