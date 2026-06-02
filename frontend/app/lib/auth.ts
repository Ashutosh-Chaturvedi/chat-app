export const getToken = (): string | null => {
    return localStorage.getItem("access_token");
};

export const setTokens = (access: string, refresh: string): void => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
};

export const clearTokens = (): void => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};