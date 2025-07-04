/**
 * 【学習用デモ】JWT基礎概念理解デモ
 * 
 * このファイルはPhase2 Step1の学習用デモコードです。
 * JWTの基本概念をコードを通して理解するためのものです。
 * 
 * ⚠️ 注意: これは学習専用のデモコードです。本番実装ではありません。
 */

// Node.js標準モジュールを使用してJWTの概念を説明（ES6形式）
import crypto from 'crypto';
import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config();

console.log('🎓 === JWT基礎概念デモ開始 ===\n');

// =============================================================================
// 1. JWT の基本構造理解
// =============================================================================

console.log('📘 1. JWT の基本構造');
console.log('JWT は以下の3つの部分からなります:');
console.log('Header.Payload.Signature');
console.log('xxxxxxx.yyyyyyy.zzzzzzz\n');

// 実際のJWTの例（学習用）
const exampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywibmFtZSI6IuWHpueUn-ODpuODvOOCtuODvCIsImV4cCI6MTY0MDk5NTIwMH0.2jf3kDPeOjlD5tD9wK5y7Z8mN6R5uP8qF4jG7nK2sLo';

console.log('📄 実際のJWT例:');
console.log(exampleJWT);
console.log('\n');

// =============================================================================
// 2. Base64URL エンコーディング理解
// =============================================================================

console.log('📘 2. Base64URL エンコーディングの特徴\n');

const originalText = "Hello JWT World!";
const normalBase64 = Buffer.from(originalText).toString('base64');
const base64URL = normalBase64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

console.log('元のテキスト:', originalText);
console.log('通常のBase64:', normalBase64);
console.log('Base64URL:', base64URL);
console.log('\n特徴:');
console.log('- + → - に変換');
console.log('- / → _ に変換');
console.log('- = (パディング) を除去');
console.log('→ URLやHTTPヘッダーで安全に使用可能\n');

// =============================================================================
// 3. JWT の自己完結性（Self-contained）デモ
// =============================================================================

console.log('📘 3. JWT の自己完結性（Self-contained）\n');

// JWTペイロードの例
const jwtPayload = {
  userId: 123,
  name: "学習ユーザー",
  role: "student",
  exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1時間後
  iat: Math.floor(Date.now() / 1000), // 現在時刻
  iss: "jwt-learn-app", // 発行者
  aud: "jwt-learn-users" // 対象者
};

console.log('JWTペイロードに含まれる情報:');
console.log(JSON.stringify(jwtPayload, null, 2));
console.log('\n💡 重要ポイント:');
console.log('- ユーザー情報がトークン内に含まれる');
console.log('- 有効期限(exp)が設定されている');
console.log('- 発行者(iss)と対象者(aud)が明確');
console.log('- サーバー側でセッション情報を保持する必要がない\n');

// =============================================================================
// 4. ステートレス vs ステートフル 比較デモ
// =============================================================================

console.log('📘 4. ステートレス vs ステートフル 比較\n');

// セッション方式（ステートフル）のシミュレーション
const sessionStore = new Map();
const sessionId = 'session_abc123';

// セッション作成
sessionStore.set(sessionId, {
  userId: 123,
  name: "学習ユーザー",
  role: "student",
  createdAt: new Date()
});

console.log('🏪 セッション方式（ステートフル）:');
console.log('サーバー側セッションストア:', Object.fromEntries(sessionStore));
console.log('クライアント側:', { sessionId: sessionId });
console.log('認証チェック: サーバーがセッションストアを参照 → DB/メモリアクセス必要\n');

// JWT方式（ステートレス）のシミュレーション
console.log('🎫 JWT方式（ステートレス）:');
console.log('サーバー側状態:', '（なし - ステートレス）');
console.log('クライアント側:', { jwt: 'ヘッダー.ペイロード.署名' });
console.log('認証チェック: トークン検証のみ → 外部ストアアクセス不要\n');

// =============================================================================
// 5. 署名による完全性保証デモ
// =============================================================================

console.log('📘 5. 署名による完全性保証\n');

const secret = process.env.JWT_SECRET || 'your-256-bit-secret';
const header = { alg: 'HS256', typ: 'JWT' };
const payload = { userId: 123, exp: Math.floor(Date.now() / 1000) + 3600 };

// 署名対象データの作成
const headerBase64 = Buffer.from(JSON.stringify(header)).toString('base64url');
const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
const signatureInput = `${headerBase64}.${payloadBase64}`;

// HMAC SHA256 署名の作成
const signature = crypto.createHmac('sha256', secret).update(signatureInput).digest('base64url');

const demoJWT = `${headerBase64}.${payloadBase64}.${signature}`;

console.log('ヘッダー:', JSON.stringify(header));
console.log('ペイロード:', JSON.stringify(payload));
console.log('署名入力:', signatureInput);
console.log('生成された署名:', signature);
console.log('完成したJWT:', demoJWT);
console.log('\n💡 重要ポイント:');
console.log('- 署名により改ざんを検出可能');
console.log('- 秘密鍵を知らない第三者は有効な署名を作成不可');
console.log('- 内容は Base64 デコードで確認可能（暗号化ではない）\n');

// =============================================================================
// 6. JWT の利点・欠点の実例
// =============================================================================

console.log('📘 6. JWT の利点・欠点の実例\n');

console.log('✅ 利点の実例:');
console.log('1. スケーラビリティ:');
console.log('   - サーバー1: JWTを検証 → ユーザー123を認証');
console.log('   - サーバー2: 同じJWTを検証 → ユーザー123を認証');
console.log('   - セッション共有不要！\n');

console.log('2. 自己完結性:');
console.log('   - データベース問い合わせなしで認証判定');
console.log('   - レスポンス速度向上\n');

console.log('❌ 欠点の実例:');
console.log('1. トークンサイズ:');
console.log(`   - セッションID: "${sessionId}" (約15バイト)`);
console.log(`   - JWT: "${demoJWT.substring(0, 50)}..." (約${demoJWT.length}バイト)`);
console.log('   - 毎回のリクエストで大きなデータを送信\n');

console.log('2. 無効化の困難さ:');
console.log('   - セッション: サーバー側で即座に削除可能');
console.log('   - JWT: 期限切れまで有効（ブラックリスト管理が必要）\n');

// =============================================================================
// 7. 学習まとめ
// =============================================================================

console.log('📘 7. Step 2-1 学習まとめ\n');

console.log('🎯 理解できたこと:');
console.log('✓ JWT の基本構造（Header.Payload.Signature）');
console.log('✓ Base64URL エンコーディングの特徴');
console.log('✓ 自己完結型（Self-contained）の意味');
console.log('✓ ステートレス認証の仕組み');
console.log('✓ 署名による完全性保証');
console.log('✓ JWT の利点と欠点\n');

console.log('🔄 次のステップ:');
console.log('→ Step 2-2: JWT構造解析（Header.Payload.Signatureの詳細分析）');
console.log('→ jsonwebtoken ライブラリを使った実装\n');

console.log('🎓 === JWT基礎概念デモ完了 ===\n');

// =============================================================================
// 実行方法の説明
// =============================================================================

console.log('💻 このデモの実行方法:');
console.log('cd backend');
console.log('node demo/jwt-concept-demo.js');
console.log('\n📚 学習資料:');
console.log('- docs/jwt-concepts.md: 詳細な概念説明');
console.log('- docs/session-jwt-comparison.md: セッション方式との比較'); 