// API 設定檔案
const API_CONFIG = {
    // 自動偵測環境：本地開發 vs 線上部署
    BASE_URL: (() => {
        // 如果在 localhost 環境，使用本地 API
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:3000/api';
        }
        // 線上環境：使用 Render.com API
        return 'https://slvhteach.onrender.com/api';
    })(),

    // API 端點
    ENDPOINTS: {
        MATERIALS: '/materials',
        OPTIONS: '/options',
        CASES: '/cases',
        HEALTH: '/health'
    }
};

// API 請求輔助函數
class API {
    static async request(endpoint, options = {}) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || '請求失敗');
            }

            return await response.json();
        } catch (error) {
            console.error('API 請求錯誤:', error);
            throw error;
        }
    }

    // GET 請求
    static async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    // POST 請求
    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // PUT 請求
    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // DELETE 請求
    static async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
}
