import { UserDTO } from './user.dto';
import { UserEntity } from './user.entity';

export class UserMapper {
  dtoToEntity(userDTO: UserDTO): UserEntity {
    return new UserEntity(
      userDTO.uuid,
      userDTO.name,
      userDTO.surname_1,
      userDTO.surname_2,
      userDTO.email,
      userDTO.password,
      userDTO.birth_date,
    );
  }

  entityToDto(userEntity: UserEntity): UserDTO {
    return new UserDTO(
      userEntity.uuid,
      userEntity.name,
      userEntity.surname_1,
      userEntity.surname_2,
      userEntity.email,
      userEntity.password,
      userEntity.birth_date,
    );
  }
}
