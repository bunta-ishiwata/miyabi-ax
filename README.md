# 🌸 MIYABI AX

**ローカル完結型自律開発フレームワーク**

MIYABI AXは、識学理論とAIエージェントを組み合わせた次世代の自律型開発フレームワークです。Claude Codeと完全統合し、`npx`コマンド一つで誰でも使える、完全ローカル実行型のAI駆動開発環境を提供します。

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-≥18.0.0-green)](https://nodejs.org/)

## ✨ 特徴

### 🚀 完全ローカル実行
- **APIコスト90%以上削減**: すべてのエージェントがローカルで動作
- **Claude Code統合**: シームレスな開発体験
- **外部API不要**: プライベート環境でも安全に使用可能

### 🤖 7つの自律エージェント

1. **CoordinatorAgent** - タスク統括・並列実行制御
2. **IssueAgent** - Issue分析・ラベル管理
3. **CodeGenAgent** - AI駆動コード生成
4. **ReviewAgent** - コード品質判定
5. **TestAgent** - テスト自動実行
6. **PRAgent** - Pull Request自動作成
7. **DeploymentAgent** - CI/CDデプロイ自動化

詳細は [REQUIREMENTS_AX.md](REQUIREMENTS_AX.md) を参照

## 📦 インストール

```bash
npx miyabi-ax init
```

## 🚀 使い方

```bash
# 状態確認
npx miyabi-ax status

# エージェント実行
npx miyabi-ax agent-run --issue 123
```

## 📄 ライセンス

MIT License

---

🌸 **MIYABI AX** - Beauty in Autonomous Development
