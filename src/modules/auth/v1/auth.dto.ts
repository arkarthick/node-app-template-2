import Joi from 'joi';

export interface LoginDTO {
  email: string;
  password?: string; // Optional for SSO
  provider?: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface AuthResponseDTO {
  user: {
    id: string;
    email: string;
    fullName: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const keycloakLoginSchema = Joi.object({
  token: Joi.string().required(),
});
