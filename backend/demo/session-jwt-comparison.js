import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// 環境変数を読み込み
dotenv.config();

// 【学習用デモ】セッション vs JWT 動作比較デモ
console.log('🎓 === Phase2 Step3: セッション vs JWT 比較デモ ===\n');

// ===========================================
// 1. セッション方式のシミュレーション
// ===========================================

class SessionStore {
  constructor() {
    this.sessions = new Map(); // メモリストア（実際はRedis等）
    this.sessionCount = 0;
  }

  // セッション作成
  createSession(userData) {
    const sessionId = crypto.randomBytes(32).toString('hex');
    const sessionData = {
      id: sessionId,
      userId: userData.userId,
      username: userData.username,
      role: userData.role,
      createdAt: new Date(),
      lastAccessed: new Date()
    };
    
    this.sessions.set(sessionId, sessionData);
    this.sessionCount++;
    
    console.log(`📊 セッション作成: ${sessionId.substring(0, 8)}...`);
    console.log(`   ユーザー: ${userData.username}`);
    console.log(`   メモリ使用: ${this.getMemoryUsage()} KB`);
    
    return sessionId;
  }

  // セッション検証
  validateSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { valid: false, error: 'セッションが見つかりません' };
    }

    // 有効期限チェック（例: 30分）
    const now = new Date();
    const thirtyMinutes = 30 * 60 * 1000;
    if (now - session.lastAccessed > thirtyMinutes) {
      this.sessions.delete(sessionId);
      this.sessionCount--;
      return { valid: false, error: 'セッションが期限切れです' };
    }

    // 最終アクセス時刻更新
    session.lastAccessed = now;
    
    return {
      valid: true,
      user: {
        userId: session.userId,
        username: session.username,
        role: session.role
      }
    };
  }

  // メモリ使用量計算（概算）
  getMemoryUsage() {
    const avgSessionSize = 200; // バイト（概算）
    return Math.round((this.sessions.size * avgSessionSize) / 1024);
  }

  // セッション情報表示
  showStats() {
    console.log('📈 セッションストア統計:');
    console.log(`   アクティブセッション数: ${this.sessions.size}`);
    console.log(`   累計作成数: ${this.sessionCount}`);
    console.log(`   推定メモリ使用量: ${this.getMemoryUsage()} KB`);
  }
}

// ===========================================
// 2. JWT方式のシミュレーション
// ===========================================

class JWTManager {
  constructor() {
    this.secret = process.env.JWT_SECRET || 'demo-secret-key-for-learning-only'; // 環境変数使用
    this.tokenCount = 0;
  }

  // JWT生成
  createToken(userData) {
    const payload = {
      userId: userData.userId,
      username: userData.username,
      role: userData.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 60) // 30分後
    };

    const token = jwt.sign(payload, this.secret);
    this.tokenCount++;

    console.log(`🔑 JWT生成: ${token.substring(0, 20)}...`);
    console.log(`   ユーザー: ${userData.username}`);
    console.log(`   トークンサイズ: ${Buffer.byteLength(token, 'utf8')} bytes`);
    console.log('   サーバーメモリ使用: 0 KB（ステートレス）');
    
    return token;
  }

  // JWT検証
  validateToken(token) {
    try {
      const decoded = jwt.verify(token, this.secret);
      
      return {
        valid: true,
        user: {
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role
        }
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // JWT統計表示
  showStats() {
    console.log('📈 JWT統計:');
    console.log(`   累計生成数: ${this.tokenCount}`);
    console.log('   サーバーメモリ使用量: 0 KB（ステートレス）');
    console.log('   検証処理: 各リクエストで署名検証');
  }
}

// ===========================================
// 3. 比較テスト実行
// ===========================================

async function runComparisonTest() {
  console.log('\n🔍 === 動作比較テスト開始 ===\n');

  // テストデータ
  const testUsers = [
    { userId: 1, username: 'alice', role: 'user' },
    { userId: 2, username: 'bob', role: 'admin' },
    { userId: 3, username: 'charlie', role: 'user' }
  ];

  // セッション方式テスト
  console.log('🔸 セッション方式テスト:');
  const sessionStore = new SessionStore();
  const sessionIds = [];

  testUsers.forEach(user => {
    const sessionId = sessionStore.createSession(user);
    sessionIds.push(sessionId);
  });

  console.log('');
  sessionStore.showStats();

  // セッション検証テスト
  console.log('\n🔍 セッション検証テスト:');
  const sessionValidation = sessionStore.validateSession(sessionIds[0]);
  console.log(`検証結果: ${sessionValidation.valid ? '✅ 有効' : '❌ 無効'}`);
  if (sessionValidation.valid) {
    console.log(`ユーザー情報: ${sessionValidation.user.username}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // JWT方式テスト
  console.log('🔸 JWT方式テスト:');
  const jwtManager = new JWTManager();
  const tokens = [];

  testUsers.forEach(user => {
    const token = jwtManager.createToken(user);
    tokens.push(token);
  });

  console.log('');
  jwtManager.showStats();

  // JWT検証テスト
  console.log('\n🔍 JWT検証テスト:');
  const jwtValidation = jwtManager.validateToken(tokens[0]);
  console.log(`検証結果: ${jwtValidation.valid ? '✅ 有効' : '❌ 無効'}`);
  if (jwtValidation.valid) {
    console.log(`ユーザー情報: ${jwtValidation.user.username}`);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // パフォーマンス比較
  console.log('⚡ パフォーマンス比較:');
  await performanceComparison(sessionStore, jwtManager, testUsers[0]);
}

// ===========================================
// 4. パフォーマンス比較テスト
// ===========================================

async function performanceComparison(sessionStore, jwtManager, testUser) {
  const iterations = 1000;

  // セッション方式のパフォーマンス
  console.log(`\n🏃‍♂️ セッション方式 (${iterations}回検証):`);
  const sessionId = sessionStore.createSession(testUser);
  
  const sessionStart = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    sessionStore.validateSession(sessionId);
  }
  const sessionEnd = process.hrtime.bigint();
  const sessionDuration = Number(sessionEnd - sessionStart) / 1000000; // ms

  console.log(`  実行時間: ${sessionDuration.toFixed(2)} ms`);
  console.log(`  1回あたり: ${(sessionDuration / iterations).toFixed(4)} ms`);
  console.log(`  メモリ使用: ${sessionStore.getMemoryUsage()} KB`);

  // JWT方式のパフォーマンス
  console.log(`\n🏃‍♂️ JWT方式 (${iterations}回検証):`);
  const token = jwtManager.createToken(testUser);
  
  const jwtStart = process.hrtime.bigint();
  for (let i = 0; i < iterations; i++) {
    jwtManager.validateToken(token);
  }
  const jwtEnd = process.hrtime.bigint();
  const jwtDuration = Number(jwtEnd - jwtStart) / 1000000; // ms

  console.log(`  実行時間: ${jwtDuration.toFixed(2)} ms`);
  console.log(`  1回あたり: ${(jwtDuration / iterations).toFixed(4)} ms`);
  console.log('  メモリ使用: 0 KB（ステートレス）');

  // 結果比較
  console.log('\n📊 比較結果:');
  console.log(`  セッション方式: ${sessionDuration.toFixed(2)} ms`);
  console.log(`  JWT方式: ${jwtDuration.toFixed(2)} ms`);
  
  if (sessionDuration < jwtDuration) {
    const ratio = (jwtDuration / sessionDuration).toFixed(1);
    console.log(`  結果: セッション方式がJWTより${ratio}倍高速`);
  } else {
    const ratio = (sessionDuration / jwtDuration).toFixed(1);
    console.log(`  結果: JWT方式がセッションより${ratio}倍高速`);
  }

  console.log('\n💡 学習ポイント:');
  console.log('  - セッション: 高速だがメモリ使用');
  console.log('  - JWT: 署名検証でCPU使用だがメモリ不要');
  console.log('  - スケールアウト: JWTが有利');
  console.log('  - シングルサーバー: セッションが有利');
}

// ===========================================
// 5. アーキテクチャ比較説明
// ===========================================

function showArchitectureComparison() {
  console.log('\n🏗️ === アーキテクチャ比較 ===\n');

  console.log('🔸 セッション方式（ステートフル）:');
  console.log('┌─────────────┐    ┌─────────────────┐    ┌─────────────┐');
  console.log('│   Client    │    │     Server      │    │ Session DB  │');
  console.log('│             │───▶│                │───▶│             │');
  console.log('│Cookie:      │    │1. SessionID確認 │    │SessionID    │');
  console.log('│SESSIONID=123│    │2. DB検索        │    │User Data    │');
  console.log('│             │◀───│3. 認証情報取得  │◀───│Expiry       │');
  console.log('└─────────────┘    └─────────────────┘    └─────────────┘');

  console.log('\n🔸 JWT方式（ステートレス）:');
  console.log('┌─────────────┐    ┌─────────────────┐');
  console.log('│   Client    │    │     Server      │');
  console.log('│             │───▶│                │');
  console.log('│Header:      │    │1. JWT署名検証   │');
  console.log('│Bearer JWT...│    │2. ペイロード取得│');
  console.log('│             │◀───│3. 認証完了      │');
  console.log('└─────────────┘    └─────────────────┘');

  console.log('\n💡 主な違い:');
  console.log('  セッション: サーバーが状態を保持（ステートフル）');
  console.log('  JWT: サーバーは状態を持たない（ステートレス）');
  console.log('  セッション: 外部ストレージが必要');
  console.log('  JWT: 情報がトークン内に完結');
}

// ===========================================
// 6. メイン実行
// ===========================================

async function main() {
  try {
    await runComparisonTest();
    showArchitectureComparison();
    
    console.log('\n✅ === Phase2 Step3 完了 ===');
    console.log('🎓 学習成果:');
    console.log('  - ステートレス vs ステートフルの違いを体感');
    console.log('  - パフォーマンス特性の理解');
    console.log('  - アーキテクチャ差異の可視化');
    console.log('  - スケーラビリティ特性の理解');
    
  } catch (error) {
    console.error('❌ エラー発生:', error.message);
    process.exit(1);
  }
}

// ES6 default export
export default main;

// 直接実行時の処理
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 