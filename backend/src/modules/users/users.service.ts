import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
    constructor(private readonly userRepository: UsersRepository) {}

    async getProfile(userId: string) {
        return this.userRepository.findById(userId);
    }
}
