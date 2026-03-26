export class RegisterDto {
  email!: string;
  password!: string;
  full_name?: string;
  phone?: string;
}

export class LoginDto {
  email!: string;
  password!: string;
}
