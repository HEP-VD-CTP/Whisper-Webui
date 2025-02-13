import { whisperStore } from 'stores/WhisperStore';

const store = whisperStore();

export type GQLQueryResponse = {
  headers: Record<string, string>;
  status: number;
  data: any;
  errors: any;
}

async function gql(query: string, body: Record<string, any>): Promise<GQLQueryResponse> {
  const response = await fetch(`https://${store.getDomain()}/api/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: query.trim(),
      variables: body
    })
  });
   
  // get the headers
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => headers[key] = value);

  // parse the response body
  const responseBody = await response.json();

  return {
    headers: headers,
    status: response.status,
    data: responseBody.data,
    errors: responseBody.errors 
  };
}

export default {
  gql
} 