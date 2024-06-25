import { EntityValidationError } from '@/shared/domain/errors/validation-error'
import { UserDataBuilder } from '../../../testing/helpers/user-data-builder'
import { UserEntity, UserProps } from '../../user.entity'
describe('UserEntity integration testes', () => {
  describe('Constructor method', () => {
    it('should throw an error when creating a user with invalid name', () => {
      let props: UserProps = {
        ...UserDataBuilder({}),
        name: null,
      }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)

      props = { ...UserDataBuilder(props), name: '' }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)

      props = { ...UserDataBuilder(props), name: 'a'.repeat(256) }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)

      props = { ...UserDataBuilder(props), name: 256 as any }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)
    })

    it('should throw an error when creating a user with invalid email', () => {
      let props: UserProps = {
        ...UserDataBuilder({}),
        email: null,
      }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)

      props = { ...UserDataBuilder(props), email: '' }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)

      props = { ...UserDataBuilder(props), email: 'a'.repeat(256) }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)

      props = { ...UserDataBuilder(props), email: 256 as any }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)
    })

    it('should throw an error when creating a user with invalid password', () => {
      let props: UserProps = {
        ...UserDataBuilder({}),
        password: null,
      }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)

      props = { ...UserDataBuilder(props), password: '' }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)

      props = { ...UserDataBuilder(props), password: 'a'.repeat(101) }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)

      props = { ...UserDataBuilder(props), password: 256 as any }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)
    })

    it('should throw an error when creating a user with invalid createdAt', () => {
      let props: UserProps = {
        ...UserDataBuilder({}),
        createdAt: 'null' as any,
      }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)

      props = { ...UserDataBuilder(props), createdAt: 256 as any }

      expect(() => new UserEntity(props)).toThrow(EntityValidationError)
    })

    it('should a valid user', () => {
      expect.assertions(0) // esperado nenhum erro

      const props: UserProps = {
        ...UserDataBuilder({}),
      }

      new UserEntity(props)
    })
  })
})
