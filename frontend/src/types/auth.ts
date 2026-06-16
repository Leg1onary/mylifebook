export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  display_name: string
  password: string
  timezone?: string
}

export interface TokenResponse {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
}

export interface UserOut {
  id: number
  email: string
  display_name: string
  timezone: string
  created_at: string
}
