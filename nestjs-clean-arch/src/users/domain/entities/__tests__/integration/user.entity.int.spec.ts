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
    })
  })
})
