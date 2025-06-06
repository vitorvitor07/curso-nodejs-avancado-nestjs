import { UserEntity } from '@/users/domain/entities/user.entity'
import { UserDataBuilder } from '@/users/domain/testing/helpers/user-data-builder'
import { UserOutputMapper } from '../../user-output.dto'

describe('UserOutputMapper unit tests', () => {
  it('Should convert a user in output', async () => {
    const entity = new UserEntity(UserDataBuilder({}))
    const spyToJson = jest.spyOn(entity, 'toJSON')
    const sut = await UserOutputMapper.toOutput(entity)
    expect(spyToJson).toHaveBeenCalled()
    expect(sut).toStrictEqual(entity.toJSON())
  })
})
