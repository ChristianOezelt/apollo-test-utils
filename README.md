# apollo-test-utils

[![Greenkeeper badge](https://badges.greenkeeper.io/apollographql/apollo-test-utils.svg)](https://greenkeeper.io/)

This is a very rudimentary package that currently only exports functions for mocking an Apollo Client network interface.

## Installation
npm
```
npm install --save-dev apollo-test-utils
```
yarn
```
yarn add --dev apollo-test-utils
```

## Usage

### simple mocked NetworkInterface

```js
import ApolloClient from 'apollo-client';
import gql from 'graphql-tag';
import { mockNetworkInterface } from 'apollo-test-utils';

const mockedResponse = {
  request: {
    query: gql`<put your query here>`,
    variables: {
      // query variables
    },
  },
  result: [/* expected result */],
};
// mockNetworkInterface takes n mockedResponses as arguments or an array of those
const mockedNetworkInterface = mockNetworkInterface( mockedResponse );
const client = new ApolloClient({
    networkInterface: mockedNetworkInterface,
});

client.query({ /* ... */ });

```

### Mock NetworkInterface with schema

```js
  import ApolloClient from 'apollo-client';
  import gql from 'graphql-tag';
  import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
  import { mockNetworkInterfaceWithSchema } from 'apollo-test-utils';

  const typeDefs = `
      type User {
        id: Int
        name: String
      }

      type Query {
        user: User
      }
    `;

  const schema = makeExecutableSchema({ typeDefs });
  addMockFunctionsToSchema({ schema });

  const mockNetworkInterface = mockNetworkInterfaceWithSchema({ schema });

  const client = new ApolloClient({
    networkInterface: mockNetworkInterface,
  });

  client.query({
  });

```

## Issues

### Error: "No more mocked responses for the query ..." even though you provided the correct mocked response
This is most likely due to ApolloClient adding ```__typename``` to your query.
You can use the ```addTypeName``` flag in your MockedResponses to also add these names to the query:

```js
...
const mockedResponse = {
  request: {
    query: gql`<put your query here>`,
    variables: {
      // query variables
    },
    addTypeName: true, // __typenames will now be added to your query
  },
  result: [/* expected result */],
};
...
```
You could use ```addTypenameToDocument```, from apollo-client, on your query to achieve the same effect.
