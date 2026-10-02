const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('studymate_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('studymate_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('studymate_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data?.error || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: { 
    name: string; 
    email: string; 
    password: string; 
    target_exam?: string;
    college_name?: string;
    department?: string;
    phone?: string;
  }) =>
    request<{ message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    request<{ message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  loginDemo: () =>
    request<{ message: string; token: string; user: any }>('/auth/demo', {
      method: 'POST'
    }),

  getMe: () => request<{ user: any }>('/auth/me'),

  updateProfile: (payload: {
    name?: string;
    target_exam?: string;
    college_name?: string;
    department?: string;
    phone?: string;
  }) =>
    request<{ message: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  getLoginLogs: () => request<{ logs: any[] }>('/auth/logs'),

  // Documents
  getDocuments: (params?: { q?: string; subject?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);
    if (params?.subject) searchParams.append('subject', params.subject);
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{ documents: any[] }>(`/documents${queryStr}`);
  },

  getDocument: (id: string) =>
    request<{
      document: any;
      summary: any;
      flashcards: any[];
      exam_questions: any[];
      recent_quizzes: any[];
    }>(`/documents/${id}`),

  deleteDocument: (id: string) =>
    request<{ message: string }>(`/documents/${id}`, { method: 'DELETE' }),

  uploadDocument: (file: File, subject?: string, onProgress?: (pct: number) => void): Promise<any> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append('file', file);
      if (subject) formData.append('subject', subject);

      xhr.open('POST', `${API_BASE}/documents/upload`);

      const token = getAuthToken();
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      if (xhr.upload && onProgress) {
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        };
      }

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(res);
          } else {
            reject(new Error(res.error || 'Upload failed'));
          }
        } catch (e) {
          reject(new Error('Invalid response from server'));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during file upload'));
      xhr.send(formData);
    });
  },

  // Quizzes
  generateQuiz: (payload: { document_id: string; count?: number; difficulty?: string; topic?: string }) =>
    request<{ message: string; quiz: any; questions: any[] }>('/quizzes/generate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  getQuiz: (id: string) =>
    request<{ quiz: any; document_name: string; questions: any[]; answers: any[] }>(`/quizzes/${id}`),

  answerQuestion: (quizId: string, payload: { question_id: string; selected_answer: string | null; is_marked_for_review?: boolean }) =>
    request<{ answer: any; is_correct: boolean; correct_answer: string; explanation: string }>(`/quizzes/${quizId}/answer`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  submitQuiz: (quizId: string, payload: { time_taken_seconds?: number }) =>
    request<{ message: string; quiz: any; review: any[] }>(`/quizzes/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  retryQuiz: (quizId: string) =>
    request<{ message: string; quiz: any; questions: any[] }>(`/quizzes/${quizId}/retry`, {
      method: 'POST'
    }),

  getQuizHistory: () =>
    request<{ quizzes: any[] }>('/quizzes/history/all'),

  // Chat / Doubts
  getChatHistory: (documentId: string) =>
    request<{ document_name: string; messages: any[]; suggested_questions: string[] }>(`/chat/${documentId}`),

  sendDoubt: (documentId: string, message: string) =>
    request<{ user_message: any; ai_message: any }>(`/chat/${documentId}`, {
      method: 'POST',
      body: JSON.stringify({ message })
    }),

  clearChat: (documentId: string) =>
    request<{ message: string }>(`/chat/${documentId}/clear`, { method: 'DELETE' }),

  // Analytics & Search
  getDashboardMetrics: () =>
    request<{ metrics: any; recent_documents: any[]; recent_quizzes: any[] }>('/analytics/dashboard'),

  getProgressAnalytics: () =>
    request<any>('/analytics/progress'),

  globalSearch: (q: string) =>
    request<{ documents: any[]; topics: any[]; keywords: any[]; questions: any[] }>(`/analytics/search?q=${encodeURIComponent(q)}`)
};
