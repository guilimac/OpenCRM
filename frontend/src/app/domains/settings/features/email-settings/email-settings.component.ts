import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { I18nService } from '../../../../core/services/i18n.service';
import { EmailSettingsApiService } from '../../services/email-settings-api.service';
import { EmailProviderType, SaveEmailConfigRequest } from '../../models/email-config.models';

@Component({
  selector: 'app-email-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDividerModule,
    TranslatePipe,
  ],
  templateUrl: './email-settings.component.html',
  styleUrls: ['./email-settings.component.scss'],
})
export class EmailSettingsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly emailApi = inject(EmailSettingsApiService);
  private readonly snackBar = inject(MatSnackBar);
  readonly i18n = inject(I18nService);

  readonly loading = signal<boolean>(true);
  readonly saving = signal<boolean>(false);
  readonly testing = signal<boolean>(false);
  readonly hideApiKey = signal<boolean>(true);
  readonly hideSmtpPassword = signal<boolean>(true);
  readonly isConfigured = signal<boolean>(false);
  readonly lastUpdated = signal<string | null>(null);
  readonly testResult = signal<{ success: boolean; message: string } | null>(null);

  emailForm: FormGroup = this.fb.group({
    provider: ['MAILGUN' as EmailProviderType, [Validators.required]],
    fromEmail: ['', [Validators.required, Validators.email]],
    fromName: ['', [Validators.required]],
    replyTo: ['', [Validators.email]],
    isActive: [true],
    // Mailgun
    mailgunApiKey: [''],
    mailgunDomain: [''],
    mailgunHost: ['api.mailgun.net'],
    // SMTP
    smtpHost: [''],
    smtpPort: [587, [Validators.min(1), Validators.max(65535)]],
    smtpUser: [''],
    smtpPassword: [''],
    smtpSecure: [false],
    // Test field
    testTargetEmail: ['', [Validators.email]],
  });

  ngOnInit(): void {
    this.loadConfig();
  }

  get currentProvider(): EmailProviderType {
    return this.emailForm.get('provider')?.value as EmailProviderType;
  }

  loadConfig(): void {
    this.loading.set(true);
    this.emailApi.getConfig().subscribe({
      next: (config) => {
        this.loading.set(false);
        if (config) {
          this.isConfigured.set(true);
          this.lastUpdated.set(config.updatedAt ?? null);
          this.emailForm.patchValue({
            provider: config.provider || 'MAILGUN',
            fromEmail: config.fromEmail || '',
            fromName: config.fromName || '',
            replyTo: config.replyTo || '',
            isActive: config.isActive ?? true,
            mailgunApiKey: config.mailgunApiKey || '',
            mailgunDomain: config.mailgunDomain || '',
            mailgunHost: config.mailgunHost || 'api.mailgun.net',
            smtpHost: config.smtpHost || '',
            smtpPort: config.smtpPort || 587,
            smtpUser: config.smtpUser || '',
            smtpPassword: config.smtpPassword || '',
            smtpSecure: config.smtpSecure ?? false,
          });
        }
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message || this.i18n.t('EMAIL_SETTINGS.SAVE_ERROR');
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      },
    });
  }

  selectProvider(provider: EmailProviderType): void {
    this.emailForm.get('provider')?.setValue(provider);
    this.testResult.set(null);
  }

  setSmtpPreset(port: number, secure: boolean): void {
    this.emailForm.patchValue({
      smtpPort: port,
      smtpSecure: secure,
    });
  }

  toggleApiKeyVisibility(): void {
    this.hideApiKey.update((v) => !v);
  }

  toggleSmtpPasswordVisibility(): void {
    this.hideSmtpPassword.update((v) => !v);
  }

  save(): void {
    const provider = this.currentProvider;
    const fromEmailControl = this.emailForm.get('fromEmail');
    const fromNameControl = this.emailForm.get('fromName');

    fromEmailControl?.markAsTouched();
    fromNameControl?.markAsTouched();

    if (fromEmailControl?.invalid || fromNameControl?.invalid) {
      this.snackBar.open(this.i18n.t('SETTINGS.REQUIRED_FIELD'), 'OK', { duration: 3000 });
      return;
    }

    if (provider === 'MAILGUN') {
      const apiKeyControl = this.emailForm.get('mailgunApiKey');
      const domainControl = this.emailForm.get('mailgunDomain');
      if (!apiKeyControl?.value || !domainControl?.value) {
        this.snackBar.open(this.i18n.t('SETTINGS.REQUIRED_FIELD'), 'OK', { duration: 3000 });
        return;
      }
    } else {
      const hostControl = this.emailForm.get('smtpHost');
      const portControl = this.emailForm.get('smtpPort');
      if (!hostControl?.value || !portControl?.value) {
        this.snackBar.open(this.i18n.t('SETTINGS.REQUIRED_FIELD'), 'OK', { duration: 3000 });
        return;
      }
    }

    const val = this.emailForm.value;
    const payload: SaveEmailConfigRequest = {
      provider: val.provider,
      fromEmail: val.fromEmail,
      fromName: val.fromName,
      replyTo: val.replyTo || null,
      isActive: val.isActive,
      mailgunApiKey: val.provider === 'MAILGUN' ? val.mailgunApiKey : null,
      mailgunDomain: val.provider === 'MAILGUN' ? val.mailgunDomain : null,
      mailgunHost: val.provider === 'MAILGUN' ? val.mailgunHost : null,
      smtpHost: val.provider === 'SMTP' ? val.smtpHost : null,
      smtpPort: val.provider === 'SMTP' ? Number(val.smtpPort) : null,
      smtpUser: val.provider === 'SMTP' ? val.smtpUser : null,
      smtpPassword: val.provider === 'SMTP' ? val.smtpPassword : null,
      smtpSecure: val.provider === 'SMTP' ? !!val.smtpSecure : false,
    };

    this.saving.set(true);
    this.emailApi.saveConfig(payload).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.isConfigured.set(true);
        this.lastUpdated.set(saved.updatedAt ?? null);
        this.snackBar.open(this.i18n.t('EMAIL_SETTINGS.SAVE_SUCCESS'), 'OK', { duration: 3500 });
        this.loadConfig();
      },
      error: (err) => {
        this.saving.set(false);
        const msg = err?.error?.message || this.i18n.t('EMAIL_SETTINGS.SAVE_ERROR');
        this.snackBar.open(msg, 'OK', { duration: 4000 });
      },
    });
  }

  sendTestEmail(): void {
    const targetEmail = this.emailForm.get('testTargetEmail')?.value;
    if (!targetEmail || this.emailForm.get('testTargetEmail')?.invalid) {
      this.snackBar.open(this.i18n.t('CUSTOMER.VALIDATION_EMAIL_INVALID'), 'OK', { duration: 3000 });
      return;
    }

    const val = this.emailForm.value;
    this.testing.set(true);
    this.testResult.set(null);

    this.emailApi
      .sendTestEmail({
        targetEmail,
        provider: val.provider,
        fromEmail: val.fromEmail || undefined,
        fromName: val.fromName || undefined,
        mailgunApiKey: val.provider === 'MAILGUN' ? val.mailgunApiKey : undefined,
        mailgunDomain: val.provider === 'MAILGUN' ? val.mailgunDomain : undefined,
        mailgunHost: val.provider === 'MAILGUN' ? val.mailgunHost : undefined,
        smtpHost: val.provider === 'SMTP' ? val.smtpHost : undefined,
        smtpPort: val.provider === 'SMTP' ? Number(val.smtpPort) : undefined,
        smtpUser: val.provider === 'SMTP' ? val.smtpUser : undefined,
        smtpPassword: val.provider === 'SMTP' ? val.smtpPassword : undefined,
        smtpSecure: val.provider === 'SMTP' ? !!val.smtpSecure : undefined,
      })
      .subscribe({
        next: (res) => {
          this.testing.set(false);
          this.testResult.set(res);
          this.snackBar.open(this.i18n.t('EMAIL_SETTINGS.TEST_SUCCESS'), 'OK', { duration: 4000 });
        },
        error: (err) => {
          this.testing.set(false);
          const errorMsg = err?.error?.message || this.i18n.t('EMAIL_SETTINGS.TEST_ERROR');
          this.testResult.set({
            success: false,
            message: errorMsg,
          });
          this.snackBar.open(errorMsg, 'OK', { duration: 5000 });
        },
      });
  }
}
