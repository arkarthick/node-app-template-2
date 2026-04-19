import { CreateUserDTO, UserDTO } from '@/modules/user/v1/user.dto';
import { UserRepository } from '@/modules/user/v1/user.repository';
import { AuditService } from '@/infrastructure/audit/audit.service';
import { AppError } from '@/common/middleware/error.middleware';

import bcrypt from 'bcryptjs';

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private auditService: AuditService,
  ) {}

  async execute(data: CreateUserDTO): Promise<UserDTO> {
    // Business logic: check uniqueness
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      const error: AppError = new Error('Email already in use') as AppError;
      error.statusCode = 409;
      throw error;
    }

    // Hash password if provided (it should be for local strategy)
    const hashedData = { ...data };
    if (data.password) {
      hashedData.password = await bcrypt.hash(data.password, 10);
    }

    const user = await this.userRepository.create(hashedData);
    if (!user) {
      throw new Error('Failed to create user');
    }

    // Trigger audit log
    await this.auditService.log({
      entityType: 'USER',
      entityId: user.id,
      action: 'CREATE',
      metadata: { email: user.email },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
