import fs from 'node:fs';
import mercurius from 'mercurius';
import logger from 'src/lib/logger.ts';
import { UnauthorizedException } from 'src/lib/exceptions.ts';
import store from 'src/db/store.ts';

// read schema.graphl file that contains the gql schema
export const schema = fs.readFileSync('./src/graphql/schema.graphql', 'utf-8');


export function getFields(info: any): Array<string> {
  const fields = [];
  for (const field of info.fieldNodes[0].selectionSet.selections) 
    fields.push(field.name.value);
  return fields;
}

// all the exceptions thrown by the graphql engine are caught here
export function errorFormatter(err, ctx){
  const response = mercurius.defaultErrorFormatter(err, ctx)      

  for (let i = 0; i < err.errors.length; i++){
    const error = err.errors[i];
    
    if (error.message.includes('Graphql validation error') || 
        error.message.startsWith('InvalidRequestException:')){
      response.response.errors[i]["status"] = 400;
      response.response.errors[i]["error"]  = 'Bad Request';
    }
    else if (error.message.startsWith('UnauthorizedException:')){
      response.response.errors[i]["status"] = 401;
      response.response.errors[i]["error"]  = 'Unauthorized';
    }
    else if (error.message.startsWith('ForbiddenException:')){
      response.response.errors[i]["status"] = 403;
      response.response.errors[i]["error"]  = 'Forbidden';
    }
    else if (error.message.startsWith('NotFoundException:')){
      response.response.errors[i]["status"] = 404;
      response.response.errors[i]["error"]  = 'Not Found';
    }
    else if (error.message.startsWith('ConflictException:')){
      response.response.errors[i]["status"] = 409;
      response.response.errors[i]["error"]  = 'Conflict';
    }
    else {
      logger.error('graphql', error.message, error);
      response.response.errors[i]["status"] = 500;
      response.response.errors[i]["error"]  = 'INTERNAL SERVER ERROR';
    }
  }
  
  // we keep the highest status code
  response.statusCode = 200;
  for (const error of response.response.errors)
    if ((error as any).status > response.statusCode)
      response.statusCode = (error as any).status;
  
  return response;
}


// check if the user has a valid session
export async function checkSession(ctx: any, exp: number): Promise<boolean>{
  const sessionId = ctx.reply.request.cookies.sessionId;
  // throw exception if the user has not provided a sessionId
  if (!sessionId)
    throw new UnauthorizedException('SessionId was not provided');

  // get the user by the sessionId
  const user = await store.getSession(sessionId);
  if (!user)
    throw new UnauthorizedException('Invalid sessionId');
  
  // the user is authenticated, store the user in the context
  ctx['user'] = user;
  // update the session expiry time in redis
  await store.extendSession(sessionId, exp);
  // update the session expiry in the cookies
  setSessionCookie(ctx, sessionId, exp);

  return true;
}

// set the user session in the cookies
export function setSessionCookie(ctx: any, sessionId: string, exp: number){
  ctx.reply.setCookie('sessionId', sessionId, {
    httpOnly: true,
    path: '/',
    maxAge: exp
  });
}
