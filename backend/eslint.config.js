// ESLint v9 設定ファイル (ES6モジュール形式)
export default [
  {
    // Node.js環境の設定
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        // Node.js環境のグローバル変数 (ES6モジュール)
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        setTimeout: "readonly",
        setInterval: "readonly",
        clearTimeout: "readonly",
        clearInterval: "readonly",
        // ES6モジュール専用
        URL: "readonly",
        URLSearchParams: "readonly"
      }
    },
    
    // 基本的なルール設定
    rules: {
      // 構文エラー防止
      "no-unused-vars": "warn",
      "no-undef": "error",
      
      // コードスタイル
      "semi": ["error", "always"],
      "quotes": ["warn", "single"],
      "indent": ["warn", 2],
      
      // ベストプラクティス
      "no-console": "off", // 学習中はconsole.log許可
      "prefer-const": "warn"
    }
  }
]; 