import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { signal } from '@angular/core';
import { ProfileViewComponent } from './profile-view.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { UserProfile } from '../../../../core/auth/auth.models';

describe('ProfileViewComponent', () => {
  let mockAuthService: any;
  let mockSnackBar: any;
  let mockI18nService: any;
  let mockThemeService: any;

  const sampleUser: UserProfile = {
    id: 'user-123',
    email: 'bruno@empresa.com',
    firstName: 'Bruno',
    lastName: 'Costa',
    role: 'SALES_REP',
    orgId: 'org-abc',
    avatarUrl: 'https://example.com/avatar.png',
    phone: '+55 11 98888-7777',
    jobTitle: 'Account Executive',
    bio: 'Sales representative',
    language: 'pt',
    timezone: 'America/Sao_Paulo',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(async () => {
    mockAuthService = {
      currentUser: signal<UserProfile | null>(sampleUser),
      updateProfile: vi.fn().mockReturnValue(of({ ...sampleUser, firstName: 'Brunno' })),
      changePassword: vi.fn().mockReturnValue(of({ message: 'Password updated successfully' })),
    };

    mockSnackBar = {
      open: vi.fn(),
    };

    mockI18nService = {
      currentLang: signal<'pt' | 'en'>('pt'),
      t: vi.fn().mockImplementation((k: string) => k),
      translate: vi.fn().mockImplementation((k: string) => k),
      setLanguage: vi.fn(),
    };

    mockThemeService = {
      isDarkMode: signal<boolean>(false),
      toggleTheme: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileViewComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: I18nService, useValue: mockI18nService },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();
  });

  it('should initialize component and populate forms from current user', () => {
    const fixture = TestBed.createComponent(ProfileViewComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp).toBeTruthy();
    expect(comp.profileForm.value.firstName).toBe('Bruno');
    expect(comp.profileForm.value.lastName).toBe('Costa');
    expect(comp.profileForm.value.email).toBe('bruno@empresa.com');
    expect(comp.profileForm.value.jobTitle).toBe('Account Executive');
    expect(comp.avatarPreview()).toBe('https://example.com/avatar.png');
    expect(comp.profileForm.valid).toBe(true);
  });

  it('should compute user initials correctly', () => {
    const fixture = TestBed.createComponent(ProfileViewComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    expect(comp.userInitials()).toBe('BC');
  });

  it('should select a preset avatar and update preview', () => {
    const fixture = TestBed.createComponent(ProfileViewComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.selectPreset('https://api.dicebear.com/7.x/bottts/svg?seed=Felix');
    expect(comp.avatarPreview()).toBe('https://api.dicebear.com/7.x/bottts/svg?seed=Felix');
    expect(comp.customUrlInput()).toBe('https://api.dicebear.com/7.x/bottts/svg?seed=Felix');
  });

  it('should remove avatar', () => {
    const fixture = TestBed.createComponent(ProfileViewComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.removeAvatar();
    expect(comp.avatarPreview()).toBeNull();
    expect(comp.customUrlInput()).toBe('');
  });

  it('should call updateProfile when saving profile', () => {
    const fixture = TestBed.createComponent(ProfileViewComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.profileForm.patchValue({ firstName: 'Brunno', lastName: 'Silva' });
    comp.saveProfile();

    expect(mockAuthService.updateProfile).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Brunno',
        lastName: 'Silva',
      }),
    );
    expect(mockSnackBar.open).toHaveBeenCalled();
  });

  it('should call updateProfile when saving avatar', () => {
    const fixture = TestBed.createComponent(ProfileViewComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.selectPreset('https://api.dicebear.com/7.x/bottts/svg?seed=Milo');
    comp.saveAvatar();

    expect(mockAuthService.updateProfile).toHaveBeenCalledWith({
      avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
    });
    expect(mockSnackBar.open).toHaveBeenCalled();
  });

  it('should validate password form and detect password mismatch', () => {
    const fixture = TestBed.createComponent(ProfileViewComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.passwordForm.patchValue({
      currentPassword: 'oldSecret123',
      newPassword: 'newPassword123',
      confirmPassword: 'differentPassword456',
    });

    expect(comp.passwordForm.valid).toBe(false);
    expect(comp.passwordForm.hasError('passwordMismatch')).toBe(true);
  });

  it('should call changePassword when password form is valid and submitted', () => {
    const fixture = TestBed.createComponent(ProfileViewComponent);
    const comp = fixture.componentInstance;
    fixture.detectChanges();

    comp.passwordForm.patchValue({
      currentPassword: 'oldSecret123',
      newPassword: 'newPassword123',
      confirmPassword: 'newPassword123',
    });

    expect(comp.passwordForm.valid).toBe(true);
    comp.savePassword();

    expect(mockAuthService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'oldSecret123',
      newPassword: 'newPassword123',
    });
  });
});
