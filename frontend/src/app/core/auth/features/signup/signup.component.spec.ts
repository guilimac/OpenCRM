import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SignupComponent } from './signup.component';
import { AuthService } from '../../auth.service';
import { of } from 'rxjs';

describe('SignupComponent', () => {
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      register: vi.fn().mockReturnValue(of({ user: { id: '1' }, tokens: { accessToken: 'token' } })),
    };

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();
  });

  it('should create the signup component with invalid form initially', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    const comp = fixture.componentInstance;
    expect(comp).toBeTruthy();
    expect(comp.form.valid).toBe(false);
  });

  it('should validate required fields and email format', () => {
    const fixture = TestBed.createComponent(SignupComponent);
    const comp = fixture.componentInstance;

    comp.form.patchValue({
      firstName: 'Maria',
      lastName: 'Silva',
      email: 'invalid-email',
      password: '123',
    });
    expect(comp.form.valid).toBe(false);

    comp.form.patchValue({
      email: 'maria.silva@empresa.com',
      password: 'password123',
    });
    expect(comp.form.valid).toBe(true);
  });
});
