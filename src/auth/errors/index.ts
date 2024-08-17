import { HttpError } from '../../__shared__/errors'

export class InvalidCredentialsError extends HttpError {
  constructor() {
    super(401, 'auth/invalid-credentials', ['Email or password is incorrect'])
  }
}

export class EmailAlreadyExistsError extends HttpError {
  constructor() {
    super(409, 'auth/email-already-exists', ['Email already exists'])
  }
}

export class UserNotFoundError extends HttpError {
  constructor() {
    super(404, 'auth/user-not-found', ['User not found'])
  }
}
