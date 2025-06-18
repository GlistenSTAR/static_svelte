<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { Button, Input } from 'svelte-spectre';

  import { login_user, roles, permissions } from '../../store';
  import {
    get_roles,
    add_role,
    update_role,
    delete_role,
  } from '../../lib/services/role';
  import { get_permissions } from '../../lib/services/permission';
  import Loading from '../../components/loading.svelte';

  let editingRole = null;
  let addingRole = false;
  let newRole = { slug: '', label: '', permissions: [] };
  let loading = true;

  onMount(async () => {
    if ($login_user) {
      if (
        !$login_user.role ||
        !$login_user.role.permissions.includes('role_mng')
      ) {
        window.location.href = '/login';
        return;
      }

      await get_permissions();
      await get_roles();
      loading = false;
    }
  });

  const deleteRole = async (id) => {
    const confirmed = confirm('Are you sure you want to delete this role?');
    if (confirmed) {
      await delete_role(id);
      await get_roles();
    }
  };

  const startEditing = (role) => {
    editingRole = {
      ...role,
      permissions: role.permissions.map(
        (permission) => permission.permission_id
      ),
    };
  };

  const cancelEditing = () => {
    editingRole = null;
  };

  const saveRole = async () => {
    await update_role(editingRole);
    editingRole = null;
  };

  const startAdding = () => {
    addingRole = true;
  };

  const cancelAdding = () => {
    addingRole = false;
    newRole = { slug: '', label: '', permissions: [] };
  };

  const addRole = async () => {
    await add_role(newRole);
    cancelAdding();
  };

  const togglePermission = (role, permission) => {
    const index = role.permissions.indexOf(permission);
    if (index > -1) {
      role.permissions.splice(index, 1);
    } else {
      role.permissions.push(permission);
    }
  };
</script>

{#if loading}
  <Loading />
{:else}
  <div class="role_page">
    <h1>Role List</h1>
    <div class="btn-group mb-5">
      <Button variant="success" on:click={startAdding}>Add</Button>
    </div>

    {#if addingRole}
      <form on:submit|preventDefault={addRole}>
        <div class="add-form">
          <Input
            type="text"
            label="Slug"
            bind:value={newRole.slug}
            placeholder="Enter slug"
            required
          />
          <Input
            type="text"
            label="Label"
            bind:value={newRole.label}
            placeholder="Enter label"
            required
          />
          <div>
            <b>Permissions:</b>
            {#each $permissions as permission (permission.permission_id)}
              <label for={'add_' + permission.slug}>
                <input
                  type="checkbox"
                  id={'add_' + permission.slug}
                  on:change={() =>
                    togglePermission(newRole, permission.permission_id)}
                />
                {permission.label}
              </label>
            {/each}
          </div>
          <div class="btn-group mb-5">
            <Button type="submit" variant="success">Add</Button>
            <Button type="button" on:click={cancelAdding} variant="error"
              >Cancel</Button
            >
          </div>
        </div>
      </form>
    {/if}

    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <th>Slug</th>
          <th>Label</th>
          <th>Permissions</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $roles as role, i}
          <tr>
            {#if editingRole && editingRole.role_id === role.role_id}
              <td colspan="5">
                <form on:submit|preventDefault={saveRole}>
                  <div class="edit-form">
                    <Input
                      type="text"
                      label="Slug"
                      bind:value={editingRole.slug}
                      placeholder="Edit slug"
                      required
                    />
                    <Input
                      type="text"
                      label="Label"
                      bind:value={editingRole.label}
                      placeholder="Edit label"
                      required
                    />
                    <div>
                      <b>Permissions:</b>
                      {#each $permissions as permission (permission.permission_id)}
                        <label for={'edit_' + permission.slug}>
                          <input
                            type="checkbox"
                            id={'edit_' + permission.slug}
                            checked={role.permissions.some(
                              (item) =>
                                item.permission_id === permission.permission_id
                            )}
                            on:change={() =>
                              togglePermission(
                                editingRole,
                                permission.permission_id
                              )}
                          />
                          {permission.label}
                        </label>
                      {/each}
                    </div>
                    <div class="btn-group">
                      <Button type="submit" variant="success">Save</Button>
                      <Button
                        type="button"
                        on:click={cancelEditing}
                        variant="error">Cancel</Button
                      >
                    </div>
                  </div>
                </form>
              </td>
            {:else}
              <td>{i + 1}</td>
              <td>{role.slug}</td>
              <td>{role.label}</td>
              <td>
                {#each $permissions as permission (permission.permission_id)}
                  <label>
                    <input
                      type="checkbox"
                      checked={role.permissions.some(
                        (item) =>
                          item.permission_id === permission.permission_id
                      )}
                      disabled
                    />
                    {permission.label}
                  </label>
                {/each}
              </td>
              <td>
                <div class="btn-group action">
                  <Button
                    type="button"
                    on:click={() => startEditing(role)}
                    variant="success">Edit</Button
                  >
                  <Button
                    type="button"
                    on:click={() => deleteRole(role.role_id)}
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
  label {
    cursor: pointer;
    user-select: none;
  }

  .role_page {
    padding: 20px;
  }

  .btn-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }
  .btn-group.action {
    justify-content: center;
  }

  h1 {
    text-align: center;
  }

  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .add-form {
    display: flex;
    margin-top: 20px;
    flex-direction: column;
    gap: 10px;
  }
</style>
