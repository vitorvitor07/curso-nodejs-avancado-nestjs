import { BcrypthsHashProvider } from '../../bcryptjs-hash.provider'

describe('BcrypthsHashProvider unit tests', () => {
  let sut: BcrypthsHashProvider

  beforeEach(() => {
    sut = new BcrypthsHashProvider()
  })

  it('Should return encrypted password', async () => {
    const password = 'testpass123'
    const hash = await sut.generateHash(password)
    expect(hash).toBeDefined()
  })

  it('Should return false on invalid password', async () => {
    const password = 'testpass123'
    const hash = await sut.generateHash(password)
    const result = await sut.compareHash('fake', hash)
    expect(result).toBeFalsy()
  })

  it('Should return true on valid password', async () => {
    const password = 'testpass123'
    const hash = await sut.generateHash(password)
    const result = await sut.compareHash(password, hash)
    expect(result).toBeTruthy()
  })
})
