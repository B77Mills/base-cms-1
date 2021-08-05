/* eslint-disable no-underscore-dangle */
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const { log } = console;
const {
  GRAPHQL_URI,
  TENANT_KEY,
} = process.env;

// @see https://www.apollographql.com/docs/react/advanced/fragments.html

fetch(GRAPHQL_URI, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-tenant-key': TENANT_KEY,
  },
  body: JSON.stringify({
    query: `
      {
        __schema {
          types {
            kind
            name
            possibleTypes {
              name
            }
          }
        }
      }
    `,
  }),
}).then(result => result.json()).then((result) => {
  // here we're filtering out any type information unrelated to unions or interfaces
  const filteredData = result.data.__schema.types.filter(
    type => type.possibleTypes !== null,
  );
  // eslint-disable-next-line no-param-reassign
  result.data.__schema.types = filteredData;
  fs.writeFile(path.join(__dirname, 'types.json'), JSON.stringify(result.data, null, 2), (err) => {
    if (err) log('Error writing fragmentTypes file', err);
    log('Fragment types successfully extracted!');
  });
});
