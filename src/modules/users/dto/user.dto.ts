import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'nombre Ejemplo', description: 'nombre del usuario' })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: 'ejemplo@gmail.com', description: 'email del usuario' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(20)
  @ApiProperty({ example: 'hola123', description: 'contraseña del usuario' })
  password: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ example: 'nombre Ejemplo', description: 'nombre del usuario' })
  name?: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({ example: 'ejemplo@gmail.com', description: 'email del usuario' })
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'hola123', description: 'contraseña del usuario' })
  password?: string;
}

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ example: 'ejemplo@gmail.com', description: 'email del usuario' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'hola123', description: 'contraseña del usuario' })
  password: string;
}

export class VerifyUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'ejemplo@gmail.com', description: 'email del usuario' })
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '12342', description: 'codigo de verificacion enviado por correo' })
  verificationCode: string;
}

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: '43f434ftg3434g34g', description: 'token' })
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'hola123', description: 'contraseña actual' })
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @ApiProperty({ example: 'hola1234', description: 'nueva contraseña' })
  newPassword: string;
}
