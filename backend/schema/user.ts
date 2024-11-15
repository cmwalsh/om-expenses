import { type Lists } from '.keystone/types';
import { list } from "@keystone-6/core";
import { password, relationship, text, timestamp } from "@keystone-6/core/fields";
import { UserCreateSchema } from "common";
import * as v from 'valibot';
import { IsNotNull, MustBeLoggedIn } from "./common";

export const User = list({
  access: {
    operation: {
      query: MustBeLoggedIn,
      create: MustBeLoggedIn,
      update: MustBeLoggedIn,
      delete: MustBeLoggedIn,
    }
  },

  hooks: {
    validate: {
      create: ({ inputData, addValidationError }) => {
        const result = v.safeParse(UserCreateSchema, inputData);
        const message = result.issues?.map(i => i.message).join(' | ');
        if (message) addValidationError(message);
      }
    }
  },

  // this is the fields for our User list
  fields: {
    // by adding isRequired, we enforce that every User should have a name
    //   if no name is provided, an error will be displayed
    name: text({ validation: { isRequired: true }, graphql: { isNonNull: IsNotNull } }),

    email: text({
      validation: { isRequired: true },
      // by adding isIndexed: 'unique', we're saying that no user can have the same
      // email as another user - this may or may not be a good idea for your project
      isIndexed: 'unique',
      graphql: { isNonNull: IsNotNull },
    }),

    password: password({ validation: { isRequired: true } }),

    // we can use this field to see what Posts this User has authored
    //   more on that in the Post list below
    posts: relationship({ ref: 'Post.author', many: true }),

    createdAt: timestamp({
      // this sets the timestamp to Date.now() when the user is first created
      defaultValue: { kind: 'now' },
    }),
  },
}) satisfies Lists['User'];
