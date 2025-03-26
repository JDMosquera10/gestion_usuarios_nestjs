import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class GlobalHelper {
    private transporter: nodemailer.Transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });
    }

    mapToUserInterface(user: any): any {
        return {
            id: user._id ? user._id.toString() : user.id,
            name: user?.name || '',
            email: user?.email || '',
            password: user.password || '',
            isVerified: user.isVerified || false,
            role: user?.role || '',
        };
    }

    async hashCodeTextBcrypt(code: string, saltOrRounds: string | number): Promise<string> {
        return await bcrypt.hash(code, saltOrRounds);
    }

    async hashComparteBcrypt(codeToCampare: string, code: string): Promise<boolean> {
        return await bcrypt.compare(code, codeToCampare);
    }

    async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
        try {
            const info = await this.transporter.sendMail({
                from: `"Mi App Gestion de usuarios" <${process.env.EMAIL_USER}>`,
                to,
                subject,
                text,
                html,
            });
            console.log("Correo enviado:", info.messageId);
        } catch (error) {
            console.error("Error enviando correo:", error);
            throw new Error("No se pudo enviar el correo.");
        }
    }
}
