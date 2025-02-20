
import crypto from "node:crypto";
import db, { DB } from "@whisper-webui/lib/src/db/db.ts";
import { NotFoundException, ForbiddenException } from "@whisper-webui/lib/src/db/exceptions.ts";
import { User } from "@whisper-webui/lib/src/types/types.ts";

import usersDAO from "@whisper-webui/lib/src/db/usersDAO.ts";

export async function login(email: string, password: string): Promise<User> {
  // we get all the users with this email address
  const users = await usersDAO.findByEmail(db.pool(), email, [
    'id', 'firstname', 'lastname', 'email', 'pwd', 'salt', 'admin', 'archived', 'blocked', 'created_at'
  ]) as Array<User>;

  // we want to keep the only user that has not been archive
  let user: User = null;
  for (const u of users){
    if (u.archived === false) {
      user = u;
      break;
    }
  }

  // check if user is able to login
  if (user == null)
    throw new NotFoundException(`User not found`);
  if (user.blocked)
    throw new ForbiddenException(`User is blocked`);

  // chek the user password
  const sign = crypto.createHash(`sha512`).update(`${password}${user.salt}`).digest(`hex`);
  if (sign !== user.pwd)
    throw new ForbiddenException(`Invalid password`);

  delete user["pwd"];
  delete user["salt"];
  
  return user;
}

export async function updatePassword(id: string, pwd: string): Promise<void> {
  const salt = crypto.randomBytes(Math.ceil(45/2)).toString(`hex`).slice(0, 45);
  const sign = crypto.createHash(`sha512`).update(`${pwd}${salt}`).digest(`hex`);

  await usersDAO.update(db.pool(), { id, pwd: sign, salt });
}

export default {
  auth: {
    login
  },
  users: {
    updatePassword
  }
};