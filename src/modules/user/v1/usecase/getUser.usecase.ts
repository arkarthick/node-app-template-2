import { UserDTO } from '../user.dto';
import { UserRepository } from '../user.repository';
import { AppError } from '../../../../common/middleware/error.middleware';

export class GetUserUseCase {
  constructor(private userRepository: UserRepository) { }

  async execute(id: string): Promise<UserDTO> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error: AppError = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
