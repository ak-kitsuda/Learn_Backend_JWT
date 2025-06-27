# JWT 認証 Todo 学習プロジェクト

## 概要

本プロジェクトは **JWT (JSON Web Token) を用いた認証・認可** を学習するためのフルスタック Todo アプリケーションです。前回のクッキー / セッションベース認証プロジェクトとほぼ同一の機能・構成を採用し、2 つの方式の違いを比較できるように設計されています。

> **目的**: JWT の利点・欠点を実装と比較検証を通して理解し、適切に選択・運用できる力を身に付ける。

---

## 技術スタック

| レイヤ    | 使用技術                                                    | 役割                                 |
| :-------- | :---------------------------------------------------------- | :----------------------------------- |
| Back-end  | **Express.js** / **SQLite** / **jsonwebtoken** / **bcrypt** | API・DB・JWT 発行 / 検証             |
| Front-end | **Vue.js 3 (Composition API)**                              | SPA・状態管理 (アクセストークン保存) |
| その他    | **Node.js (16+)**, **nodemon**, **ESLint**                  | 開発支援                             |

---

## 学習目標

1. JWT の仕組み (ヘッダー・ペイロード・署名) を理解する
2. セッション / クッキー方式とのアーキテクチャ的な違いを把握する
3. リフレッシュトークン戦略・トークン失効の実装方法を学ぶ
4. セキュリティ考慮点 (XSS, CSRF, Token 盗難) を理解する
5. フルスタック開発を通じて実践的な API 設計・フロント連携を習得する

---

## 📚 JWT 学習ロードマップ

### 🎯 学習の進め方

このプロジェクトは **段階的学習** を重視しています。各段階で理論と実践をバランスよく学び、JWT の理解を深めていきましょう。

### Phase 1: 基礎固め（現在の学習範囲）

**目標**: Express + SQLite の基盤を構築し、Web API の基本を理解する

#### 1-1. 環境構築 & Hello World API

- [ ] Node.js + Express の基本セットアップ
- [ ] `GET /api/hello` エンドポイント作成
- [ ] **学習ポイント**: Express のミドルウェア、ルーティングの仕組み

```bash
# プロジェクト初期化
mkdir -p backend && cd backend
npm init -y
npm install express sqlite3 cors
npm install -D nodemon eslint
```

#### 1-2. データベース接続

- [ ] SQLite 接続設定
- [ ] `GET /api/db-test` で現在時刻取得
- [ ] **学習ポイント**: データベース接続、非同期処理、エラーハンドリング

```javascript
// backend/config/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(__dirname, "../database/todo.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("DB connection error", err.message);
  else console.log("✅ SQLite connected");
});

module.exports = db;
```

#### 1-3. 開発環境整備

- [ ] nodemon による自動再起動設定
- [ ] ESLint による コード品質チェック
- [ ] **学習ポイント**: 開発効率化ツールの活用

#### 1-4. 動作確認

- [ ] `npm run dev` でサーバーが起動する
- [ ] `curl http://localhost:3000/api/hello` が `Hello World` を返す
- [ ] `curl http://localhost:3000/api/db-test` が現在時刻を返す

> **詳細な実装手順**: [Phase1 ガイド](.cursor/rules/phase1-guide.mdc) を参照してください

### Phase 2: JWT 理論学習（次回公開予定）

**目標**: JWT の構造と仕組みを理論的に理解する

#### 2-1. JWT 基礎知識

- JWT とは何か？なぜ必要なのか？
- Header, Payload, Signature の役割
- セッション認証との違い（ステートレス vs ステートフル）

#### 2-2. JWT 実装準備

- `jsonwebtoken` ライブラリの使い方
- 環境変数による秘密鍵管理
- トークンの生成と検証の基本

### Phase 3: 認証 API 実装（次回公開予定）

**目標**: ユーザー登録・ログイン機能を JWT で実装する

#### 3-1. ユーザー管理

- users テーブル設計
- パスワードハッシュ化（bcrypt）
- ユーザー登録 API

#### 3-2. JWT 認証

- ログイン API + アクセストークン発行
- JWT 検証ミドルウェア
- 保護されたエンドポイント

#### 3-3. リフレッシュトークン

- リフレッシュトークンの仕組み
- トークンローテーション
- ログアウト機能

### Phase 4: Todo アプリ実装（次回公開予定）

**目標**: JWT 認証を使った実用的なアプリケーションを構築する

#### 4-1. Todo API

- todos テーブル設計
- CRUD エンドポイント
- 所有者チェック（認可）

#### 4-2. フロントエンド

- Vue.js 3 + Composition API
- Axios インターセプタ
- トークン自動更新

### Phase 5: セキュリティ & 比較検証（次回公開予定）

**目標**: セキュリティ課題を理解し、セッション方式と比較する

#### 5-1. セキュリティ対策

- XSS, CSRF 対策
- トークン保存場所の検討
- セキュリティベストプラクティス

#### 5-2. 比較検証

- パフォーマンス測定
- 開発体験の比較
- 運用面での違い

---

## 🎓 学習のコツ

### 理論と実践のバランス

- **理論**: 各概念の「なぜ？」を理解する
- **実践**: 実際にコードを書いて動作を確認する
- **比較**: セッション方式との違いを常に意識する

### 段階的な理解

1. **動かす** → まずは動作させて全体像を把握
2. **理解する** → なぜそうなるのかを深く学ぶ
3. **応用する** → 学んだ知識を他の場面で活用

### 学習記録の活用

- 各段階で学んだことをメモに残す
- つまずいた点と解決方法を記録
- 理解度を自己評価し、必要に応じて復習

---

## プロジェクト構成

```text
jwt-learn/
├── backend/                  # バックエンド (Express API)
│   ├── server.js             # エントリポイント
│   ├── config/
│   │   └── database.js       # SQLite 接続設定
│   ├── middleware/
│   │   └── auth.js           # JWT 検証ミドルウェア
│   ├── routes/
│   │   ├── auth.js           # 認証 API (登録・ログイン・リフレッシュ)
│   │   └── todos.js          # Todo CRUD API
│   ├── scripts/              # DB 初期化スクリプトなど
│   └── package.json
├── frontend/                 # フロントエンド (Vue 3 SPA)
│   ├── src/
│   │   ├── components/       # 再利用コンポーネント
│   │   ├── views/            # 画面ページ
│   │   ├── services/         # API 通信 (Axios)
│   │   ├── router/           # Vue Router 設定
│   │   └── store/            # アプリ状態 (アクセストークン保持)
│   └── package.json
└── README.md                 # (このファイル)
```

> **ポイント**: ディレクトリ構成は前回プロジェクトと極力そろえ、比較しやすいようにしています。

---

## 学習フェーズ

| Phase | 目的                 | 主なタスク                              | 進捗     |
| :---- | :------------------- | :-------------------------------------- | :------- |
| 1     | バックエンド基盤構築 | Express + SQLite + 基本ルーティング学習 | ☐ 未着手 |

> **今後の予定**: Phase2 (JWT 認証 API 実装) 以降は、Phase1 が完了してから順次公開予定です。まずはバックエンド環境構築に集中しましょう！

---

## 実装予定機能

### 認証 & 認可

- アクセストークン (15 分) + リフレッシュトークン (7 日) の 2 段構成
- JWT は **HTTP-Only Cookie** ではなく **Authorization: Bearer** 方式で送信
  - 比較目的で Cookie 送信版もオプションとして実装
- トークン失効 (ログアウト & ローテーション) 機構
- 所有者チェックによる Todo 操作制限

### Todo API

- 認証必須 CRUD エンドポイント (`/api/todos`)
- ユーザ固有データの SQLite ストレージ

### フロントエンド

- Vue 3 + Composition API で SPA 構築
- Axios インターセプタでトークン自動付与 & リフレッシュ
- レスポンシブ UI (Bootstrap-Vue または Tailwind)

---

## セッション / JWT 比較早見表

| 項目             | セッション / クッキー           | JWT                                     |
| :--------------- | :------------------------------ | :-------------------------------------- |
| 状態管理         | サーバ側セッションストア        | トークン自体に状態を保持 (ステートレス) |
| スケーラビリティ | ストア共有(例: Redis)が必要     | 認証サーバ不要、水平スケール容易        |
| 無効化           | セッション破棄で即時失効        | ブラックリスト管理 or 期限切れ待ち      |
| CSRF             | Cookie に依存 (要 CSRF 対策)    | Bearer ヘッダなら原則不要               |
| ペイロード       | 任意データ保存不可 (ストア必要) | ペイロードに埋込可 (過大注意)           |

> プロジェクトを通して上記項目を実際に検証します。

---

## 使用方法

### 1. リポジトリ取得

```bash
# クローン
git clone <repository-url>
cd jwt-learn
```

### 2. バックエンド起動

```bash
cd backend
npm install
npm run dev     # nodemon 再起動付き
```

主要 Endpoints:

| Method | Endpoint           | 説明                         |
| :----- | :----------------- | :--------------------------- |
| POST   | /api/auth/register | ユーザ登録                   |
| POST   | /api/auth/login    | ログイン (JWT 発行)          |
| POST   | /api/auth/refresh  | リフレッシュトークンで再発行 |
| POST   | /api/auth/logout   | ログアウト (RT 失効)         |
| GET    | /api/todos         | Todo 一覧取得                |
| ...    | ...                | CRUD 各種                    |

### 3. フロントエンド起動

```bash
cd frontend
npm install
npm run dev     # Vite or Vue CLI
```

---

## 学習のポイント

1. **JWT の構造** – Header, Payload, Signature の理解
2. **トークン保存場所の検討** – localStorage vs Cookie
3. **リフレッシュ戦略** – ローテーション・失効
4. **セキュリティ** – XSS / CSRF / Token 盗難対策
5. **実運用の課題** – 無効化・ペイロード肥大・キー管理

---

## ライセンス

本リポジトリは学習目的で公開されています。商用利用はご遠慮ください。

---

## 進捗チェックリスト

- [ ] フェーズ 1: バックエンド基盤構築 (現在の学習範囲)

`README.md` は進捗に合わせて更新していきます。
