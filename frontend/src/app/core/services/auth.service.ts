import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CartService } from './cart.service';
import type {
  ApiResponse,
  UserPublic,
  AuthTokens,
  RegisterRequest,
  LoginRequest,
  ChangePasswordRequest,
  UpdateProfileRequest,
  TokenPayload,
} from '@shared';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'devmart_access_token';
  private readonly refreshTokenKey = 'devmart_refresh_token';

  private currentUserSig = signal<UserPublic | null>(null);
  readonly currentUser = this.currentUserSig.asReadonly();
  readonly isLoggedIn = computed(() => !!this.currentUserSig());
  readonly isAdmin = computed(() => this.currentUserSig()?.role === 'admin');

  private _initialized = false;
  get initialized(): boolean { return this._initialized; }

  constructor(private http: HttpClient, private router: Router, private cartService: CartService) {}

  /** Called by APP_INITIALIZER — resolves after auth state is loaded */
  init(): Promise<void> {
    if (!this.getToken()) {
      this._initialized = true;
      return Promise.resolve();
    }
    return firstValueFrom(
      this.http.get<ApiResponse<UserPublic>>(`${this.api}/profile`).pipe(
        tap(res => {
          if (res.success && res.data) {
            this.currentUserSig.set(res.data);
          }
        }),
        catchError(() => {
          this.clearToken();
          return of(null);
        })
      )
    ).then(() => { this._initialized = true; });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem(this.refreshTokenKey, token);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  register(data: RegisterRequest): Observable<ApiResponse<{ user: UserPublic; tokens: AuthTokens }>> {
    return this.http.post<ApiResponse<{ user: UserPublic; tokens: AuthTokens }>>(`${this.api}/register`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setToken(res.data.tokens.accessToken);
          this.setRefreshToken(res.data.tokens.refreshToken);
          this.currentUserSig.set(res.data.user);
          // Merge guest cart into server cart
          this.cartService.mergeGuestCart().subscribe({ next: () => {}, error: () => {} });
        }
      })
    );
  }

  login(data: LoginRequest): Observable<ApiResponse<{ user: UserPublic; tokens: AuthTokens }>> {
    return this.http.post<ApiResponse<{ user: UserPublic; tokens: AuthTokens }>>(`${this.api}/login`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setToken(res.data.tokens.accessToken);
          this.setRefreshToken(res.data.tokens.refreshToken);
          this.currentUserSig.set(res.data.user);
          // Merge guest cart into server cart
          this.cartService.mergeGuestCart().subscribe({ next: () => {}, error: () => {} });
        }
      })
    );
  }

  logout(): void {
    // Preserve the user's server cart as a guest cart before clearing auth
    this.cartService.transferToGuestCart();

    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(`${this.api}/logout`, { refreshToken }).subscribe();
    }
    this.clearToken();
    this.currentUserSig.set(null);

    // Reload cart from localStorage (now guest mode)
    this.cartService.loadCart();
    this.router.navigate(['/']);
  }

  refreshToken(): Observable<ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<ApiResponse<{ tokens: { accessToken: string; refreshToken: string } }>>(
      `${this.api}/refresh`, { refreshToken }
    ).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.setToken(res.data.tokens.accessToken);
          this.setRefreshToken(res.data.tokens.refreshToken);
        }
      })
    );
  }

  loadProfile(): void {
    this.http.get<ApiResponse<UserPublic>>(`${this.api}/profile`).subscribe({
      next: res => {
        if (res.success && res.data) {
          this.currentUserSig.set(res.data);
        }
      },
      error: () => {
        this.clearToken();
        this.currentUserSig.set(null);
      },
    });
  }

  updateProfile(data: UpdateProfileRequest): Observable<ApiResponse<UserPublic>> {
    return this.http.put<ApiResponse<UserPublic>>(`${this.api}/profile`, data).pipe(
      tap(res => {
        if (res.success && res.data) {
          this.currentUserSig.set(res.data);
        }
      })
    );
  }

  changePassword(data: ChangePasswordRequest): Observable<ApiResponse> {
    return this.http.put<ApiResponse>(`${this.api}/change-password`, data);
  }
}
