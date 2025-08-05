import { Exclude, Type } from "class-transformer";
import { IsString, Length } from "class-validator";
import { SuccessResDTO } from "src/shared/shared.dto";

export class LoginBodyDto {
    @IsString()
    email: string
    @IsString()
    @Length(6, 20, { message: 'Mật khẩu phải từ 6 đến 20 ký tự' })
    password: string
}
export class RegisterBodyDto extends LoginBodyDto {
    @IsString({ message: 'Tên phải là chuỗi' })
    name: string

    @IsString()
    // @Match('password', { message: 'Mật khẩu không khớp' })
    confirmPassword: string
}
export class RegisterData {
    id: number
    email: string
    name: string
    @Exclude()
    password: string
    createdAt: Date
    updatedAt: Date
    constructor(partial: Partial<RegisterData>) {
        Object.assign(this, partial)
    }
}
export class RegisterResDTO extends SuccessResDTO {
    @Type(() => RegisterData)
     data: RegisterData

    constructor(partial: Partial<RegisterResDTO>) {
        super(partial)
        Object.assign(this, partial)
    }
}