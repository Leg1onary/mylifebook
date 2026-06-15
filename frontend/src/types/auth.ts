export interface LoginPayload {
  username: string
  password: string
}

export interface RegisterPayload {
  email: string
  username: string
  password: string
}

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  token_type: string
}

export interface UserOut {
  id: number
  email: string
  username: string
  created_at: string
}
