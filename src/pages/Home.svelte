<script>
  import { onMount } from 'svelte';
  import { toast } from 'svelte-spectre';
  import { login_user } from '../store';

  onMount(async () => {
    if ($login_user.user_id) {
      toast.send({
        type: 'primary',
        msg: 'Login successful',
        pos: 'bottom_center',
        timeout: 3000,
        icon: 'check',
      });
    }
  });
</script>

<div class="welcome_text">
  <h1>Welcome to ESDD Platform</h1>
</div>

<style>
  .welcome_text {
    display: flex;
    justify-content: center;
    height: 80vh;
    align-items: center;
  }
</style>
