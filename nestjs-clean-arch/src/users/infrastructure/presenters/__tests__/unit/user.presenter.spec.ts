import { instanceToPlain } from 'class-transformer'
import { UserPresenter } from '../../user.presenter'

describe('UserPresenter unit tests', () => {
  const createdAt = new Date()
  const props = {
    id: '310711f1-073b-461a-aa33-7ed0b0bac525',
    name: 'test name',
    password: 'fake',
    email: 'a@a.com',
    createdAt,
  }
  let sut: UserPresenter

  beforeEach(() => {
    sut = new UserPresenter(props)
  })

  describe('constructor', () => {
    it('should be defined', () => {
      expect(sut.id).toEqual(props.id)
      expect(sut.name).toEqual(props.name)
      expect(sut.email).toEqual(props.email)
      expect(sut.createdAt).toEqual(props.createdAt)
    })
  })

  it('should presenter data', () => {
    const output = instanceToPlain(sut)
    expect(output).toStrictEqual({
      id: '310711f1-073b-461a-aa33-7ed0b0bac525',
      name: 'test name',
      email: 'a@a.com',
      createdAt: createdAt.toISOString(),
    })
  })
})
