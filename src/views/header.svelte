<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Navbar, Icon, Dropdown } from 'svelte-spectre';
  import { login_user } from '../store';
  import { set_login_user, logout_user } from '$lib/services/user';
  import { page } from '$app/stores';

  let username = '';
  let active = false;

  onMount(async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      if (!$login_user.user_id) {
        await set_login_user(token);
      } else {
        username = $login_user.first_name + ' ' + $login_user.last_name;
      }
    }
  });

  const logout = async () => {
    localStorage.removeItem('access_token');
    logout_user();
    await goto('/');
  };
</script>

<Navbar>
  <div slot="left" class="navbar-left">
    <h1 class="navbar-brand">
      <a href="/">ESDD</a>
    </h1>
  </div>
  <div slot="right" class="navbar-right">
    <ul class="navbar-menu">
      {#if $login_user.user_id}
        <!-- <li class:active={$page.url.pathname === '/form_generator'}>
					<a href="/form_generator" class="button button--primary">Form Generator</a>
				</li> -->
        {#if $login_user.role && $login_user.role.permissions.includes('schema_mng')}
          <li class:active={$page.url.pathname === '/schema'} class="mb-3">
            <a href="/schema" class="button button--primary">Schemas</a>
          </li>
        {/if}
        <!-- <li class:active={$page.url.pathname === '/article'} class="mb-3">
					<a href="/article" class="button button--primary">Articles</a>
				</li> -->
        <li class:active={$page.url.pathname === '/task'} class="mb-3">
          <a href="/task" class="button button--primary">Tasks</a>
        </li>
        {#if $login_user.role && $login_user.role.permissions.includes('user_mng')}
          <li class:active={$page.url.pathname === '/users'} class="mb-3">
            <a href="/users" class="button button--primary">Users</a>
          </li>
          <li class:active={$page.url.pathname === '/roles'} class="mb-3">
            <a href="/roles" class="button button--primary">Roles</a>
          </li>
        {/if}
        {#if $login_user.role && $login_user.role.permissions.includes('permission_mng')}
          <li class:active={$page.url.pathname === '/permissions'} class="mb-3">
            <a href="/permissions" class="button button--primary">Permissions</a
            >
          </li>
        {/if}
        <li class="user">
          <Dropdown bind:active align="right">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="flex align-items-center mb-3"
              on:click={() => (active = !active)}
            >
              <span class="text-success link">
                <Icon icon="people" size="2x" color="success" />
                {username}
              </span>
            </div>
            <ul slot="content" class="m-1 pl-3 list">
              <li>
                <a href="/account" class="button button--primary">My account</a>
              </li>
              <li>
                <!-- svelte-ignore a11y_invalid_attribute -->
                <a
                  href="#"
                  class="button button--primary"
                  on:click|preventDefault={logout}>Logout</a
                >
              </li>
            </ul>
          </Dropdown>
        </li>
      {:else}
        <li>
          <a href="/login" class="button button--primary">Login</a>
        </li>
      {/if}
    </ul>
  </div>
</Navbar>

<style lang="scss">
  div[slot='left'] {
    margin-left: 40px;
    margin-top: 10px;

    h1 {
      font-weight: 900;
      cursor: pointer;

      a {
        text-decoration: none !important;
      }
    }
  }

  div[slot='right'] {
    margin-right: 40px;

    .navbar-menu {
      display: flex;
      gap: 20px;
      align-items: center;

      li {
        list-style: none;

        a {
          text-decoration: none;
          font-size: 17px;
        }

        span {
          font-size: 16px;
          margin-left: 8px;
          cursor: default;
        }
      }
      li.user {
        font-size: 22px;
        margin-left: 10px;
        display: flex;
      }
    }
  }

  li.active {
    text-decoration: #807fe2 underline 2px;
    text-underline-offset: 8px;
  }

  ul.list li:hover {
    a {
      color: #32b643;
    }
  }

  span.link {
    cursor: pointer !important;
  }
</style>
