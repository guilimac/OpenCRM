import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../../core/auth/auth.service';
import { I18nService } from '../../../../core/services/i18n.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

export function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword');
  const confirmPassword = control.get('confirmPassword');
  if (!newPassword || !confirmPassword) return null;
  return newPassword.value === confirmPassword.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
    TranslatePipe,
  ],
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss'],
})
export class ProfileViewComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  readonly authService = inject(AuthService);
  readonly i18nService = inject(I18nService);
  readonly themeService = inject(ThemeService);

  readonly user = computed(() => this.authService.currentUser());

  readonly userInitials = computed(() => {
    const u = this.user();
    if (!u) return 'U';
    const first = u.firstName?.[0] ?? '';
    const last = u.lastName?.[0] ?? '';
    return (first + last).toUpperCase() || 'U';
  });

  readonly selectedTab = signal<number>(0);
  readonly avatarPreview = signal<string | null>(null);
  readonly customUrlInput = signal<string>('');
  readonly isSaving = signal<boolean>(false);
  readonly isSavingPassword = signal<boolean>(false);

  // Modern preset avatars (diverse, professional SVG avatars)
  readonly presetAvatars: string[] = [
    'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Max',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Bella',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Milo',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alexander',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',
  ];

  profileForm!: FormGroup;
  preferencesForm!: FormGroup;
  passwordForm!: FormGroup;

  ngOnInit(): void {
    const u = this.user();
    this.avatarPreview.set(u?.avatarUrl ?? null);
    this.customUrlInput.set(u?.avatarUrl ?? '');

    this.profileForm = this.fb.group({
      firstName: [u?.firstName ?? '', [Validators.required, Validators.minLength(1)]],
      lastName: [u?.lastName ?? '', [Validators.required, Validators.minLength(1)]],
      email: [u?.email ?? '', [Validators.required, Validators.email]],
      phone: [u?.phone ?? ''],
      jobTitle: [u?.jobTitle ?? ''],
      bio: [u?.bio ?? ''],
    });

    this.preferencesForm = this.fb.group({
      language: [u?.language ?? this.i18nService.currentLang() ?? 'pt'],
      timezone: [u?.timezone ?? 'America/Sao_Paulo'],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: [passwordMatchValidator] },
    );
  }

  selectPreset(url: string): void {
    this.avatarPreview.set(url);
    this.customUrlInput.set(url);
  }

  onCustomUrlChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    const val = target.value.trim();
    this.customUrlInput.set(val);
    this.avatarPreview.set(val || null);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      this.snackBar.open('Arquivo muito grande. Limite máximo: 2MB.', 'OK', { duration: 4000 });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      this.avatarPreview.set(result);
      this.customUrlInput.set(result);
    };
    reader.readAsDataURL(file);
  }

  removeAvatar(): void {
    this.avatarPreview.set(null);
    this.customUrlInput.set('');
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isSaving.set(true);
    const formVal = this.profileForm.value;

    this.authService
      .updateProfile({
        firstName: formVal.firstName.trim(),
        lastName: formVal.lastName.trim(),
        email: formVal.email.trim(),
        phone: formVal.phone?.trim() || null,
        jobTitle: formVal.jobTitle?.trim() || null,
        bio: formVal.bio?.trim() || null,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.snackBar.open(
            this.i18nService.translate('PROFILE.MSG_SAVED') || 'Perfil atualizado com sucesso!',
            'OK',
            { duration: 3500 },
          );
        },
        error: (err) => {
          this.isSaving.set(false);
          const msg = err?.error?.message || this.i18nService.translate('PROFILE.MSG_ERROR') || 'Erro ao salvar perfil.';
          this.snackBar.open(msg, 'OK', { duration: 4000 });
        },
      });
  }

  saveAvatar(): void {
    this.isSaving.set(true);
    const newAvatar = this.avatarPreview();

    this.authService
      .updateProfile({
        avatarUrl: newAvatar,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.snackBar.open(
            this.i18nService.translate('PROFILE.MSG_SAVED') || 'Avatar atualizado com sucesso!',
            'OK',
            { duration: 3500 },
          );
        },
        error: (err) => {
          this.isSaving.set(false);
          const msg = err?.error?.message || this.i18nService.translate('PROFILE.MSG_ERROR') || 'Erro ao salvar avatar.';
          this.snackBar.open(msg, 'OK', { duration: 4000 });
        },
      });
  }

  savePreferences(): void {
    if (this.preferencesForm.invalid) return;

    this.isSaving.set(true);
    const formVal = this.preferencesForm.value;

    if (formVal.language && formVal.language !== this.i18nService.currentLang()) {
      this.i18nService.setLanguage(formVal.language as 'pt' | 'en');
    }

    this.authService
      .updateProfile({
        language: formVal.language,
        timezone: formVal.timezone,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.snackBar.open(
            this.i18nService.translate('PROFILE.MSG_SAVED') || 'Preferências salvas!',
            'OK',
            { duration: 3500 },
          );
        },
        error: (err) => {
          this.isSaving.set(false);
          const msg = err?.error?.message || this.i18nService.translate('PROFILE.MSG_ERROR') || 'Erro ao salvar preferências.';
          this.snackBar.open(msg, 'OK', { duration: 4000 });
        },
      });
  }

  savePassword(): void {
    if (this.passwordForm.invalid) return;

    this.isSavingPassword.set(true);
    const val = this.passwordForm.value;

    this.authService
      .changePassword({
        currentPassword: val.currentPassword,
        newPassword: val.newPassword,
      })
      .subscribe({
        next: () => {
          this.isSavingPassword.set(false);
          this.passwordForm.reset();
          this.snackBar.open(
            this.i18nService.translate('PROFILE.MSG_PW_SUCCESS') || 'Senha alterada com sucesso!',
            'OK',
            { duration: 3500 },
          );
        },
        error: (err) => {
          this.isSavingPassword.set(false);
          const msg = err?.error?.message || this.i18nService.translate('PROFILE.MSG_PW_ERROR') || 'Erro ao alterar a senha.';
          this.snackBar.open(msg, 'OK', { duration: 4000 });
        },
      });
  }

  copyToClipboard(text?: string | null): void {
    if (!text) return;
    navigator.clipboard.writeText(text);
    this.snackBar.open(
      this.i18nService.translate('PROFILE.ID_COPIED') || 'ID copiado para a área de transferência!',
      'OK',
      { duration: 2500 },
    );
  }
}
