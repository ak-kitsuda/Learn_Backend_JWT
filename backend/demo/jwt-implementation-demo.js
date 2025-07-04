import jwt from 'jsonwebtoken';

// 【学習用デモ】JWT実装基礎 - jsonwebtokenライブラリの基本操作
console.log('🎓 === JWT実装基礎デモ開始 ===\n');

// 1. JWT生成（jwt.sign()）のデモ
const demonstrateJWTGeneration = () => {
  console.log('📝 1. JWT生成デモ\n');
  
  // デモ用秘密鍵（実運用では環境変数から読み込み）
  const SECRET_KEY = 'demo-secret-key-for-learning-only';
  
  // ペイロード（実際のユーザー情報）
  const payload = {
    userId: 123,
    username: 'alice',
    role: 'user',
    permissions: ['read', 'write']
  };
  
  // 基本的なトークン生成
  console.log('🔹 基本的なトークン生成:');
  const basicToken = jwt.sign(payload, SECRET_KEY);
  console.log('生成されたトークン:', basicToken);
  console.log('トークンの長さ:', basicToken.length, '文字\n');
  
  // オプション付きトークン生成
  console.log('🔹 オプション付きトークン生成:');
  const advancedToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: '15m',           // 15分で期限切れ
    issuer: 'jwt-learn-app',    // 発行者
    audience: 'jwt-learn-users', // 対象者
    algorithm: 'HS256'          // 署名アルゴリズム
  });
  console.log('オプション付きトークン:', advancedToken);
  console.log('トークンの長さ:', advancedToken.length, '文字\n');
  
  // 短時間で期限切れするトークン（テスト用）
  console.log('🔹 短時間期限切れトークン（テスト用）:');
  const shortLivedToken = jwt.sign(payload, SECRET_KEY, {
    expiresIn: '2s'  // 2秒で期限切れ
  });
  console.log('短時間トークン:', shortLivedToken);
  console.log('⚠️  このトークンは2秒後に期限切れになります\n');
  
  return {
    basicToken,
    advancedToken,
    shortLivedToken,
    secretKey: SECRET_KEY
  };
};

// 2. JWT検証（jwt.verify()）のデモ
const demonstrateJWTVerification = (tokens) => {
  console.log('🔍 2. JWT検証デモ\n');
  
  const { basicToken, advancedToken, shortLivedToken, secretKey } = tokens;
  
  // 正常なトークンの検証
  console.log('🔹 正常なトークンの検証:');
  try {
    const decoded = jwt.verify(basicToken, secretKey);
    console.log('✅ 検証成功:');
    console.log('  - ユーザーID:', decoded.userId);
    console.log('  - ユーザー名:', decoded.username);
    console.log('  - 権限:', decoded.role);
    console.log('  - 発行日時:', new Date(decoded.iat * 1000).toISOString());
    console.log('  - 完全なペイロード:', decoded);
  } catch (error) {
    console.log('❌ 検証失敗:', error.message);
  }
  console.log('');
  
  // オプション付きトークンの検証
  console.log('🔹 オプション付きトークンの検証:');
  try {
    const decoded = jwt.verify(advancedToken, secretKey, {
      issuer: 'jwt-learn-app',
      audience: 'jwt-learn-users'
    });
    console.log('✅ 検証成功（オプション付き）:');
    console.log('  - 発行者:', decoded.iss);
    console.log('  - 対象者:', decoded.aud);
    console.log('  - 期限:', new Date(decoded.exp * 1000).toISOString());
  } catch (error) {
    console.log('❌ 検証失敗:', error.message);
  }
  console.log('');
  
  // 不正な秘密鍵での検証
  console.log('🔹 不正な秘密鍵での検証:');
  try {
    const wrongKey = 'wrong-secret-key';
    jwt.verify(basicToken, wrongKey);
    console.log('✅ 検証成功（これは起こらないはず）');
  } catch (error) {
    console.log('❌ 検証失敗（期待通り）:', error.message);
  }
  console.log('');
  
  // 期限切れトークンの検証（少し待ってから）
  console.log('🔹 期限切れトークンの検証:');
  console.log('⏳ 3秒待機中...');
  setTimeout(() => {
    try {
      jwt.verify(shortLivedToken, secretKey);
      console.log('✅ 検証成功（これは起こらないはず）');
    } catch (error) {
      console.log('❌ 検証失敗（期待通り）:', error.message);
      console.log('📚 学習ポイント: 期限切れトークンは自動的に拒否されます\n');
    }
  }, 3000);
};

// 3. エラーハンドリングデモ
const demonstrateErrorHandling = () => {
  console.log('⚠️  3. エラーハンドリングデモ\n');
  
  const SECRET_KEY = 'demo-secret-key-for-learning-only';
  
  // 様々なエラーケースをテスト
  const errorCases = [
    {
      name: '不正なトークン形式',
      token: 'invalid-token-format',
      expected: 'JsonWebTokenError'
    },
    {
      name: '空のトークン',
      token: '',
      expected: 'JsonWebTokenError'
    },
    {
      name: '改ざんされたトークン',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywidXNlcm5hbWUiOiJhbGljZSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNjQ2MTIzNDU2fQ.wrong-signature',
      expected: 'JsonWebTokenError'
    }
  ];
  
  errorCases.forEach(({ name, token }) => {
    console.log(`🔹 ${name}:`);
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log('✅ 検証成功（これは起こらないはず）:', decoded);
    } catch (error) {
      console.log(`❌ 検証失敗（期待通り）: ${error.name} - ${error.message}`);
    }
    console.log('');
  });
};

// 4. 実用的な設定オプションデモ
const demonstrateAdvancedOptions = () => {
  console.log('⚙️  4. 実用的な設定オプションデモ\n');
  
  const SECRET_KEY = 'demo-secret-key-for-learning-only';
  
  // 複数の設定パターンを試す
  const configs = [
    {
      name: 'アクセストークン設定',
      options: {
        expiresIn: '15m',
        issuer: 'jwt-learn-app',
        audience: 'jwt-learn-users',
        algorithm: 'HS256'
      }
    },
    {
      name: 'リフレッシュトークン設定',
      options: {
        expiresIn: '7d',
        issuer: 'jwt-learn-app',
        audience: 'jwt-learn-refresh',
        algorithm: 'HS256'
      }
    },
    {
      name: 'セッション風短期間設定',
      options: {
        expiresIn: '30m',
        issuer: 'jwt-learn-app',
        notBefore: 0,  // 即座に有効
        algorithm: 'HS256'
      }
    }
  ];
  
  const payload = {
    userId: 456,
    username: 'bob',
    role: 'admin'
  };
  
  configs.forEach(({ name, options }) => {
    console.log(`🔹 ${name}:`);
    console.log('  設定:', JSON.stringify(options, null, 2));
    
    const token = jwt.sign(payload, SECRET_KEY, options);
    console.log('  トークン長:', token.length, '文字');
    
    // デコードして内容確認
    const decoded = jwt.decode(token, { complete: true });
    console.log('  ヘッダー:', decoded.header);
    console.log('  ペイロード期限:', new Date(decoded.payload.exp * 1000).toISOString());
    console.log('');
  });
};

// 5. トークンデコード（検証なし）デモ
const demonstrateTokenDecoding = () => {
  console.log('🔓 5. トークンデコード（検証なし）デモ\n');
  
  const SECRET_KEY = 'demo-secret-key-for-learning-only';
  const payload = { userId: 789, username: 'charlie', role: 'user' };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
  
  console.log('🔹 生成されたトークン:');
  console.log(token);
  console.log('');
  
  // 検証なしでデコード（構造確認用）
  console.log('🔹 検証なしデコード（構造確認用）:');
  const decoded = jwt.decode(token, { complete: true });
  
  console.log('ヘッダー:');
  console.log(JSON.stringify(decoded.header, null, 2));
  console.log('');
  
  console.log('ペイロード:');
  console.log(JSON.stringify(decoded.payload, null, 2));
  console.log('');
  
  console.log('署名:');
  console.log(decoded.signature);
  console.log('');
  
  console.log('📚 学習ポイント:');
  console.log('- jwt.decode() は検証なしで内容を確認できます');
  console.log('- 本番環境では必ず jwt.verify() を使用してください');
  console.log('- デバッグ時にトークンの中身を確認するのに便利です');
};

// メイン実行
const runJWTImplementationDemo = () => {
  console.log('🎯 学習目標: jsonwebtokenライブラリの基本操作を習得する\n');
  
  // 1. JWT生成
  const tokens = demonstrateJWTGeneration();
  
  // 2. JWT検証
  demonstrateJWTVerification(tokens);
  
  // 3. エラーハンドリング
  demonstrateErrorHandling();
  
  // 4. 実用的な設定オプション
  demonstrateAdvancedOptions();
  
  // 5. トークンデコード
  demonstrateTokenDecoding();
  
  console.log('\n🎓 === JWT実装基礎デモ完了 ===');
  console.log('');
  console.log('📚 主な学習ポイント:');
  console.log('✅ jwt.sign() でトークン生成');
  console.log('✅ jwt.verify() でトークン検証');
  console.log('✅ エラーハンドリングの重要性');
  console.log('✅ 実用的な設定オプション');
  console.log('✅ jwt.decode() によるデバッグ方法');
  console.log('');
  console.log('🎯 次のステップ: セキュリティ基礎知識習得');
};

// デモ実行
runJWTImplementationDemo();

export default runJWTImplementationDemo; 