

import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserModel, UserDocument } from './schemas/user.schema';
import {
    User,
    IUserServiceInterface as UserServiceInterface,
} from './interfaces/user.interface';
import { ChangePasswordDto, CreateUserDto, LoginDto, UpdateUserDto, VerifyUserDto } from './dto/user.dto';
import { JwtService } from '@nestjs/jwt';
import { VerificationCode } from './schemas/verification-code.schema';
import { GlobalHelper } from 'src/helpers/global.helper';

@Injectable()
export class UsersService implements UserServiceInterface {
    constructor(
        @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
        @InjectModel(VerificationCode.name) private verificationCodeModel: Model<VerificationCode>,
        private readonly helper: GlobalHelper,
        private readonly jwtService: JwtService,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = await this.userModel.findOne({ email: createUserDto.email }).lean();
        if (user) {
            throw new ConflictException(`Ya existe un usuario con email ${createUserDto.email}`);
        }
        const hashedPassword = await this.helper.hashCodeTextBcrypt(createUserDto.password, 10);
        const newUser = new this.userModel({ ...createUserDto, password: hashedPassword, isVerified: false });
        const savedUser = await newUser.save();
        await this.generateVerificationCode(savedUser.id, savedUser.email);
        return this.helper.mapToUserInterface(savedUser.toObject());
    }

    async findAll(): Promise<User[]> {
        const users = await this.userModel.find().lean().exec();
        return users.map(user => this.helper.mapToUserInterface(user));
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const updateData: Partial<UpdateUserDto> = { ...updateUserDto };
        if (updateUserDto.password && updateUserDto.password.trim() !== '') {
            updateData.password = await this.helper.hashCodeTextBcrypt(updateUserDto.password, 10);
        } else {
            delete updateData.password;
        }
        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, updateData, { new: true })
            .lean()
            .exec();
        if (!updatedUser) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return this.helper.mapToUserInterface(updatedUser);
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userModel.findById(id).lean().exec();

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return this.helper.mapToUserInterface(user);
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userModel.find({ email: email }).lean().exec();
        if (!user[0]) {
            throw new NotFoundException(`Usuario con email ${email} no encontrado`);
        }
        return this.helper.mapToUserInterface(user[0]);
    }

    async remove(id: string): Promise<void> {
        const result = await this.userModel.findByIdAndDelete(id).exec();
        if (!result) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
    }

    async verifyUser(verifyUserDto: VerifyUserDto): Promise<{ message: string }> {
        const { email, verificationCode } = verifyUserDto;
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado.');
        }

        if (user.isVerified) {
            return { message: 'El usuario ya está verificado.' };
        }
        const userMapped = this.helper.mapToUserInterface(user);
        const codeRecord = await this.verificationCodeModel.findOne({ user: userMapped.id, code: verificationCode });

        if (!codeRecord) {
            throw new BadRequestException('Código de verificación incorrecto o expirado.');
        }

        if (codeRecord.expiresAt < new Date()) {
            throw new BadRequestException('Código de verificación expirado.');
        }

        user.isVerified = true;
        await user.save();
        await this.verificationCodeModel.deleteMany({ user: user._id });

        return { message: 'Cuenta verificada correctamente.' };
    }

    async validateUser(email: string, password: string): Promise<User> {
        const user = await this.userModel.find({ email: email }).lean().exec();
        if (!user[0]) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }
        const dtoUser = this.helper.mapToUserInterface(user[0]);
        const isPasswordValid = await this.helper.hashComparteBcrypt(password, dtoUser.password as string);
        if (!dtoUser.isVerified) {
            throw new UnauthorizedException('Es necesario verificar el usuario');
        }
        if (!isPasswordValid) {
            throw new UnauthorizedException('Correo o contraseña incorrectos');
        }
        return dtoUser;
    }

    async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User; }> {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const tokensGenerated = await this.generateTokens(user.id, user.email);

        const hashedRefreshToken = await this.helper.hashCodeTextBcrypt(tokensGenerated.refreshToken, 10);
        await this.userModel.findByIdAndUpdate(user.id, { refreshToken: hashedRefreshToken });

        return {
            ...tokensGenerated,
            user: this.helper.mapToUserInterface(user),
        };
    }

    async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; }> {
        try {
            console.log('teomf', refreshToken);
            const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_SECRET });
            const user = await this.userModel.findById(payload.sub);

            if (!user || !user.refreshToken) {
                throw new ForbiddenException('refreshToken inválido o usuario no encontrado.');
            }

            const isValid = await this.helper.hashComparteBcrypt(refreshToken, user.refreshToken);
            if (!isValid) {
                throw new ForbiddenException('refreshToken inválido.');
            }

            return await this.generateTokens(user.id, user.email);
        } catch (error) {
            console.error('Error al refrescar token:', error);
            throw new UnauthorizedException('Token inválido o expirado.');
        }
    }

    async changePassword(id: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { currentPassword, newPassword } = changePasswordDto;

        const user = await this.userModel.findById(id);
        if (!user) {
            throw new BadRequestException('Usuario no encontrado.');
        }

        const isPasswordValid = await this.helper.hashComparteBcrypt(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('La contraseña actual es incorrecta.');
        }

        const hashedNewPassword = await this.helper.hashCodeTextBcrypt(newPassword, 10);

        await this.userModel.findByIdAndUpdate(id, {
            password: hashedNewPassword,
            refreshToken: null,
        });

        return;
    }

    async generateVerificationCode(userId: string, email: string) {
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        await this.verificationCodeModel.deleteMany({ user: userId });
        const newCode = new this.verificationCodeModel({
            user: userId,
            code: verificationCode,
        });
        await newCode.save();
        await this.helper.sendMail(
            email,
            'Verificación de cuenta',
            `Tu código de verificación es: ${verificationCode}`,
            `<h1>Verificación de Cuenta</h1><p>Tu código de verificación es: <b>${verificationCode}</b></p>`
        );
    }

    async generateTokens(userId: string, email: string): Promise<{ accessToken: string, refreshToken: string }> {
        const payload = { sub: userId, email };
        const accessToken = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '15m' });
        const refreshToken = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, expiresIn: '7d' });

        const hashedRefreshToken = await this.helper.hashCodeTextBcrypt(refreshToken, 10);
        await this.userModel.findByIdAndUpdate(userId, { refreshToken: hashedRefreshToken });

        return { accessToken, refreshToken };
    }

    async generateCode(email: string): Promise<{ menssage: string }> {
        const user = await this.findByEmail(email);
        await this.generateVerificationCode(user.id, user.email);
        return { menssage: 'codigo generado' }
    }
}