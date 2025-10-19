/**
 * MIYABI AX - Main Entry Point
 *
 * ローカル完結型自律開発フレームワーク
 */

export * from './agents/index.js';
export * from './core/BaseAgent.js';
export * from './types/agent.js';

// Version
export const VERSION = '1.0.0';
export const FRAMEWORK_NAME = 'MIYABI AX';

console.log(`${FRAMEWORK_NAME} v${VERSION} - ローカル完結型自律開発フレームワーク`);
