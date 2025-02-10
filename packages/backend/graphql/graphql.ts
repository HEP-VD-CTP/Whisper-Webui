import fs from 'node:fs';

export const schema = fs.readFileSync('graphql/schema.graphql', 'utf-8');

export function getFields(info: any): Array<string> {
  const fields = [];
  for (const field of info.fieldNodes[0].selectionSet.selections) 
    fields.push(field.name.value);
  return fields;
}