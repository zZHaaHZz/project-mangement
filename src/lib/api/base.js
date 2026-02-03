const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export class BaseApiClient {
  baseURL;
  token = null;

  constructor(baseURL) {
    this.baseURL = baseURL;
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("token");
    }
  }

  setToken(token) {
    this.token = token;
    if (typeof window !== "undefined") {
      if (token) localStorage.setItem("token", token);
      else localStorage.removeItem("token");
    }
  }

  async request(endpoint, options = {}) {
    // ✅ FIX: remove spaces
    const url = `${this.baseURL}${endpoint}`;
    // console.log("[FETCH]", url);

    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };

    // ✅ FIX: remove spaces
    if (this.token) headers["Authorization"] = `Bearer ${this.token}`;

    let response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (error) {
      throw new Error("Không thể kết nối đến server. Vui lòng kiểm tra json-server đã chạy chưa.");
    }

    if (!response.ok) {
      let errorMessage = response.statusText || "Có lỗi xảy ra";

      try {
        const text = await response.text();
        if (text) {
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData?.error || errorData?.message || errorMessage;
          } catch {
            errorMessage = text || errorMessage;
          }
        }
      } catch { }

      if (response.status === 400) errorMessage = "Dữ liệu không hợp lệ";
      else if (response.status === 404) errorMessage = "Không tìm thấy dữ liệu";
      else if (response.status === 0 || response.status === 500)
        errorMessage = "Lỗi server. Vui lòng kiểm tra json-server đã chạy chưa.";

      throw new Error(errorMessage);
    }

    // ✅ Parse an toàn theo content-type
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return response.json();
    }

    // nếu server trả về text/html hoặc empty
    const text = await response.text();
    return text;
  }

  get(endpoint) {
    return this.request(endpoint, { method: "GET" });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: "DELETE" });
  }
}

export const baseApiClient = new BaseApiClient(API_BASE_URL);
