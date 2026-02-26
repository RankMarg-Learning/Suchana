// ─── API Configuration ────────────────────────────────────────
// Change BASE_URL before production deployment
export const BASE_URL = 'http://localhost:8080/api/v1';

export const API = {
    EXAMS: `${BASE_URL}/exams`,
    USERS: `${BASE_URL}/users`,
    PUSH_TOKENS: `${BASE_URL}/push-tokens`,
} as const;
