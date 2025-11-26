import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface SignupPayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private registerUrl = 'http://localhost:8080/api/auth/register';
  private loginUrl = 'http://localhost:8080/api/auth/sign-in';

  private readonly TOKEN_KEY = 'jwt';

  constructor(private http: HttpClient) {}

  register(payload: SignupPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.registerUrl, payload).pipe(
      tap(res => this.saveToken(res.token))
    );
  }

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.loginUrl, payload).pipe(
      tap(res => this.saveToken(res.token))
    );
  }

  private saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private decodePayload(token: string): any | null {
    try {
      const payloadPart = token.split('.')[1];
      const json = atob(payloadPart);
      return JSON.parse(json);
    } catch {
      return null;
    }
  }

  getCurrentUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodePayload(token);
    return payload?.sub ?? null;
  }

  getEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodePayload(token);
    return payload?.email ?? null;
  }

  getFullName(): string | null {
    const token = this.getToken();
    if (!token) return null;
    const payload = this.decodePayload(token);

    if (payload?.firstName || payload?.lastName) {
      return `${payload.firstName ?? ''} ${payload.lastName ?? ''}`.trim();
    }

    if (payload?.name) {
      return payload.name;
    }

    const email = this.getEmail();
    if (!email) return null;

    const username = email.split('@')[0];
    return username.charAt(0).toUpperCase() + username.slice(1);
  }

  resetPassword(email: string, newPassword: string) {
    const url = 'http://localhost:8080/api/auth/reset-password-simple';
    return this.http.post(url, {
      email: email,
      newPassword: newPassword
    });
  }
}
