import { useNavigate, type RouteSectionProps } from "@solidjs/router";
import * as v from 'valibot';
import { MagicBrowser } from "~/components";
import { AppService, FetchParameters } from "~/lib";

const UserTableSchema = v.object({
  email: v.pipe(v.string(), v.description('Email Address')),
  name: v.pipe(v.string(), v.minLength(2), v.description('Name')),
});

export default function Users(props: RouteSectionProps) {
  const navigate = useNavigate();

  if (!AppService.get().getCurrentUser()) {
    console.log('Not logged in');
    return navigate('/login');
  }

  const onFetch = async (params: FetchParameters) => {
    return AppService.get().api.searchUsers(params);
  };

  return (
    <main>
      <h3>Users</h3>

      <MagicBrowser
        schema={UserTableSchema}
        rowActions={[{ name: 'Edit', onClick: (e) => navigate(`/users/${e.id}`) }]}
        onFetch={onFetch}
      />

      <div class="d-grid gap-2 justify-content-md-end">

        <a class="btn btn-primary" href="/users/new">
          New
        </a>

      </div>
    </main>
  );
}
