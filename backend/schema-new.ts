import { config, list } from "@keystone-6/core";
import { allowAll } from "@keystone-6/core/access";
import { relationship, text } from "@keystone-6/core/fields";

const lists = {
  User: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      email: text({ validation: { isRequired: true }, isIndexed: 'unique' }),
      trips: relationship({ ref: 'Trip.participants', many: true })
    }
  }),
  Trip: list({
    access: allowAll,
    fields: {
      name: text({ validation: { isRequired: true } }),
      location: text({ validation: { isRequired: true } }),
      participants: relationship({ ref: 'User.trips', many: true})
    }
  })
};

export default config({
  db: {
    provider: 'sqlite',
    url: 'file:./keystone.db'
  },
  lists
});