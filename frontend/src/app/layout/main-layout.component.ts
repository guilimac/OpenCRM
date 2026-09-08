import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AuthService } from '../core/auth/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { I18nService } from '../core/services/i18n.service';
import { TranslatePipe } from '../shared/pipes/translate.pipe';
import { ChangePasswordDialogComponent } from '../core/auth/features/change-password/change-password-dialog.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    TranslatePipe,
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav
        #drawer
        class="sidenav"
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        role="navigation"
        aria-label="Navegação Principal"
      >
        <a routerLink="/dashboard" class="brand-bar flex-row gap-sm align-center">
          <img src="/images/opencrm-logo.png" alt="OpenCRM Logo" class="brand-logo-img" />
          <span class="brand-text">OpenCRM</span>
        </a>

        <mat-nav-list class="nav-list">
          <a
            mat-list-item
            routerLink="/dashboard"
            routerLinkActive="active-link"
            (click)="isMobile() && drawer.close()"
          >
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>{{ 'NAV.DASHBOARD' | translate }}</span>
          </a>

          <a
            mat-list-item
            routerLink="/pipeline"
            routerLinkActive="active-link"
            (click)="isMobile() && drawer.close()"
          >
            <mat-icon matListItemIcon>view_kanban</mat-icon>
            <span matListItemTitle>{{ 'NAV.PIPELINE' | translate }}</span>
          </a>

          <a
            mat-list-item
            routerLink="/customers"
            routerLinkActive="active-link"
            (click)="isMobile() && drawer.close()"
          >
            <mat-icon matListItemIcon>business</mat-icon>
            <span matListItemTitle>{{ 'NAV.CUSTOMERS' | translate }}</span>
          </a>

          <a
            mat-list-item
            routerLink="/customer-lists"
            routerLinkActive="active-link"
            (click)="isMobile() && drawer.close()"
          >
            <mat-icon matListItemIcon>campaign</mat-icon>
            <span matListItemTitle>{{ 'NAV.CUSTOMER_LISTS' | translate }}</span>
          </a>

          <a
            mat-list-item
            routerLink="/budgets"
            routerLinkActive="active-link"
            (click)="isMobile() && drawer.close()"
          >
            <mat-icon matListItemIcon>request_quote</mat-icon>
            <span matListItemTitle>{{ 'NAV.BUDGETS' | translate }}</span>
          </a>

          <a
            mat-list-item
            routerLink="/products"
            routerLinkActive="active-link"
            (click)="isMobile() && drawer.close()"
          >
            <mat-icon matListItemIcon>inventory_2</mat-icon>
            <span matListItemTitle>{{ 'NAV.PRODUCTS' | translate }}</span>
          </a>

          <a
            mat-list-item
            routerLink="/settings"
            routerLinkActive="active-link"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="isMobile() && drawer.close()"
          >
            <mat-icon matListItemIcon>tune</mat-icon>
            <span matListItemTitle>{{ 'NAV.SETTINGS' | translate }}</span>
          </a>

          <a
            mat-list-item
            routerLink="/settings/email"
            routerLinkActive="active-link"
            (click)="isMobile() && drawer.close()"
          >
            <mat-icon matListItemIcon>forward_to_inbox</mat-icon>
            <span matListItemTitle>{{ 'NAV.EMAIL_SETTINGS' | translate }}</span>
          </a>
        </mat-nav-list>

        <div class="sidenav-footer">
          <div class="currency-indicator">
            <mat-icon class="icon-sm">payments</mat-icon>
            <span>{{ 'NAV.BASE_CURRENCY' | translate }} <strong>BRL (R$)</strong></span>
          </div>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="sidenav-content">
        <!-- Top Navigation Bar -->
        <mat-toolbar color="surface" class="topbar">
          @if (isMobile()) {
            <button
              type="button"
              mat-icon-button
              (click)="drawer.toggle()"
              aria-label="Alternar menu de navegação"
            >
              <mat-icon>menu</mat-icon>
            </button>
          }

          <span class="toolbar-title">{{ 'NAV.PORTAL_TITLE' | translate }}</span>
          <div class="flex-spacer"></div>

          <!-- Language Selector -->
          <button
            mat-button
            [matMenuTriggerFor]="langMenu"
            class="lang-btn"
            [attr.aria-label]="'NAV.LANGUAGE' | translate"
          >
            <span class="flag-icon">{{ i18nService.currentLang() === 'pt' ? '🇧🇷' : '🇺🇸' }}</span>
            <span class="lang-code">{{ i18nService.currentLang().toUpperCase() }}</span>
            <mat-icon class="icon-xs">arrow_drop_down</mat-icon>
          </button>
          <mat-menu #langMenu="matMenu">
            <button mat-menu-item (click)="i18nService.setLanguage('pt')">
              <span class="mr-sm">🇧🇷</span>
              <span>Português (Brasil)</span>
              @if (i18nService.currentLang() === 'pt') {
                <mat-icon class="check-icon">check</mat-icon>
              }
            </button>
            <button mat-menu-item (click)="i18nService.setLanguage('en')">
              <span class="mr-sm">🇺🇸</span>
              <span>English (US)</span>
              @if (i18nService.currentLang() === 'en') {
                <mat-icon class="check-icon">check</mat-icon>
              }
            </button>
          </mat-menu>

          <!-- Theme Mode Switcher -->
          <button
            mat-icon-button
            (click)="themeService.toggleTheme()"
            [attr.aria-label]="(themeService.isDarkMode() ? 'NAV.THEME_LIGHT' : 'NAV.THEME_DARK') | translate"
          >
            <mat-icon>{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>

          <!-- User Menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-avatar-btn" aria-label="Menu do usuário">
            @if (authService.currentUser()?.avatarUrl) {
              <img [src]="authService.currentUser()!.avatarUrl" alt="Avatar" class="topbar-avatar-img" />
            } @else {
              <div class="topbar-avatar-fallback">{{ userInitials() }}</div>
            }
          </button>
          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header">
              @if (authService.currentUser()?.avatarUrl) {
                <img [src]="authService.currentUser()!.avatarUrl" alt="Avatar" class="menu-avatar-img" />
              } @else {
                <div class="menu-avatar-fallback">{{ userInitials() }}</div>
              }
              <div class="user-menu-info">
                <p class="user-name">{{ authService.currentUser()?.firstName }} {{ authService.currentUser()?.lastName }}</p>
                <p class="user-email">{{ authService.currentUser()?.email }}</p>
                <span class="user-role-badge">{{ authService.currentUser()?.role }}</span>
              </div>
            </div>
            <mat-divider></mat-divider>
            <a mat-menu-item routerLink="/profile">
              <mat-icon>manage_accounts</mat-icon>
              <span>{{ 'NAV.PROFILE' | translate }}</span>
            </a>
            <button mat-menu-item (click)="openChangePasswordDialog()">
              <mat-icon>lock_reset</mat-icon>
              <span>{{ 'NAV.CHANGE_PASSWORD' | translate }}</span>
            </button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="authService.logout()">
              <mat-icon>logout</mat-icon>
              <span>{{ 'NAV.LOGOUT' | translate }}</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Main Content Area -->
        <main class="content-outlet" role="main">
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    .sidenav {
      width: 250px;
      background: #ffffff;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
    }
    :host-context(.dark-theme) .sidenav {
      background: #1e293b;
      border-right-color: #334155;
    }
    .brand-bar {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      align-items: center;
      text-decoration: none;
      color: inherit;
      cursor: pointer;
    }
    :host-context(.dark-theme) .brand-bar {
      border-bottom-color: #334155;
    }
    .brand-logo-img {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      object-fit: cover;
    }
    .brand-text {
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .nav-list {
      padding-top: 0.75rem;
    }
    .active-link {
      background-color: #eff6ff !important;
      color: #1d4ed8 !important;
      font-weight: 600;
    }
    :host-context(.dark-theme) .active-link {
      background-color: #1e3a8a !important;
      color: #93c5fd !important;
    }
    .sidenav-footer {
      margin-top: auto;
      padding: 1rem 1.25rem;
      border-top: 1px solid #f1f5f9;
    }
    :host-context(.dark-theme) .sidenav-footer {
      border-top-color: #334155;
    }
    .currency-indicator {
      font-size: 0.75rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .topbar {
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
    }
    :host-context(.dark-theme) .topbar {
      background: #1e293b;
      border-bottom-color: #334155;
    }
    .toolbar-title {
      font-size: 1.1rem;
      font-weight: 600;
    }
    .user-avatar-btn {
      padding: 0;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .topbar-avatar-img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 1.5px solid rgba(0, 0, 0, 0.1);
    }
    .topbar-avatar-fallback {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #3b82f6;
      color: #ffffff;
      font-size: 0.8rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-menu-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0.85rem 1rem;
      min-width: 220px;
    }
    .menu-avatar-img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }
    .menu-avatar-fallback {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #3b82f6;
      color: #ffffff;
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .user-menu-info {
      overflow: hidden;
    }
    .user-name {
      font-weight: 600;
      margin: 0;
      font-size: 0.95rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-email {
      color: #64748b;
      font-size: 0.78rem;
      margin: 0.1rem 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-role-badge {
      display: inline-block;
      font-size: 0.68rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 10px;
      background: #e0f2fe;
      color: #0369a1;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    :host-context(.dark-theme) .user-email {
      color: #94a3b8;
    }
    :host-context(.dark-theme) .user-role-badge {
      background: #1e3a8a;
      color: #93c5fd;
    }
    .content-outlet {
      min-height: calc(100vh - 64px);
    }
    .icon-sm {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
    }
    .icon-xs {
      font-size: 0.9rem;
      width: 0.9rem;
      height: 0.9rem;
      vertical-align: middle;
    }
    .lang-btn {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
    }
    :host-context(.dark-theme) .lang-btn {
      color: #94a3b8;
    }
    .flag-icon {
      font-size: 1.1rem;
      line-height: 1;
    }
    .lang-code {
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .check-icon {
      color: #2563eb;
      margin-left: auto;
    }
    :host-context(.dark-theme) .check-icon {
      color: #60a5fa;
    }
  `],
})
export class MainLayoutComponent {
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly dialog = inject(MatDialog);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  readonly i18nService = inject(I18nService);

  readonly isMobile = signal<boolean>(false);

  readonly userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return 'U';
    const first = user.firstName?.[0] ?? '';
    const last = user.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || 'U';
  });

  constructor() {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.TabletPortrait]).subscribe((result) => {
      this.isMobile.set(result.matches);
    });
  }

  openChangePasswordDialog(): void {
    this.dialog.open(ChangePasswordDialogComponent, {
      width: 'fit-content',
      maxWidth: '95vw',
      disableClose: true,
    });
  }
}
