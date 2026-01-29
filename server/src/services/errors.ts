/**
 * Custom Error Klassen für Business-Logik
 * Diese Errors werden von Services geworfen und im Controller zu HTTP-Responses umgewandelt
 */

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = "Ressource nicht gefunden") {
    super(404, message);
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Nicht autorisiert") {
    super(401, message);
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Keine Berechtigung") {
    super(403, message);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "Konflikt") {
    super(409, message);
    this.name = "ConflictError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = "Ungültige Anfrage") {
    super(400, message);
    this.name = "BadRequestError";
  }
}

export class InternalError extends AppError {
  constructor(message: string = "Interner Serverfehler") {
    super(500, message);
    this.name = "InternalError";
  }
}
