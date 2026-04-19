import { UserDTO } from '@/modules/user/v1/user.dto';
import { UserRepository } from '@/modules/user/v1/user.repository';
import { AppError } from '@/common/middleware/error.middleware';
import { ResponseCode } from '@/common/constants/response-codes';

export class GetUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(id: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      error.code = ResponseCode.NOT_FOUND;
      throw error;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
