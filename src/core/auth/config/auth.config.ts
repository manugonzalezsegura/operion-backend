import { registerAs } from '@nestjs/config';
import type { StringValue } from 'ms';

function getEnvOrThrow(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(
      `Environment variable ${name} is required but was not provided.`,
    );
  }
  return value;
}
function getTokenExpiresInOrThrow(name: string): StringValue {
  return getEnvOrThrow(name) as StringValue;
}

export const authConfig = registerAs('auth', () => ({
  accessToken: {
    secret: getEnvOrThrow('JWT_ACCESS_SECRET'),
    expiresIn: getTokenExpiresInOrThrow('JWT_ACCESS_EXPIRES_IN'),
  },
  refreshToken: {
    secret: getEnvOrThrow('JWT_REFRESH_SECRET'),
    expiresIn: getTokenExpiresInOrThrow('JWT_REFRESH_EXPIRES_IN'),
  },
}));
