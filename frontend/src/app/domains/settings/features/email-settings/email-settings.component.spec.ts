import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { EmailSettingsComponent } from './email-settings.component';
import { EmailSettingsApiService } from '../../services/email-settings-api.service';
import { EmailConfigResponse } from '../../models/email-config.models';

describe('EmailSettingsComponent', () => {
  let component: EmailSettingsComponent;
  let fixture: ComponentFixture<EmailSettingsComponent>;
  let emailApiMock: any;

  const mockConfig: EmailConfigResponse = {
    orgId: 'org-test-123',
    provider: 'MAILGUN',
    mailgunApiKey: '********',
    mailgunDomain: 'mg.testcompany.com',
    mailgunHost: 'api.mailgun.net',
    smtpHost: 'smtp.gmail.com',
    smtpPort: 587,
    smtpUser: 'user@gmail.com',
    smtpPassword: '********',
    smtpSecure: false,
    fromEmail: 'sales@testcompany.com',
    fromName: 'Test Sales',
    replyTo: 'support@testcompany.com',
    isActive: true,
    updatedAt: new Date().toISOString(),
  };

  beforeEach(async () => {
    emailApiMock = {
      getConfig: vi.fn().mockReturnValue(of(mockConfig)),
      saveConfig: vi.fn().mockReturnValue(of(mockConfig)),
      sendTestEmail: vi.fn().mockReturnValue(of({ success: true, message: 'Message sent: <test-123>' })),
    };

    await TestBed.configureTestingModule({
      imports: [EmailSettingsComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: EmailSettingsApiService, useValue: emailApiMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EmailSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and load initial configuration', () => {
    expect(component).toBeTruthy();
    expect(emailApiMock.getConfig).toHaveBeenCalled();
    expect(component.emailForm.get('fromEmail')?.value).toBe('sales@testcompany.com');
    expect(component.emailForm.get('provider')?.value).toBe('MAILGUN');
    expect(component.isConfigured()).toBe(true);
  });

  it('should switch provider between MAILGUN and SMTP', () => {
    component.selectProvider('SMTP');
    expect(component.currentProvider).toBe('SMTP');
    expect(component.emailForm.get('provider')?.value).toBe('SMTP');

    component.selectProvider('MAILGUN');
    expect(component.currentProvider).toBe('MAILGUN');
  });

  it('should set SMTP port and security presets', () => {
    component.setSmtpPreset(465, true);
    expect(component.emailForm.get('smtpPort')?.value).toBe(465);
    expect(component.emailForm.get('smtpSecure')?.value).toBe(true);

    component.setSmtpPreset(587, false);
    expect(component.emailForm.get('smtpPort')?.value).toBe(587);
    expect(component.emailForm.get('smtpSecure')?.value).toBe(false);
  });

  it('should call saveConfig with valid payload', () => {
    component.emailForm.patchValue({
      fromEmail: 'info@testcompany.com',
      fromName: 'Info Team',
      mailgunApiKey: 'key-new-12345',
      mailgunDomain: 'mg.newdomain.com',
    });

    component.save();

    expect(emailApiMock.saveConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        provider: 'MAILGUN',
        fromEmail: 'info@testcompany.com',
        fromName: 'Info Team',
        mailgunApiKey: 'key-new-12345',
        mailgunDomain: 'mg.newdomain.com',
      }),
    );
  });

  it('should call sendTestEmail and display success result', () => {
    component.emailForm.get('testTargetEmail')?.setValue('recipient@example.com');
    component.sendTestEmail();

    expect(emailApiMock.sendTestEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        targetEmail: 'recipient@example.com',
      }),
    );
    expect(component.testResult()?.success).toBe(true);
    expect(component.testResult()?.message).toContain('<test-123>');
  });

  it('should handle test email failure gracefully', () => {
    emailApiMock.sendTestEmail.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid SMTP authentication' } })),
    );

    component.emailForm.get('testTargetEmail')?.setValue('recipient@example.com');
    component.sendTestEmail();

    expect(component.testResult()?.success).toBe(false);
    expect(component.testResult()?.message).toBe('Invalid SMTP authentication');
  });
});
