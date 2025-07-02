# JWT 構造解析 詳細資料

## 🎯 学習目標

JWT の 3 部構造（Header.Payload.Signature）を完全に理解し、各部分の役割と Base64URL エンコーディングの仕組みを把握する

---

## 1. JWT の基本構造

### 概要

JWT は **3 つの部分をピリオド（.）で区切った構造** を持ちます：

```
Header.Payload.Signature
```

### 実際の JWT 例

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEyMywibmFtZSI6IuWtpuevv-ODpuODvOOCtuODvCIsInJvbGUiOiJzdHVkZW50IiwiZXhwIjoxNzUxNDYzMjAwLCJpYXQiOjE3NTE0NTk2MDAsImlzcyI6Imp3dC1sZWFybi1hcHAiLCJhdWQiOiJqd3QtbGVhcm4tdXNlcnMifQ.8vXH2zQP9fN3yD7mK1R8sL4wV2uJ6qE9rT0pA3bC5xY
```

---

## 2. JWT 構造図

```
┌─────────────────────────────────────────────────────────┐
│                      JWT Token                          │
├─────────────────────────────────────────────────────────┤
│ Header          │ Payload         │ Signature           │
│ (アルゴリズム)   │ (クレーム)      │ (検証用署名)        │
├─────────────────────────────────────────────────────────┤
│ eyJhbGci...     │ eyJ1c2VySWQ... │ 8vXH2zQP...         │
│ (Base64URL)     │ (Base64URL)     │ (Base64URL)         │
├─────────────────────────────────────────────────────────┤
│ {               │ {               │ HMAC SHA256         │
│   "alg":"HS256",│   "userId":123, │ (Header + Payload   │
│   "typ":"JWT"   │   "name":"学習", │  + Secret Key)      │
│ }               │   "exp":1751... │                     │
│                 │ }               │                     │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Header（ヘッダー）詳細

### 役割

JWT の **メタデータを格納** し、署名アルゴリズムとトークンタイプを宣言します。

### 構造

```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### フィールド解説

| フィールド | 説明                      | 必須 | 例                        |
| :--------- | :------------------------ | :--- | :------------------------ |
| `alg`      | 署名アルゴリズム          | ✅   | `HS256`, `RS256`, `ES256` |
| `typ`      | トークンタイプ            | ✅   | `JWT`                     |
| `kid`      | キー ID（複数キー環境用） | ❌   | `key-1`                   |
| `cty`      | コンテンツタイプ          | ❌   | `JWT`                     |

### Base64URL エンコード例

```
元のJSON: {"alg":"HS256","typ":"JWT"}
Base64URL: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
```

---

## 4. Payload（ペイロード）詳細

### 役割

JWT の **実際のデータ（クレーム）を格納** し、ユーザー情報や権限、有効期限などを含みます。

### 構造例

```json
{
  "userId": 123,
  "name": "学習ユーザー",
  "role": "student",
  "exp": 1751463200,
  "iat": 1751459600,
  "iss": "jwt-learn-app",
  "aud": "jwt-learn-users"
}
```

### 標準クレーム（RFC 7519）

| クレーム | 名称            | 説明                    | 形式           | 例                |
| :------- | :-------------- | :---------------------- | :------------- | :---------------- |
| `iss`    | Issuer          | 発行者                  | String         | `jwt-learn-app`   |
| `sub`    | Subject         | 主体（通常ユーザー ID） | String         | `user123`         |
| `aud`    | Audience        | 対象者                  | String/Array   | `jwt-learn-users` |
| `exp`    | Expiration Time | 有効期限                | Unix Timestamp | `1751463200`      |
| `nbf`    | Not Before      | 有効開始時刻            | Unix Timestamp | `1751459600`      |
| `iat`    | Issued At       | 発行時刻                | Unix Timestamp | `1751459600`      |
| `jti`    | JWT ID          | JWT 固有 ID             | String         | `abc123`          |

### カスタムクレーム

アプリケーション固有の情報を格納可能：

```json
{
  "userId": 123,
  "name": "学習ユーザー",
  "role": "student",
  "permissions": ["read", "write"],
  "department": "engineering"
}
```

### ⚠️ 重要な注意点

- **ペイロードは暗号化されていない**（Base64 エンコードのみ）
- **機密情報は格納しない**（パスワード、クレジットカード番号等）
- **サイズを最小限に抑える**（ネットワーク負荷軽減）

---

## 5. Signature（署名）詳細

### 役割

JWT の **完全性を保証** し、改ざんされていないことを検証します。

### 署名生成プロセス

```javascript
// 1. Header と Payload を Base64URL エンコード
const headerBase64URL = base64UrlEncode(header);
const payloadBase64URL = base64UrlEncode(payload);

// 2. Header.Payload を作成
const signatureInput = headerBase64URL + "." + payloadBase64URL;

// 3. HMAC SHA256 で署名生成
const signature = HMACSHA256(signatureInput, secret);

// 4. 署名を Base64URL エンコード
const signatureBase64URL = base64UrlEncode(signature);
```

### アルゴリズム別署名方式

| アルゴリズム | 名称         | 署名方式 | 用途                   |
| :----------- | :----------- | :------- | :--------------------- |
| `HS256`      | HMAC SHA256  | 対称鍵   | 単一アプリ・高速       |
| `RS256`      | RSA SHA256   | 非対称鍵 | マルチアプリ・セキュア |
| `ES256`      | ECDSA SHA256 | 非対称鍵 | 高性能・省メモリ       |
| `none`       | 署名なし     | なし     | ⚠️ 非推奨              |

### 署名検証プロセス

```javascript
// 1. JWT を分割
const [headerB64, payloadB64, signatureB64] = jwt.split(".");

// 2. Header をデコードしてアルゴリズム確認
const header = JSON.parse(base64UrlDecode(headerB64));

// 3. 署名対象データを再構成
const signatureInput = headerB64 + "." + payloadB64;

// 4. 同じアルゴリズムで署名を再計算
const expectedSignature = HMACSHA256(signatureInput, secret);

// 5. 署名比較
const isValid = expectedSignature === base64UrlDecode(signatureB64);
```

---

## 6. Base64URL エンコーディング詳細

### Base64 vs Base64URL

| 項目       | Base64 | Base64URL |
| :--------- | :----- | :-------- |
| 文字 62    | `+`    | `-`       |
| 文字 63    | `/`    | `_`       |
| パディング | `=`    | なし      |
| URL 安全性 | ❌     | ✅        |

### 変換例

```
元の文字列: Hello JWT World! 🚀
Base64:     SGVsbG8gSldUIFdvcmxkISAA8J+agA==
Base64URL:  SGVsbG8gSldUIFdvcmxkISAA8J-agA
```

### 変換ルール

1. **Base64 → Base64URL**

   ```javascript
   const base64url = base64
     .replace(/\+/g, "-")
     .replace(/\//g, "_")
     .replace(/=/g, "");
   ```

2. **Base64URL → Base64**
   ```javascript
   let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
   while (base64.length % 4) {
     base64 += "=";
   }
   ```

---

## 7. JWT の自己完結性

### 特徴

JWT は **Self-contained**（自己完結型）のトークンです：

- **必要な情報がすべて含まれる**
- **サーバー側での状態管理不要**
- **トークンのみで認証・認可が完結**

### 従来のセッション方式との比較

#### セッション方式

```
Client → Server: セッションID
Server → DB: SELECT * FROM sessions WHERE id = ?
DB → Server: セッション情報
Server: 認証確認完了
```

#### JWT 方式

```
Client → Server: JWT
Server: JWT署名検証 + ペイロード読取
Server: 認証確認完了（DB不要）
```

### 利点と課題

| 項目             | 利点                       | 課題                     |
| :--------------- | :------------------------- | :----------------------- |
| パフォーマンス   | DB 不要で高速              | ペイロードサイズが大きい |
| スケーラビリティ | ステートレスで水平拡張容易 | 即座の無効化が困難       |
| 開発効率         | シンプルな実装             | セキュリティ配慮が必要   |

---

## 8. セキュリティ考慮事項

### 1. 署名の重要性

```javascript
// ❌ 危険: 署名なし
const unsafeJWT = header + "." + payload + ".";

// ✅ 安全: 適切な署名
const safeJWT = header + "." + payload + "." + signature;
```

### 2. アルゴリズム指定

```javascript
// ❌ 危険: none アルゴリズム
{"alg": "none", "typ": "JWT"}

// ✅ 安全: 強力なアルゴリズム
{"alg": "HS256", "typ": "JWT"}
```

### 3. 秘密鍵管理

```javascript
// ❌ 危険: ハードコード
const secret = "mysecret";

// ✅ 安全: 環境変数
const secret = process.env.JWT_SECRET;
```

---

## 9. 実習課題

### 課題 1: JWT デコード

以下の JWT をデコードして、各部分の内容を確認してください：

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQ1NiwibmFtZSI6Iueri-e-kuODpuODvOOCtuODvCIsInJvbGUiOiJhZG1pbiIsImV4cCI6MTc1MTU0OTgwMCwiaWF0IjoxNzUxNTQ2MjAwfQ.example_signature
```

### 課題 2: 署名検証

上記の JWT の署名を検証し、改ざんされていないことを確認してください。
（秘密鍵: `learning-jwt-secret-key`）

### 課題 3: カスタム JWT 作成

以下の情報を含む JWT を作成してください：

- ユーザー ID: 789
- 名前: "開発者ユーザー"
- 権限: "developer"
- 有効期限: 1 時間後

---

## 10. 学習まとめ

### 理解できたこと ✅

- [ ] JWT の 3 部構造（Header.Payload.Signature）
- [ ] Base64URL エンコーディングの仕組み
- [ ] Header の役割（アルゴリズム・タイプ情報）
- [ ] Payload の役割（標準クレーム・カスタムクレーム）
- [ ] Signature の役割（HMAC SHA256 による改ざん検証）
- [ ] JWT の自己完結性（Self-contained）
- [ ] セキュリティ考慮事項

### 次のステップ

- **Step 2-3**: セッション比較理解（ステートレス vs ステートフル）
- **Step 2-4**: JWT 実装基礎（jsonwebtoken ライブラリ）
- **Step 2-5**: セキュリティ基礎（リスクと対策）

---

_この資料で JWT の構造を完全に理解できたら、次のステップに進みましょう！_
