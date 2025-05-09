// src/graphql/queries/getUsers.ts
import { gql } from '@apollo/client/core';

export const GET_USERS = gql`
  query GetUsers {
    users {
      data {
        id
        name
        email
      }
    }
  }
`;
