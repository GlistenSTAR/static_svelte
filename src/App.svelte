<script>
  import { onMount } from 'svelte';
  import { Spectre, Toaster } from 'svelte-spectre';
  import { login_user } from './store';
  import { set_login_user } from './lib/services/user';

  import Router from './Router.svelte';
  import Footer from './views/footer.svelte';
  import Header from './views/header.svelte';
  import Loading from './components/loading.svelte';

  import './global.css';

  let loading = true;

  onMount(async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      if (!$login_user.user_id) {
        await set_login_user(token);
      }
    }
    loading = false;
  });
</script>

<Spectre>
  {#if loading}
    <Loading />
  {:else}
    <main>
      <Header />
      <div class="router">
        <Router />
      </div>
      <Footer />
    </main>
  {/if}
  <Toaster />
</Spectre>
