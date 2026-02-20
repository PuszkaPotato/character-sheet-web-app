export interface AuthResponse {
  userId: string
  username: string
  email: string
  token: string
  expiresAt: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface CharacterDto {
  id: string
  userId: string
  name: string
  data: string
  createdAt: string
  updatedAt: string
}

export interface CreateCharacterRequest {
  name: string
  data: string
}

export interface UpdateCharacterRequest {
  name?: string
  data?: string
}

export interface ApiError {
  message: string
  statusCode: number
}
