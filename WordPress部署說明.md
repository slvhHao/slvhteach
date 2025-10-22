# 家教工具庫 - WordPress 部署說明

## 重要提醒

WordPress.com **免費方案不支援**直接上傳 HTML/CSS/JavaScript 自訂程式碼。

## 可行的解決方案

### 方案一：使用 WordPress.com 付費方案（推薦用於 WordPress.com）

**需要的方案：**
- **Business Plan** 或更高（約 $25/月，年付）
- 可以安裝自訂外掛程式

**步驟：**
1. 升級到 Business Plan
2. 安裝 "Custom HTML" 或 "Insert Headers and Footers" 外掛
3. 將 `index.html` 的內容複製到 WordPress 頁面
4. 使用 "自訂 CSS" 功能添加 `styles.css` 的內容
5. 使用外掛添加 `script.js` 的內容

**限制：**
- localStorage 可能受限制
- 需要付費

---

### 方案二：使用其他免費託管服務（最推薦）

以下服務完全免費且支援純 HTML/CSS/JS：

#### 1. **GitHub Pages**（最推薦）
- ✅ 完全免費
- ✅ 支援自訂網域
- ✅ 自動 HTTPS
- ✅ 非常穩定

**部署步驟：**
1. 註冊 GitHub 帳號（https://github.com）
2. 創建新的 repository（倉庫）
3. 上傳三個檔案：`index.html`, `styles.css`, `script.js`
4. 到 Settings > Pages 啟用 GitHub Pages
5. 網站會發布在 `https://你的使用者名稱.github.io/倉庫名稱/`

**詳細教學：** https://pages.github.com/

---

#### 2. **Netlify**
- ✅ 完全免費
- ✅ 拖放上傳檔案
- ✅ 自動 HTTPS
- ✅ 支援自訂網域

**部署步驟：**
1. 註冊 Netlify 帳號（https://www.netlify.com）
2. 點擊 "Add new site" > "Deploy manually"
3. 直接拖放整個資料夾
4. 網站立即上線

---

#### 3. **Vercel**
- ✅ 完全免費
- ✅ 非常快速
- ✅ 自動 HTTPS
- ✅ 支援自訂網域

**部署步驟：**
1. 註冊 Vercel 帳號（https://vercel.com）
2. 點擊 "Add New" > "Project"
3. 上傳檔案或連接 GitHub
4. 自動部署

---

#### 4. **Google Firebase Hosting**
- ✅ Google 提供，穩定
- ✅ 免費額度充足
- ✅ 自動 HTTPS

---

### 方案三：自架 WordPress（WordPress.org）

如果您有自己的主機或願意租用虛擬主機：

**步驟：**
1. 租用支援 WordPress 的虛擬主機（如 SiteGround, Bluehost）
2. 安裝 WordPress.org（自架版本）
3. 使用 "Insert Headers and Footers" 外掛
4. 或建立自訂頁面範本

**費用：**
- 虛擬主機：約 $3-10/月
- 完全控制權

---

## 我的建議

### 如果您想要：
- **完全免費** → 使用 **GitHub Pages** 或 **Netlify**
- **最簡單** → 使用 **Netlify**（拖放上傳）
- **必須使用 WordPress** → 升級 WordPress.com Business Plan 或使用自架 WordPress

---

## 目前檔案結構

您目前有三個檔案：
```
家教/
├── index.html      (主要 HTML 結構)
├── styles.css      (所有樣式)
└── script.js       (所有功能邏輯)
```

這些檔案可以直接部署到任何靜態網站託管服務。

---

## 下一步

請告訴我您想要：
1. 使用 GitHub Pages（我可以提供詳細步驟）
2. 使用 Netlify（我可以提供詳細步驟）
3. 繼續使用 WordPress.com（需要升級付費方案）
4. 其他選擇

我會根據您的選擇提供詳細的部署教學。
