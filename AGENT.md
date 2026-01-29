# 簡易鬧鐘應用

## 項目結構
- `/index.html` - HTML 入口文件
- `/src/main.tsx` - React 應用入口點
- `/src/App.tsx` - 主應用組件
- `/src/index.css` - 全局樣式文件
- `/src/components/AlarmClock/index.tsx` - 闹钟主要功能组件
- `/src/mock.json` - 模擬數據文件
- `/vite.config.ts` - Vite 配置文件
- `/tsconfig.json` - TypeScript 配置文件
- `/tsconfig.node.json` - Node.js TypeScript 配置文件
- `/tailwind.config.js` - Tailwind CSS 配置文件
- `/postcss.config.js` - PostCSS 配置文件
- `/package.json` - 項目依賴和腳本配置

## 功能說明
1. 實時時鐘顯示 - 顯示當前時間和日期
2. 鬧鐘設置 - 可以設定多個鬧鐘時間
3. 鬧鐘管理 - 可以開關、刪除已設定的鬧鐘
4. 鬧鐘響鈴 - 到達設定時間時會發出聲音提醒
5. 鬧鐘列表 - 顯示所有已設定的鬧鐘及其狀態

## 技術特性
- 使用 React Hooks 管理狀態和副作用
- 使用 Web Audio API 模擬鬧鐘音效
- 使用 Tailwind CSS 進行響應式設計
- 使用 Lucide React 圖標庫
- 支持實時時間更新
- 支持多個鬧鐘同時設置
- 支持鬧鐘開關控制
- 美觀的漸變背景和毛玻璃效果

## 安裝與運行
項目依賴已自動安裝，運行 `npm run dev` 即可啟動開發服務器

## CentOS 系統要求
此項目可在 CentOS 系統上運行，需確保已安裝 Node.js 和 npm 環境。