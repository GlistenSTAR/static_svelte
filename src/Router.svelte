<script>
  import { path } from 'svelte-pathfinder';
  import { onMount } from 'svelte';

  import { routes } from './router';

  import Article from './pages/Article/index.svelte';
  import Callback from './pages/Callback/index.svelte';
  import FormGenerator from './pages/FormGenerator/index.svelte';
  import Login from './pages/Auth/Login.svelte';
  import Permissions from './pages/Permission/index.svelte';
  import Roles from './pages/Role/index.svelte';
  import Schema from './pages/Schema/index.svelte';
  import Tasks from './pages/Task/index.svelte';
  import Users from './pages/User/index.svelte';
  import Home from './pages/Home.svelte';

  let Component = null;
  let params = {};

  function updateRoute() {
    const matched = routes.find((route) => route.pattern.match(path));

    if (matched) {
      const result = matched.pattern.match(path);
      Component = {
        home: Home,
        article: Article,
        callback: Callback,
        form_generator: FormGenerator,
        login: Login,
        permissions: Permissions,
        roles: Roles,
        schema: Schema,
        tasks: Tasks,
        users: Users,
      }[matched.name];
      params = result.params;
    } else {
      Component = null;
    }
  }

  const handlePopState = () => updateRoute();

  onMount(() => {
    updateRoute();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  });

  function goto(path) {
    history.pushState({}, '', path);
    updateRoute();
  }

  export { goto };
</script>

{#if Component}
  <svelte:component this={Component} {...params} />
{:else}
  <h1>404 - Not Found</h1>
{/if}
