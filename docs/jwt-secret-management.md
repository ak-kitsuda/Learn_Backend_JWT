# JWT 秘密鍵管理ベストプラクティス

## 🎯 目的

JWT の秘密鍵（Secret Key）を安全に管理し、環境別に最適な保存方法を実装する

---

## 🔐 環境別ベストプラクティス

### 🏠 開発環境（ローカル開発）

#### 1. `.env` ファイル使用（推奨）

```bash
# .env (プロジェクトルートに配置)
JWT_SECRET=your-super-secure-256-bit-secret-key-for-development
JWT_REFRESH_SECRET=your-refresh-token-secret-key-for-development
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

**実装例**:

```javascript
// backend/server.js
import dotenv from "dotenv";
dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}
```

#### 2. 必須設定

```bash
# .gitignore に追加
.env
.env.local
.env.*.local
```

---

### 🏢 本番環境

#### 1. クラウド環境変数サービス

**AWS Systems Manager Parameter Store**:

```javascript
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

const ssm = new SSMClient({ region: "ap-northeast-1" });

async function getJWTSecret() {
  const command = new GetParameterCommand({
    Name: "/jwt-learn/production/jwt-secret",
    WithDecryption: true,
  });

  const response = await ssm.send(command);
  return response.Parameter.Value;
}
```

**Azure Key Vault**:

```javascript
import { SecretClient } from "@azure/keyvault-secrets";
import { DefaultAzureCredential } from "@azure/identity";

const credential = new DefaultAzureCredential();
const client = new SecretClient(
  "https://your-vault.vault.azure.net/",
  credential
);

async function getJWTSecret() {
  const secret = await client.getSecret("jwt-secret");
  return secret.value;
}
```

#### 2. Docker Secrets

```yaml
# docker-compose.yml
version: "3.8"
services:
  app:
    image: jwt-learn:latest
    secrets:
      - jwt_secret
    environment:
      - JWT_SECRET_FILE=/run/secrets/jwt_secret

secrets:
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

```javascript
// secrets読み込み
import fs from "fs";

function getJWTSecret() {
  const secretFile = process.env.JWT_SECRET_FILE;
  if (secretFile) {
    return fs.readFileSync(secretFile, "utf8").trim();
  }
  return process.env.JWT_SECRET;
}
```

---

## 🔒 秘密鍵生成のベストプラクティス

### 1. 暗号学的に安全な生成

```javascript
// Node.js での生成
import crypto from "crypto";

// 256-bit (32 bytes) 秘密鍵生成
const jwtSecret = crypto.randomBytes(32).toString("hex");
console.log("JWT Secret:", jwtSecret);

// Base64形式での生成
const jwtSecretBase64 = crypto.randomBytes(32).toString("base64");
console.log("JWT Secret (Base64):", jwtSecretBase64);
```

```bash
# OpenSSL での生成
openssl rand -hex 32
openssl rand -base64 32
```

### 2. 推奨される秘密鍵の特徴

| 項目           | 推奨値                        | 理由                     |
| :------------- | :---------------------------- | :----------------------- |
| **長さ**       | 256-bit (32 bytes) 以上       | HMAC SHA256 の安全性確保 |
| **文字種**     | 英数字 + 記号                 | エントロピー最大化       |
| **予測可能性** | 完全にランダム                | 辞書攻撃・推測攻撃対策   |
| **一意性**     | アクセス/リフレッションで別々 | 権限分離                 |

---

## ⚠️ 避けるべき危険なパターン

### ❌ 絶対に避ける

```javascript
// 1. ハードコード
const jwtSecret = "mysecret123"; // 危険！

// 2. 短すぎる秘密鍵
const jwtSecret = "abc"; // 危険！

// 3. 辞書にある単語
const jwtSecret = "password123"; // 危険！

// 4. 同じ秘密鍵を複数用途で使用
const jwtSecret = "shared-secret";
const refreshSecret = "shared-secret"; // 危険！
```

### ❌ 危険度の高い保存場所

- **ソースコード内**: Git 履歴に残る
- **設定ファイル**: 誤ってコミット・共有リスク
- **データベース**: 平文保存は危険
- **ログファイル**: 意図しない出力リスク

---

## 🛡️ セキュリティ対策

### 1. 秘密鍵ローテーション

```javascript
// 複数の秘密鍵をサポート
const jwtSecrets = [
  process.env.JWT_SECRET_CURRENT, // 現在の秘密鍵
  process.env.JWT_SECRET_PREVIOUS, // 前の秘密鍵（移行期間用）
];

function verifyToken(token) {
  for (const secret of jwtSecrets) {
    try {
      return jwt.verify(token, secret);
    } catch (error) {
      continue; // 次の秘密鍵で試行
    }
  }
  throw new Error("Token verification failed");
}
```

### 2. 秘密鍵の検証

```javascript
// 起動時に秘密鍵を検証
function validateJWTSecret(secret) {
  if (!secret) {
    throw new Error("JWT secret is required");
  }

  if (secret.length < 32) {
    throw new Error("JWT secret must be at least 32 characters");
  }

  if (secret === "your-secret-key" || secret === "mysecret") {
    throw new Error("Default JWT secret detected. Please use a secure secret.");
  }
}

validateJWTSecret(process.env.JWT_SECRET);
```

### 3. 環境変数の存在チェック

```javascript
// 必須環境変数チェック
const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET", "JWT_EXPIRES_IN"];

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});
```

---

## 📊 環境別推奨度

| 保存方法         | 開発環境 | ステージング | 本番環境  | セキュリティ |
| :--------------- | :------- | :----------- | :-------- | :----------- |
| `.env` ファイル  | ✅ 推奨  | ⚠️ 注意      | ❌ 非推奨 | 低           |
| システム環境変数 | ✅ 良い  | ✅ 推奨      | ⚠️ 注意   | 中           |
| クラウド秘密管理 | ❌ 過剰  | ✅ 推奨      | ✅ 必須   | 高           |
| Docker Secrets   | ❌ 過剰  | ✅ 良い      | ✅ 推奨   | 高           |
| HashiCorp Vault  | ❌ 過剰  | ✅ 良い      | ✅ 推奨   | 最高         |

---

## 🔧 実装例（学習プロジェクト用）

### 1. 開発環境設定

```bash
# .env.example (テンプレート)
JWT_SECRET=your-super-secure-256-bit-secret-key-replace-this
JWT_REFRESH_SECRET=your-different-refresh-token-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# .env.example から .env をコピー
cp .env.example .env

# 実際の秘密鍵を生成・設定
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### 2. 設定の読み込み

```javascript
// backend/config/jwt.js
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

// 秘密鍵生成ヘルパー
export function generateSecureSecret() {
  return crypto.randomBytes(32).toString("hex");
}

// JWT設定
export const jwtConfig = {
  secret:
    process.env.JWT_SECRET ||
    (() => {
      console.warn("⚠️ JWT_SECRET not set. Generating temporary secret...");
      return generateSecureSecret();
    })(),

  refreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    (() => {
      console.warn(
        "⚠️ JWT_REFRESH_SECRET not set. Generating temporary secret..."
      );
      return generateSecureSecret();
    })(),

  expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",

  issuer: process.env.JWT_ISSUER || "jwt-learn-app",
  audience: process.env.JWT_AUDIENCE || "jwt-learn-users",
};

// 設定の検証
function validateConfig() {
  if (jwtConfig.secret.length < 32) {
    throw new Error("JWT secret must be at least 32 characters");
  }

  if (jwtConfig.secret === jwtConfig.refreshSecret) {
    throw new Error("JWT secret and refresh secret must be different");
  }
}

validateConfig();
```

---

## 🧪 セキュリティテスト

### 1. 秘密鍵強度テスト

```javascript
// backend/tests/security.test.js
import { jwtConfig } from "../config/jwt.js";

describe("JWT Security Tests", () => {
  test("JWT secret should be strong enough", () => {
    expect(jwtConfig.secret.length).toBeGreaterThanOrEqual(32);
    expect(jwtConfig.secret).not.toBe("your-secret-key");
    expect(jwtConfig.secret).not.toBe("mysecret");
  });

  test("JWT secrets should be different", () => {
    expect(jwtConfig.secret).not.toBe(jwtConfig.refreshSecret);
  });
});
```

### 2. 環境変数テスト

```bash
# 本番環境デプロイ前チェック
#!/bin/bash

if [ -z "$JWT_SECRET" ]; then
  echo "❌ JWT_SECRET is not set"
  exit 1
fi

if [ ${#JWT_SECRET} -lt 32 ]; then
  echo "❌ JWT_SECRET is too short"
  exit 1
fi

echo "✅ JWT configuration is valid"
```

---

## 🚨 緊急時対応

### 1. 秘密鍵漏洩時の対応

```bash
# 1. 即座に新しい秘密鍵を生成
NEW_SECRET=$(openssl rand -hex 32)

# 2. 環境変数を更新
export JWT_SECRET=$NEW_SECRET

# 3. アプリケーション再起動
sudo systemctl restart jwt-learn-app

# 4. 全ユーザーの強制再ログイン
# (既存のJWTはすべて無効化される)
```

### 2. 秘密鍵ローテーション

```javascript
// 計画的な秘密鍵ローテーション
const rotationSchedule = {
  development: "年1回",
  staging: "3ヶ月毎",
  production: "1ヶ月毎",
};
```

---

## 📚 参考資料

- [RFC 7519 - JSON Web Token (JWT)](https://tools.ietf.org/html/rfc7519)
- [OWASP JWT Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
- [Auth0 JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

## ✅ チェックリスト

### 開発環境

- [ ] `.env` ファイルに秘密鍵設定
- [ ] `.env` を `.gitignore` に追加
- [ ] 32 文字以上の秘密鍵使用
- [ ] アクセス・リフレッションで異なる秘密鍵

### 本番環境

- [ ] クラウド秘密管理サービス使用
- [ ] 定期的なローテーション計画
- [ ] 強制ログアウト機能実装
- [ ] セキュリティテスト実施

---

_適切な秘密鍵管理により、JWT の安全性を最大限に確保しましょう。_
