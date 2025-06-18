<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { Icon, toast } from 'svelte-spectre';

  import { login_user } from '../../store';
  import Github from '../../assets/imgs/github.svg';
  import MPDS from '../../assets/imgs/mpds.svg';

  import { auth_github, auth_mpds } from '../../lib/services/auth';
  import Loading from '../../components/loading.svelte';

  onMount(() => {
    if ($login_user.user_id) {
      window.location.href = '/';
    } else {
      toast.send({
        type: 'primary',
        msg: 'Please log in',
        timeout: 3000,
        pos: 'bottom_center',
        icon: 'forward',
      });
    }
  });

  const login_github = () => {
    auth_github();
  };

  const login_mpds = () => {
    auth_mpds();
  };
</script>

<div class="login_provider">
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="provider github_login"
    on:click={() => {
      login_github();
    }}
  >
    <Icon size="4x" color="primary">
      <Github color="error" />
    </Icon>
    Github
  </div>
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="provider mpds_login"
    on:click={() => {
      login_mpds();
    }}
  >
    <Icon size="4x" color="primary">
      <MPDS color="error" />
    </Icon>
    MPDS
  </div>
</div>

<style>
  .login_provider {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .login_provider .provider {
    margin: 1rem;
    transition: transform 0.3s ease-in-out;
    width: 250px;
    height: 300px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 32px;
    cursor: pointer;
  }
  .login_provider .provider:hover {
    transform: scale(1.1);
  }
</style>
