export class InvalidPassowordError extends Error {
  constructor(public message: string) {
    super(message)
    this.name = 'InvalidPassowordError'
  }
}
