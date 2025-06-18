<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { Button, Input } from 'svelte-spectre';

  import { permissions, login_user } from '../../store';
  import { get_permissions, update_permission } from '$lib/services/permission';
  import Loading from '../../components/loading.svelte';

  let editingPermission = null;
  // let addingPermission = false;
  let loading = true;

  onMount(async () => {
    if ($login_user) {
      if (
        !$login_user.role ||
        !$login_user.role.permissions.includes('permission_mng')
      ) {
        await goto('/login');
        return;
      }
      await get_permissions();
      loading = false;
    }
  });

  // const deletePermission = async(id) => {
  // 	await delete_permission(id);
  // 	await get_permissions();
  // }

  const startEditing = async (permission) => {
    editingPermission = { ...permission };
  };

  const cancelEditing = async () => {
    editingPermission = null;
  };

  const savePermission = async () => {
    await update_permission(editingPermission);
    editingPermission = null;
  };

  // const startAdding = () => {
  // 	addingPermission = true;
  // }

  // const cancelAdding = () => {
  // 	addingPermission = false;
  // 	newPermission = { label: '' };
  // }

  // const addPermission = async () => {
  // 	await add_permission(newPermission);
  // 	cancelAdding();
  // }
</script>

{#if loading}
  <Loading />
{:else}
  <div class="permission_page">
    <h1>Permission List</h1>
    <!-- <div class="btn-group mb-5">
			<Button variant="success" on:click={startAdding}>Add Permission</Button>
		</div> -->

    <!-- {#if addingPermission}
			<form on:submit|preventDefault={addPermission}>
				<div class="add-form">
					<Input
						type="text"
						label="Slug"
						bind:value={newPermission.slug}
						placeholder="Enter slug"
						required
					/>
					<Input
						type="text"
						label="Label"
						bind:value={newPermission.label}
						placeholder="Enter label"
						required
					/>
					<div class="btn-group mb-5">
						<Button type="submit" variant="success">Add</Button>
						<Button type="button" on:click={cancelAdding} variant="error">Cancel</Button>
					</div>
				</div>
			</form>
		{/if} -->

    <table class="table">
      <thead>
        <tr>
          <th>#</th>
          <!-- <th>Slug</th> -->
          <th>Label</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each $permissions as permission, i}
          <tr>
            {#if editingPermission && editingPermission.permission_id === permission.permission_id}
              <td colspan="5">
                <form on:submit|preventDefault={savePermission}>
                  <div class="edit-form">
                    <!-- <Input
											type="text"
											label="Slug"
											bind:value={editingPermission.slug}
											placeholder="Edit slug"
											required
										/> -->
                    <Input
                      type="text"
                      label="Label"
                      bind:value={editingPermission.label}
                      placeholder="Edit label"
                      required
                    />
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
              <!-- <td>{permission.slug}</td> -->
              <td>{permission.label}</td>
              <td>
                <div class="btn-group action">
                  <Button
                    type="button"
                    on:click={() => startEditing(permission)}
                    variant="success"
                  >
                    Edit
                  </Button>
                  <!-- <Button
										type="button"
										on:click={() => deletePermission(permission.permission_id)}
										variant="error"
									>
										Delete
									</Button> -->
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
  .permission_page {
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
</style>
