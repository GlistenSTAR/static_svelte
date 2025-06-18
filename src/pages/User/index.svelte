<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { Button, Input, Select, FormGroup, Card } from 'svelte-spectre';

  import { login_user, all_user, roles } from '../../store';
  import {
    get_users,
    add_user,
    update_user,
    delete_user,
  } from '../../lib/services/user';
  import { get_roles } from '../../lib/services/role';
  import Loading from '../../components/loading.svelte';

  let editingUser = null;
  let addingUser = false;
  let newUser = { first_name: '', last_name: '', password: '', role_id: 1 };
  let loading = true;

  onMount(async () => {
    if ($login_user) {
      if (
        !$login_user.role ||
        !$login_user.role.permissions.includes('user_mng')
      ) {
        window.location.href = '/login';
        return;
      }

      await get_roles();
      await get_users();
      loading = false;
    }
  });

  const deleteUser = (id) => {
    const confirmed = confirm('Are you sure you want to delete this user?');
    if (confirmed) delete_user(id);
  };

  const startEditing = (user) => {
    editingUser = { ...user };
  };

  const cancelEditing = () => {
    editingUser = null;
  };

  const saveUser = () => {
    update_user(editingUser);
    editingUser = null;
  };

  const startAdding = () => {
    addingUser = true;
  };

  const cancelAdding = () => {
    addingUser = false;
    newUser = { first_name: '', last_name: '', password: '', role_id: 1 };
  };

  const addUser = () => {
    add_user(newUser);
    cancelAdding();
  };

  const getRoleName = (roles, roleId) => {
    const role = roles.find((r) => r.role_id === roleId);
    return role ? role.label : 'Unknown';
  };
</script>

{#if loading}
  <Loading />
{:else}
  <div class="container">
    <h1 class="text-center">User List</h1>
    <div class="btn-group my-2">
      <Button type="button" variant="success" on:click={startAdding}>Add</Button
      >
    </div>

    {#if addingUser}
      <Card class="my-2">
        <form on:submit|preventDefault={addUser}>
          <FormGroup label="First Name">
            <Input
              type="text"
              bind:value={newUser.first_name}
              required
              placeholder="Enter first name"
            />
          </FormGroup>
          <FormGroup label="Last Name">
            <Input
              type="text"
              bind:value={newUser.last_name}
              placeholder="Enter last name"
            />
          </FormGroup>
          <FormGroup label="Password">
            <Input
              type="password"
              bind:value={newUser.password}
              required
              placeholder="Enter password"
            />
          </FormGroup>
          <FormGroup label="Role">
            <Select
              options={$roles.map((role) => ({
                value: role.role_id,
                label: role.label,
              }))}
              bind:value={newUser.role_id}
              size="md"
            />
          </FormGroup>
          <div class="btn-group">
            <Button type="submit" variant="success">Add</Button>
            <Button type="button" on:click={cancelAdding} variant="error"
              >Cancel</Button
            >
          </div>
        </form>
      </Card>
    {/if}

    <table class="table table-striped table-hover mt-5">
      <thead>
        <tr>
          <th>#</th>
          <th>First Name</th>
          <th>Last Name</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $all_user as user, index (user.user_id)}
          <tr>
            {#if editingUser && editingUser.user_id === user.user_id}
              <td colspan="5">
                <form on:submit|preventDefault={saveUser} class="form-inline">
                  <FormGroup label="First Name">
                    <Input
                      type="text"
                      bind:value={editingUser.first_name}
                      required
                    />
                  </FormGroup>
                  <FormGroup label="Last Name">
                    <Input type="text" bind:value={editingUser.last_name} />
                  </FormGroup>
                  <FormGroup label="Role">
                    <Select
                      options={$roles.map((role) => ({
                        value: role.role_id,
                        label: role.label,
                      }))}
                      bind:value={editingUser.role_id}
                      size="md"
                    />
                  </FormGroup>
                  <div class="btn-group">
                    <Button type="submit" variant="success">Save</Button>
                    <Button
                      type="button"
                      on:click={cancelEditing}
                      variant="error">Cancel</Button
                    >
                  </div>
                </form>
              </td>
            {:else}
              <td>{index + 1}</td>
              <td>{user.first_name}</td>
              <td>{user.last_name}</td>
              <td>{getRoleName($roles, user.role_id)}</td>
              <td>
                <div class="btn-group actions">
                  <Button
                    type="button"
                    on:click={() => startEditing(user)}
                    variant="success">Edit</Button
                  >
                  <Button
                    type="button"
                    on:click={() => deleteUser(user.user_id)}
                    variant="error">Delete</Button
                  >
                </div>
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .container {
    padding: 20px;
    max-width: 900px;
    margin: 0 auto;
  }

  .btn-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .btn-group.actions {
    justify-content: center;
  }
</style>
