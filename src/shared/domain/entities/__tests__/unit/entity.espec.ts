import { validate as uuidValidate } from 'uuid'
import { Entity } from '../../entity'

type StubProps = {
  prop1: string
  prop2: number
}

class StubEntity extends Entity<StubProps> {}

describe('Entity unit tests', () => {
  it('Should set props and id ', () => {
    const props = { prop1: 'prop1', prop2: 4 }
    const entity = new StubEntity(props)

    expect(entity.props).toStrictEqual(props)
    expect(entity._id).not.toBeNull()
    expect(uuidValidate(entity._id)).toBeTruthy()
  })

  it('Should accept a valid uuid', () => {
    const props = { prop1: 'prop1', prop2: 4 }
    const id = 'c0bb4c37-41f0-4bbe-9efe-87992d6be486'
    const entity = new StubEntity(props, id)

    expect(uuidValidate(entity._id)).toBeTruthy()
    expect(entity._id).toBe(id)
  })

  it('Should convert a entity to a JavaScript Object', () => {
    const props = { prop1: 'prop1', prop2: 4 }
    const id = 'c0bb4c37-41f0-4bbe-9efe-87992d6be486'
    const entity = new StubEntity(props, id)

    expect(entity.toJSON()).toStrictEqual({ id, ...props })
  })
})
