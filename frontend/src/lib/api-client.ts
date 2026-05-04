import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// Attach access token to every request
apiClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-refresh on 401 (never for login/register; skip if no refresh token)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (!original) return Promise.reject(error)
    const url = String(original.url ?? '')
    const isAuthPublic =
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/register') ||
      url.includes('/api/auth/refresh')

    if (error.response?.status === 401 && !original?._retry && !isAuthPublic) {
      original._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        return Promise.reject(error)
      }
      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        original.headers = original.headers ?? {}
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return apiClient(original)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    }
    return Promise.reject(error)
  }
)

// Auth helpers
export const authAPI = {
  register: (data: { name: string; email: string; password: string; role: string }) =>
    apiClient.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    apiClient.post('/api/auth/login', data),
  logout: (refreshToken: string) =>
    apiClient.post('/api/auth/logout', { refreshToken }),
  refresh: (refreshToken: string) =>
    apiClient.post('/api/auth/refresh', { refreshToken }),
  me: () => apiClient.get('/api/auth/me'),
}

export const usersAPI = {
  getProfile: (id: string) => apiClient.get(`/api/users/${id}`),
  updateProfile: (id: string, data: unknown) => apiClient.put(`/api/users/${id}`, data),
  getPosts: (id: string, cursor?: string) =>
    apiClient.get(`/api/users/${id}/posts`, { params: { cursor } }),
  getBookmarks: () => apiClient.get('/api/users/bookmarks'),
  connect: (id: string) => apiClient.post(`/api/users/${id}/connect`),
  respondToConnection: (id: string, action: 'accept' | 'reject') =>
    apiClient.put(`/api/users/${id}/connect`, { action }),
  getConnections: (id: string) => apiClient.get(`/api/users/${id}/connections`),
  getSuggestions: () => apiClient.get('/api/users/suggestions'),
  acceptConnection: (fromUserId: string) => apiClient.put(`/api/connections/${fromUserId}/accept`),
  declineConnection: (otherUserId: string) => apiClient.delete(`/api/connections/${otherUserId}/decline`),
  getUserTopics: (id: string) => apiClient.get(`/api/users/${id}/topics`),
  getAnalytics: (id: string) => apiClient.get(`/api/users/${id}/analytics`),
  followTopic: (topic: string) => apiClient.post('/api/users/topics/follow', { topic }),
  unfollowTopic: (topic: string) => apiClient.delete(`/api/users/topics/${topic}`),
  unfollowTopicBody: (topic: string) =>
    apiClient.delete('/api/users/topics/unfollow', { data: { topic } }),
}

export const uploadAPI = {
  profilePhoto: (formData: FormData) => apiClient.post('/api/upload/profile-photo', formData),
}

export const postsAPI = {
  getFeed: (cursor?: string, type?: string, tag?: string, following?: boolean) =>
    apiClient.get('/api/posts', {
      params: {
        cursor,
        type,
        tag,
        ...(following ? { following: 'true' } : {}),
      },
    }),
  create: (data: unknown) => apiClient.post('/api/posts', data),
  getById: (id: string) => apiClient.get(`/api/posts/${id}`),
  like: (id: string) => apiClient.post(`/api/posts/${id}/like`),
  unlike: (id: string) => apiClient.delete(`/api/posts/${id}/like`),
  bookmark: (id: string) => apiClient.post(`/api/posts/${id}/bookmark`),
  unbookmark: (id: string) => apiClient.delete(`/api/posts/${id}/bookmark`),
  repost: (id: string) => apiClient.post(`/api/posts/${id}/repost`),
}

export const papersAPI = {
  ingest: (data: { url?: string; abstract?: string; title?: string }) =>
    apiClient.post('/api/papers/ingest', data),
  getById: (id: string) => apiClient.get(`/api/papers/${id}`),
  getSimilar: (id: string) => apiClient.get(`/api/papers/${id}/similar`),
}

export const aiAPI = {
  simplify: (paperId: string, level: 'student' | 'researcher') =>
    apiClient.post('/api/ai/simplify', { paperId, level }),
  projectIdeas: (paperId: string) =>
    apiClient.post('/api/ai/project-ideas', { paperId }),
  conceptPath: (paperId: string) =>
    apiClient.post('/api/ai/concept-path', { paperId }),
  summariseDiscussion: (postId: string) =>
    apiClient.post('/api/ai/summarise-discussion', { postId }),
}

export const commentsAPI = {
  getByPost: (postId: string) => apiClient.get(`/api/posts/${postId}/comments`),
  create: (postId: string, data: { content: string; parentCommentId?: string }) =>
    apiClient.post(`/api/posts/${postId}/comments`, data),
  like: (id: string) => apiClient.post(`/api/comments/${id}/like`),
  markBestAnswer: (id: string) => apiClient.post(`/api/comments/${id}/best-answer`),
}

export const searchAPI = {
  search: (q: string, type?: string) =>
    apiClient.get('/api/search', { params: { q, type } }),
}
