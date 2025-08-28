# Code Style & Conventions

## TypeScript設定
- Strict mode有効
- ES2020対応
- DOM型定義使用

## コード規則
- インターfaces使用（DrawingSettings）
- const/let適切な使い分け
- 型注釈明示（p5, number等）
- 日本語ラベル使用（UI）

## ファイル構成
- `src/main.ts` - メインロジック
- `index.html` - HTMLテンプレート
- TypeScript ESModules使用

## p5.js パターン
- sketch関数でp5インスタンス作成
- setup/draw/mouse*/window*イベント定義
- キャンバス親要素指定（'app'）