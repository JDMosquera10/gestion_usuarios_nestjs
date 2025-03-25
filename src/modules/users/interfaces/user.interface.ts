import {
    ChangePasswordDto,
    CreateUserDto,
    LoginDto,
    UpdateUserDto,
    VerifyUserDto,
  } from '../dto/user.dto';
  
  export interface User {
    id: string;
    name: string;
    email: string;
    isVerified: boolean;
    role: string;
    refreshToken?: string;
    createdAt: Date;
    updatedAt: Date;
  }
  
  export interface IUserServiceInterface {
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string): Promise<User>;
    findByEmail(email: string): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    verifyUser(verifyUserDto: VerifyUserDto): Promise<{ message: string }>;
    validateUser(email: string, password: string): Promise<User>;
    generateVerificationCode(userId: string, email: string);
    generateTokens(userId: string, email: string): Promise<{ accessToken: string, refreshToken: string }>
    login(
      loginDto: LoginDto,
    ): Promise<{ accessToken: string; refreshToken: string; user: User }>;
    refreshToken(
      refreshToken: string,
    ): Promise<{ accessToken: string; refreshToken: string }>;
    changePassword(
      id: string,
      changePasswordDto: ChangePasswordDto,
    ): Promise<void>;
  }
  