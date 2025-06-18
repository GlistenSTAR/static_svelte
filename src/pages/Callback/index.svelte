<script>
  import { onMount } from 'svelte';
  import { Button } from 'svelte-spectre';

  let access_token;

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    access_token = params.get('access_token');

    if (access_token) {
      localStorage.setItem('access_token', access_token);

      window.location.href = '/';
    } else {
      console.error('Access token not found in the URL');
    }
  });
</script>

<h1>Authenticating... <Button loading variant="link"></Button></h1>

<style>
  h1 {
    text-align: center;
  }
</style>
