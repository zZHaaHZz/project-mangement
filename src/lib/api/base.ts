// Base API Client - Có thể dễ dàng thay đổi từ fetch sang axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export class BaseApiClient {
  protected baseURL: string;
  protected token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  // Method chung để gọi API - Có thể thay đổi implementation sau
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Xử lý headers một cách an toàn
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge headers từ options nếu có
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, options.headers);
      }
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    // gửi requst về server
    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        headers,
      });
    } catch (error) {
      // Network error - json-server có thể chưa chạy
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra json-server đã chạy chưa.');
    }

    if (!response.ok) {
      let errorMessage = response.statusText || 'Có lỗi xảy ra';
      
      // Cố gắng parse error message từ response
      try {
        const text = await response.text();
        if (text) {
          try {
            const errorData = JSON.parse(text);
            // json-server-auth trả về error trong format khác nhau
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (typeof errorData === 'string') {
              errorMessage = errorData;
            }
          } catch {
            // Nếu không parse được JSON, dùng text gốc
            errorMessage = text || errorMessage;
          }
        }
      } catch {
        // Nếu không đọc được response, dùng statusText
      }
      
      // Thông báo lỗi thân thiện hơn dựa trên status code
      if (response.status === 400) {
        errorMessage = 'Email hoặc mật khẩu không đúng';
      } else if (response.status === 404) {
        errorMessage = 'Không tìm thấy tài khoản';
      } else if (response.status === 0 || response.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng kiểm tra json-server đã chạy chưa.';
      }
      
      throw new Error(errorMessage);
    }

    // Parse response thành JSON
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Lỗi khi xử lý phản hồi từ server');
    }
  }

  // Helper methods cho các HTTP methods
  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Export instance base client
export const baseApiClient = new BaseApiClient(API_BASE_URL);

