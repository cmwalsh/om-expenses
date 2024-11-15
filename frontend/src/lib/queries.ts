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

  query SearchUsers($take: Int!, $skip: Int!, $search: String!, $orderBy: [UserOrderByInput!]!) {
    usersCount

    usersFilteredCount: usersCount(where: { OR: [{ name: { contains: $search } }] })

    users(
      take: $take,
      skip: $skip,
      orderBy: $orderBy,
      where: { OR: [{ name: { contains: $search } }] }
    ) {
      id
      name
      email
    }
  }

  query GetUser($id: ID!) {
    user(where: { id: $id }) {
      id
      name
      email
    }
  }

  mutation CreateUser($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      name
      email
    }
  }

  mutation UpdateUser($where: UserWhereUniqueInput!, $data: UserUpdateInput!) {
    updateUser(where: $where, data: $data) {
      id
      name
      email
    }
  }

  mutation DeleteUser($id: ID!) {
    deleteUser(where: { id: $id }) {
      id
    }
  }
`;
