// Welcome to Keystone!
//
// This file is what Keystone uses as the entry-point to your headless backend
//
// Keystone imports the default export of this file, expecting a Keystone configuration object
//   you can find out more at https://keystonejs.com/docs/apis/config

import { config, graphql } from '@keystone-6/core'

// to keep this file tidy, we define our schema in a different file
import { lists } from './schema'

// authentication is configured separately here too, but you might move this elsewhere
// when you write your list-level access control functions, as they typically rely on session data
import { withAuth, session } from './auth'

import { Context } from ".keystone/types";
import { hello } from 'common';

const GraphQLHelper = {
  String: () => graphql.arg({ type: graphql.nonNull(graphql.String) }),
};

export const AddUserToTripInput = graphql.inputObject({
  name: "AddUserToTripInput",
  fields: {
    userId: GraphQLHelper.String(),
  },
});

export interface AddUserToTripResult {
  message: string;
}

export const AddUserToTripResult = graphql.object<AddUserToTripResult>()({
  name: "AddUserToTripResult",
  fields: {
    message: graphql.field({
      type: graphql.String,
      resolve({ message }, args, context: Context) {
        return message;
      },
    }),
  },
});


export default withAuth(
  config({
    db: {
      // we're using sqlite for the fastest startup experience
      //   for more information on what database might be appropriate for you
      //   see https://keystonejs.com/docs/guides/choosing-a-database#title
      provider: 'sqlite',
      url: 'file:./keystone.db',
    },
    server: {
      cors: { origin: ['http://localhost:3001'], credentials: true },
    },
    lists,
    session,
    graphql: {
      extendGraphqlSchema: graphql.extend((base) => ([Plugin(base)]))
    },
  })
)

function Plugin(base: graphql.BaseSchemaMeta) {
  return {
    mutation: {
      addUserToTrip: graphql.field({
        type: AddUserToTripResult,
        args: {
          data: graphql.arg({ type: graphql.nonNull(AddUserToTripInput) }),
        },
        resolve: async (source, { data: { userId } }, context: Context) => {
          return { message: hello() + ' ' + userId };
        },
      }),
    }
  };
}
