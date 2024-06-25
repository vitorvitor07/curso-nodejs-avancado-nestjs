import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator'
import { ClassValidatorFields } from '../../class-validator-fields'

class StabRules {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  @IsNotEmpty()
  price: number

  constructor(data: any) {
    Object.assign(this, data)
  }
}

class StubClassValidatorFields extends ClassValidatorFields<StabRules> {
  validate(data: any): boolean {
    return super.validate(new StabRules(data))
  }
}

describe('ClassValidatorFields integration tests', () => {
  it('Should should validate with errors', () => {
    const validator = new StubClassValidatorFields()
    expect(validator.validate(null)).toBeFalsy()
    expect(validator.errors).toStrictEqual({
      name: [
        'name should not be empty',
        'name must be a string',
        'name must be shorter than or equal to 255 characters',
      ],
      price: [
        'price should not be empty',
        'price must be a number conforming to the specified constraints',
      ],
    })
  })

  it('Should should validate without errors', () => {
    const validator = new StubClassValidatorFields()
    const propsMok = new StabRules({ price: 1200, name: 'car' })
    expect(validator.validate(propsMok)).toBeTruthy()
    expect(validator.errors).toBeNull()
    expect(validator.validatedData).toStrictEqual(propsMok)
  })
})
