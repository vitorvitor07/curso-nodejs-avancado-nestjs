import { UserPresenter } from '../../user.presenter'

describe('UsersController', () => {
  const createdAt = new Date()
  const props = {
    id: '310711f1-073b-461a-aa33-7ed0b0bac525',
    name: 'test name',
    password: 'fake',
    email: 'a@a.com',
    createdAt,
  }

  describe('constructor', () => {
    it('should be defined', () => {
      const sut = new UserPresenter(props)
      expect(sut.id).toEqual(props.id)
      expect(sut.name).toEqual(props.name)
      expect(sut.email).toEqual(props.email)
      expect(sut.createdAt).toEqual(props.createdAt)
    })
  })
})
