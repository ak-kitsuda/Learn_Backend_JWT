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

// サーバー起動
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}); 