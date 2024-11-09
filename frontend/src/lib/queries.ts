import { GraphQLClient, gql } from 'graphql-request';

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
`;
