import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto, CreateUserDto, LoginDto, UpdateUserDto, VerifyUserDto } from './dto/user.dto';
import { User } from './interfaces/user.interface';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('api/v1/users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Crear un usuario' })
    @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
    async create(@Body() createUserDTO: CreateUserDto): Promise<User> {
        return this.userService.create(createUserDTO);
    }

    @Get()
    @ApiOperation({ summary: 'Obtener todos los usuarios' })
    @ApiResponse({ status: 200, description: 'Usuarios obtenidos exitosamente.' })
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obtener un usuario por id' })
    @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente.' })
    async findOne(@Param('id') id: string): Promise<User> {
        return this.userService.findOne(id);
    }

    @Get('email/:email')
    @ApiOperation({ summary: 'Obtener un usuario por email' })
    @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente.' })
    async findByEmail(@Param('email') email: string): Promise<User> {
        return this.userService.findByEmail(email);
    }

    @Post('verify')
    @ApiOperation({ summary: 'Verificación de usuario' })
    @ApiResponse({ status: 200, description: 'Usuario verificado.' })
    async verifyUser(@Body() verifyUserDto: VerifyUserDto): Promise<{ message: string }> {
        return this.userService.verifyUser(verifyUserDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Edicion de usuario' })
    @ApiResponse({ status: 200, description: 'Usuario editado exitosamente.' })
    async update(
        @Param('id') id: string,
        @Body() updateUserDTO: UpdateUserDto,
    ): Promise<User> {
        return this.userService.update(id, updateUserDTO);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'eliminacion un usuario' })
    @ApiResponse({ status: 200, description: 'Usuario eliminado exitosamente.' })
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        return this.userService.remove(id);
    }

    @ApiOperation({ summary: 'autenticación de usuario' })
    @ApiResponse({ status: 200, description: 'Usuario autenticado.' })
    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string; user: User; }> {
        return this.userService.login(loginDto);
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'refrescar token' })
    @ApiResponse({ status: 200, description: 'Token.', example: { refreshToken: "token" } })
    async refreshToken(@Body() body: { refreshToken: string }): Promise<{ accessToken: string; refreshToken: string }> {
        const { refreshToken } = body;
        return this.userService.refreshToken(refreshToken);
    }

    @ApiOperation({ summary: 'Cambio de contraseña' })
    @ApiResponse({ status: 200, description: 'contraseña nueva.' })
    @Post('change-password/:id')
    async changePassword(@Param('id') id: string, @Body() changePasswordDto: ChangePasswordDto): Promise<void> {
        return this.userService.changePassword(id, changePasswordDto);
    }


    @ApiOperation({ summary: 'generar nuevo codigo pra un email' })
    @ApiResponse({ status: 200, description: 'codigo generado' })
    @Get('generate-code/:email')
    async generateCode(@Param('email') email: string): Promise<{ menssage: string }> {
        return this.userService.generateCode(email);
    }

}
