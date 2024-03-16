import { Entity } from '@/shared/domain/entities/entity'

export type UserProps = {
  name: string
  email: string
  password: string
  createAt?: Date
}

export class UserEntity extends Entity<UserProps> {
  constructor(
    public readonly props: UserProps,
    id?: string,
  ) {
    super(props, id)
    this.props.createAt = this.props.createAt || new Date()
  }

  // Getters
  get name(): string {
    return this.props.name
  }

  get email(): string {
    return this.props.email
  }

  get password(): string {
    return this.props.password
  }

  get createAt(): Date {
    return this.props.createAt
  }
}
