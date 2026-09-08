import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, shareReplay } from 'rxjs';
import { AuthResponse, AuthTokens, LoginPayload, RegisterPayload, UserProfile } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _currentUser = signal<UserProfile | null>(this.getStoredUser());
  private readonly _accessToken = signal<string | null>(localStorage.getItem('access_token'));
  private readonly _refreshToken = signal<string | null>(localStorage.getItem('refresh_token'));
  private refreshInFlight$: Observable<AuthTokens> | null = null;

  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isAuthenticated = computed(() => !!this._accessToken());
  public readonly userRole = computed(() => this._currentUser()?.role ?? null);

  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/login', payload).pipe(
      tap((res) => this.setSession(res)),
      catchError((err) => throwError(() => err)),
    );
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/register', payload).pipe(
      tap((res) => this.setSession(res)),
      catchError((err) => throwError(() => err)),
    );
  }

  changePassword(payload: { currentPassword: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/v1/auth/change-password', payload);
  }

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>('/api/v1/auth/me').pipe(
      tap((user) => {
        this._currentUser.set(user);
        localStorage.setItem('user_profile', JSON.stringify(user));
      }),
    );
  }

  updateProfile(payload: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>('/api/v1/auth/profile', payload).pipe(
      tap((user) => {
        this._currentUser.set(user);
        localStorage.setItem('user_profile', JSON.stringify(user));
      }),
    );
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/v1/auth/forgot-password', { email });
  }

  resetPassword(payload: { token: string; newPassword: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>('/api/v1/auth/reset-password', payload);
  }

  refreshToken(): Observable<AuthTokens> {
    if (this.refreshInFlight$) {
      return this.refreshInFlight$;
    }

    const refreshToken = this._refreshToken() ?? localStorage.getItem('refresh_token');
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }

    this.refreshInFlight$ = this.http
      .post<AuthTokens>('/api/v1/auth/refresh', { refreshToken })
      .pipe(
        tap((tokens) => {
          this._accessToken.set(tokens.accessToken);
          this._refreshToken.set(tokens.refreshToken);
          localStorage.setItem('access_token', tokens.accessToken);
          localStorage.setItem('refresh_token', tokens.refreshToken);
          this.refreshInFlight$ = null;
        }),
        catchError((err) => {
          this.refreshInFlight$ = null;
          this.logout();
          return throwError(() => err);
        }),
        shareReplay(1),
      );

    return this.refreshInFlight$;
  }

  logout(): void {
    const refreshToken = this._refreshToken() ?? localStorage.getItem('refresh_token');
    if (refreshToken) {
      this.http.post('/api/v1/auth/logout', { refreshToken }).subscribe({
        error: () => {},
      });
    }

    this._currentUser.set(null);
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this.refreshInFlight$ = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');

    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return this._accessToken() ?? localStorage.getItem('access_token');
  }

  private setSession(auth: AuthResponse): void {
    this._currentUser.set(auth.user);
    this._accessToken.set(auth.tokens.accessToken);
    this._refreshToken.set(auth.tokens.refreshToken);

    localStorage.setItem('access_token', auth.tokens.accessToken);
    localStorage.setItem('refresh_token', auth.tokens.refreshToken);
    localStorage.setItem('user_profile', JSON.stringify(auth.user));
  }

  private getStoredUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem('user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
