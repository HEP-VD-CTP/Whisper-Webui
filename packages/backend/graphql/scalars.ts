import { GraphQLScalarType } from "graphql";

function validateUID(value: any) {
  const len: number = 24;
  if (typeof value !== 'string' || value.length !== len) 
    throw new TypeError(`Value is not a ${len} long string: ${value}`);

  for (let i = 0; i < len; i++) {
    const charCode = value.charCodeAt(i);
    if (!(charCode >= 48 && charCode <= 57) && !(charCode >= 65 && charCode <= 70)) 
      throw new TypeError(`Value must be ${len} long hex uppercase string: ${value}`);
  }
    
  return value; 
}

export const UID = new GraphQLScalarType({
  name: 'UID',
  description: 'A 24 character long hexadecimal string in uppercase',
  serialize: validateUID, 
  parseValue: validateUID, 
  parseLiteral(ast) {
    if (ast.kind !== 'StringValue') 
      throw new TypeError(`Value is not a string: ${ast}`);
    
    return validateUID(ast.value);
  }
})

