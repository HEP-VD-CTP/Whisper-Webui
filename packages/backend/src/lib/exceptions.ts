
export class BadRequestException extends Error {
    statusCode: number;
    name: string; 
  
    constructor(message: any){
      super(`InvalidRequestException: ${message}`);
      this.name = `InvalidRequestException`;
      this.statusCode = 400;
    }
  }
  
  export class ForbiddenException extends Error {
    statusCode: number;
    name: string; 
    
    constructor(message: any){
        super(`ForbiddenException: ${message}`);
        this.name = `ForbiddenException`;
        this.statusCode = 403;
    }
  }
  
  export class NotFoundException extends Error {
    statusCode: number;
    name: string; 
    
    constructor(message: any){
        super(`NotFoundException: ${message}`);
        this.name = `NotFoundException`;
        this.statusCode = 404;
    }
  }
  
  export class ConflictException extends Error {
    statusCode: number;
    name: string; 
    
    constructor(message: any){
        super(`ConflictException: ${message}`);
        this.name = `ConflictException`;
        this.statusCode = 409;
    }
  }
  
  export default {
    BadRequestException,
    ForbiddenException,
    NotFoundException,
    ConflictException
  }