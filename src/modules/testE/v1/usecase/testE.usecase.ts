import { TesteRepository } from '../testE.repository';
import { CreateTesteDTO, TesteResponseDTO } from '../testE.dto';

export class TesteUseCase {
  constructor(private testeRepository: TesteRepository) {}

  async execute(data: CreateTesteDTO): Promise<TesteResponseDTO> {
    // Business logic goes here
    return {
      id: 'generated-id',
      name: data.name,
    };
  }
}
