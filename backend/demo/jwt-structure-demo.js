/**
 * 【学習用デモ】JWT構造解析デモ
 * 
 * このファイルはPhase2 Step2の学習用デモコードです。
 * JWTの3部構造を詳細に解析して理解するためのものです。
 * 
 * ⚠️ 注意: これは学習専用のデモコードです。本番実装ではありません。
 */

// Node.js標準モジュールを使用（ES6形式）
import crypto from 'crypto';
import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config();

console.log('🎓 === JWT構造解析デモ開始 ===\n');

// =============================================================================
// 1. 実際のJWTサンプル（学習用）
// =============================================================================

console.log('📘 1. 実際のJWTサンプル解析\n');

// 学習用JWTサンプル（実際に検証可能）
const sampleJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywibmFtZSI6IuWtpuevv-ODpuODvOOCtuODvCIsInJvbGUiOiJzdHVkZW50IiwiZXhwIjoxNzUxNDYzMjAwLCJpYXQiOjE3NTE0NTk2MDAsImlzcyI6Imp3dC1sZWFybi1hcHAiLCJhdWQiOiJqd3QtbGVhcm4tdXNlcnMifQ.8vXH2zQP9fN3yD7mK1R8sL4wV2uJ6qE9rT0pA3bC5xY';

console.log('🔍 解析対象JWT:');
console.log(sampleJWT);
console.log('\nJWTの長さ:', sampleJWT.length, 'バイト\n');

// =============================================================================
// 2. JWT分割・Base64URLデコード関数
// =============================================================================

/**
 * Base64URLデコード関数
 * @param {string} base64url - Base64URL文字列
 * @returns {string} - デコードされた文字列
 */
function base64UrlDecode(base64url) {
  // Base64URLをBase64に変換
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  
  // パディングを追加
  while (base64.length % 4) {
    base64 += '=';
  }
  
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * JWTを3つの部分に分割
 * @param {string} jwt - JWT文字列
 * @returns {object} - 分割されたJWT部分
 */
function splitJWT(jwt) {
  const parts = jwt.split('.');
  
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format');
  }
  
  return {
    header: parts[0],
    payload: parts[1],
    signature: parts[2]
  };
}

// =============================================================================
// 3. JWT構造の詳細解析
// =============================================================================

console.log('📘 2. JWT構造の詳細解析\n');

try {
  // JWTを3部分に分割
  const jwtParts = splitJWT(sampleJWT);
  
  console.log('🔧 JWT分割結果:');
  console.log('Header (Base64URL):', jwtParts.header);
  console.log('Payload (Base64URL):', jwtParts.payload);
  console.log('Signature (Base64URL):', jwtParts.signature);
  console.log('');
  
  // =============================================================================
  // 4. Header解析
  // =============================================================================
  
  console.log('📘 3. Header（ヘッダー）解析\n');
  
  const headerDecoded = base64UrlDecode(jwtParts.header);
  const headerObj = JSON.parse(headerDecoded);
  
  console.log('🔍 Header (デコード後):');
  console.log(headerDecoded);
  console.log('');
  console.log('🔍 Header (JSON解析後):');
  console.log(JSON.stringify(headerObj, null, 2));
  console.log('');
  
  console.log('📋 Headerの各フィールド解説:');
  console.log('- alg (Algorithm):', headerObj.alg, '→ 署名アルゴリズム');
  console.log('- typ (Type):', headerObj.typ, '→ トークンタイプ');
  console.log('');
  
  // =============================================================================
  // 5. Payload解析
  // =============================================================================
  
  console.log('📘 4. Payload（ペイロード）解析\n');
  
  const payloadDecoded = base64UrlDecode(jwtParts.payload);
  const payloadObj = JSON.parse(payloadDecoded);
  
  console.log('🔍 Payload (デコード後):');
  console.log(payloadDecoded);
  console.log('');
  console.log('🔍 Payload (JSON解析後):');
  console.log(JSON.stringify(payloadObj, null, 2));
  console.log('');
  
  console.log('📋 Payloadの各クレーム解説:');
  console.log('- userId:', payloadObj.userId, '→ カスタムクレーム（ユーザーID）');
  console.log('- name:', payloadObj.name, '→ カスタムクレーム（ユーザー名）');
  console.log('- role:', payloadObj.role, '→ カスタムクレーム（権限）');
  console.log('- exp:', payloadObj.exp, '→ 有効期限 (', new Date(payloadObj.exp * 1000).toLocaleString(), ')');
  console.log('- iat:', payloadObj.iat, '→ 発行時刻 (', new Date(payloadObj.iat * 1000).toLocaleString(), ')');
  console.log('- iss:', payloadObj.iss, '→ 発行者 (Issuer)');
  console.log('- aud:', payloadObj.aud, '→ 対象者 (Audience)');
  console.log('');
  
  // =============================================================================
  // 6. 標準クレームとカスタムクレーム
  // =============================================================================
  
  console.log('📘 5. 標準クレームとカスタムクレーム\n');
  
  console.log('📋 RFC 7519 標準クレーム:');
  console.log('- iss (Issuer): 発行者');
  console.log('- sub (Subject): 主体（通常はユーザーID）');
  console.log('- aud (Audience): 対象者');
  console.log('- exp (Expiration Time): 有効期限');
  console.log('- nbf (Not Before): 有効開始時刻');
  console.log('- iat (Issued At): 発行時刻');
  console.log('- jti (JWT ID): JWT固有ID');
  console.log('');
  console.log('📋 カスタムクレーム (このJWTの例):');
  console.log('- userId: アプリケーション固有のユーザーID');
  console.log('- name: ユーザー名');
  console.log('- role: ユーザーの権限');
  console.log('');
  
  // =============================================================================
  // 7. Signature解析
  // =============================================================================
  
  console.log('📘 6. Signature（署名）解析\n');
  
  console.log('🔍 Signature (Base64URL):');
  console.log(jwtParts.signature);
  console.log('');
  
  // 署名検証のデモンストレーション
  const secret = process.env.JWT_SECRET || 'your-256-bit-secret'; // 環境変数使用
  const signatureInput = `${jwtParts.header}.${jwtParts.payload}`;
  
  console.log('🔧 署名検証プロセス:');
  console.log('1. 署名対象データ:', signatureInput);
  console.log('2. 使用秘密鍵:', secret);
  console.log('3. アルゴリズム:', headerObj.alg);
  console.log('');
  
  // HMAC SHA256で署名を再計算
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signatureInput)
    .digest('base64url');
  
  console.log('🔍 計算された署名:', expectedSignature);
  console.log('🔍 JWT内の署名:', jwtParts.signature);
  console.log('✅ 署名一致:', expectedSignature === jwtParts.signature ? '成功' : '失敗');
  console.log('');
  
  // =============================================================================
  // 8. Base64URLエンコーディングの詳細
  // =============================================================================
  
  console.log('📘 7. Base64URLエンコーディングの詳細\n');
  
  const testString = 'Hello JWT World! 🚀';
  
  console.log('🔧 エンコーディング変換例:');
  console.log('元の文字列:', testString);
  
  const base64Normal = Buffer.from(testString).toString('base64');
  const base64URL = base64Normal.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  
  console.log('Base64 (標準):', base64Normal);
  console.log('Base64URL:', base64URL);
  console.log('');
  
  console.log('📋 変換ルール:');
  console.log('- + → - (プラスをハイフンに)');
  console.log('- / → _ (スラッシュをアンダースコアに)');
  console.log('- = を除去 (パディング削除)');
  console.log('');
  
  // デコード確認
  const decoded = base64UrlDecode(base64URL);
  console.log('デコード結果:', decoded);
  console.log('✅ 元の文字列と一致:', decoded === testString ? '成功' : '失敗');
  console.log('');
  
  // =============================================================================
  // 9. JWT構造の可視化
  // =============================================================================
  
  console.log('📘 8. JWT構造の可視化\n');
  
  console.log('🎨 JWT構造図:');
  console.log('');
  console.log('┌─────────────────────────────────────────────────────────┐');
  console.log('│                      JWT Token                          │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ Header          │ Payload         │ Signature           │');
  console.log('│ (アルゴリズム)   │ (クレーム)      │ (検証用署名)        │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ eyJhbGci...     │ eyJ1c2VySWQ... │ 8vXH2zQP...         │');
  console.log('│ (Base64URL)     │ (Base64URL)     │ (Base64URL)         │');
  console.log('├─────────────────────────────────────────────────────────┤');
  console.log('│ {               │ {               │ HMAC SHA256         │');
  console.log('│   "alg":"HS256",│   "userId":123, │ (Header + Payload   │');
  console.log('│   "typ":"JWT"   │   "name":"学習", │  + Secret Key)      │');
  console.log('│ }               │   "exp":1751... │                     │');
  console.log('│                 │ }               │                     │');
  console.log('└─────────────────────────────────────────────────────────┘');
  console.log('');
  
  // =============================================================================
  // 10. 学習まとめ
  // =============================================================================
  
  console.log('📘 9. Step 2-2 学習まとめ\n');
  
  console.log('🎯 理解できたこと:');
  console.log('✓ JWT の3部構造（Header.Payload.Signature）の詳細');
  console.log('✓ Base64URLエンコーディングとデコードの仕組み');
  console.log('✓ Headerの役割（アルゴリズム・タイプ情報）');
  console.log('✓ Payloadの役割（標準クレーム・カスタムクレーム）');
  console.log('✓ Signatureの役割（HMAC SHA256による改ざん検証）');
  console.log('✓ JWTが自己完結型である理由（必要情報がすべて含まれる）');
  console.log('');
  
  console.log('🔄 次のステップ:');
  console.log('→ Step 2-3: セッション比較理解（ステートレス vs ステートフル）');
  console.log('→ パフォーマンス比較デモの実装');
  console.log('');
  
} catch (error) {
  console.error('❌ JWT解析エラー:', error.message);
}

console.log('🎓 === JWT構造解析デモ完了 ===\n');

// =============================================================================
// 実行方法の説明
// =============================================================================

console.log('💻 このデモの実行方法:');
console.log('cd backend');
console.log('node demo/jwt-structure-demo.js');
console.log('');
console.log('📚 学習資料:');
console.log('- docs/jwt-concepts.md: JWT基礎概念');
console.log('- backend/demo/jwt-concept-demo.js: 基礎概念デモ'); 