import { gql } from 'graphql-request';

gql`
  query GetUsers { 
    users {
      id
      name
      email
    }
  }

  query GetPosts { 
    posts {
      id
      title
    }
  }

  mutation AuthenticateUserWithPassword($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      ... on UserAuthenticationWithPasswordSuccess {
        sessionToken
        item {
          id
          name
          email
        }
      }
      ... on UserAuthenticationWithPasswordFailure {
        message
      }
    }
  }
`;
