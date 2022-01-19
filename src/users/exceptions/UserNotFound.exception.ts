import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(uuid: string) {
    super(`User with uuid ${uuid} not found`);
  }
}
