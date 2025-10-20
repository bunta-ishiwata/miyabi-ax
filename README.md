# 🌸 MIYABI AX

**一つのコマンドで全てが完結する自律型開発フレームワーク**

MIYABI AXは、[Miyabi](https://github.com/ShunsukeHayashi/Miyabi)のTypeScript版をベースにしたローカル完結型の自律開発フレームワークです。識学理論とAIエージェントを組み合わせ、`npx`コマンド一つで完全自律型のAI駆動開発環境を提供します。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-≥18.0.0-green)](https://nodejs.org/)

## ✨ クイックスタート

```bash
# 対話型モード（推奨）
npx miyabi-ax
```

対話型メニューが表示されます:

```
✨ Miyabi AX

一つのコマンドで全てが完結

何をしますか？
  🌸 初めての方（初回セットアップ）
  🆕 新しいプロジェクトを作成
  📦 既存プロジェクトに追加
  📊 ステータス確認
  🩺 ヘルスチェック・診断
  ⚙️  設定
  ❌ 終了
```

## 💡 特徴

### 🤖 7つの自律エージェント

1. **CoordinatorAgent** - タスク統括・並列実行制御
2. **IssueAgent** - Issue分析・ラベル管理
3. **CodeGenAgent** - AI駆動コード生成
4. **ReviewAgent** - コード品質判定
5. **TestAgent** - テスト自動実行（MCP統合）
6. **PRAgent** - Pull Request自動作成
7. **DeploymentAgent** - CI/CDデプロイ自動化

### 🔧 MCP統合（Model Context Protocol）

MIYABI AXは以下のMCPサーバーと統合されています：

- **Playwright MCP** - ブラウザ自動操作・E2Eテスト
- **Puppeteer MCP** - Chrome DevTools統合・ページ操作
- **Chrome DevTools MCP** - Console/Network/Performance監視・JavaScriptエラー自動検出

TestAgentが自動的にこれらのMCPツールを活用し、ブラウザレベルのテストとエラー検出を実行します。

詳細は [REQUIREMENTS_AX.md](REQUIREMENTS_AX.md) を参照

## 📦 インストール・使い方

### 対話型モード（推奨）

```bash
npx miyabi-ax
```

対話型メニューが表示されます：

```
🌸 MIYABI AX v1.1.0
ローカル完結型自律開発フレームワーク

📋 メインメニュー:
  [1] 初回セットアップ (init)
  [2] ステータス確認 (status)
  [3] エージェント実行 (agent-run)
  [4] ヘルプ表示 (help)
  [5] 終了 (quit)

選択してください (1-5):
```

### コマンドラインモード

```bash
npx miyabi-ax --help     # ヘルプ表示
npx miyabi-ax --version  # バージョン表示
```

## 📄 ライセンス

MIT License

---

🌸 **MIYABI AX** - Beauty in Autonomous Development
