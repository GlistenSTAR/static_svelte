<script>
  import { onMount } from 'svelte';
  import {
    Button,
    Modal,
    Form,
    FormGroup,
    Input,
    Card,
    Chip,
    Select,
    Checkbox,
    Pagination,
    Avatar,
  } from 'svelte-spectre';

  import { get_limited_users } from '../../lib/services/user';
  import {
    get_tasks,
    add_task,
    start_task,
    delete_task,
    finalize_task,
    assign_task,
    approve_task,
    reject_task,
  } from '../../lib/services/task';
  import { search_schemas } from '../../lib/services/schemas';
  import { search_articles } from '../../lib/services/article';
  import { login_user, tasks, all_user, pagination, schema } from '../../store';
  import Loading from '../../components/loading.svelte';
  import AutoComplete from '../../components/AutoComplete.svelte';

  import truncate from '../../utils/truncate';

  let showAddModal = false;
  let newTask = {
    title: '',
    description: '',
    article_id: null,
    assigned_to: 0,
    schema_id: null,
    assign_task: false,
  };

  let error = {
    title: '',
    description: '',
    article_id: '',
    schema_id: '',
    assigned_to: '',
  };

  let articleSuggestions = [];

  let schemaSuggestions = [];

  let selectedArticle = {};

  let selectedSchema = {};

  let schemaInputValue = '';
  let articleInputValue = '';

  let loading = true;
  let semiLoading = true;
  let page = 1;
  let per_page = 100;

  onMount(async () => {
    if ($login_user) {
      await get_limited_users();

      if ($schema.schema_id) {
        selectedSchema = {
          id: $schema.schema_id,
          label: $schema.table_name,
          value: $schema.table_name,
        };
        showAddModal = true;
        schema.set({});
      }
    }
  });

  const get_newData = async (page, per_page) => {
    semiLoading = true;
    await get_tasks(page, per_page);
    loading = false;
    semiLoading = false;
  };

  $: {
    get_newData(page, per_page);
  }

  $: if (selectedArticle) {
    newTask.article_id = selectedArticle.id;
  }

  $: if (selectedSchema) {
    newTask.schema_id = selectedSchema.id;
  }

  const initialState = () => {
    newTask = {
      title: '',
      description: '',
      article_id: null,
      schema_id: null,
      assigned_to: 0,
      assign_task: false,
    };

    schemaInputValue = '';
    articleInputValue = '';
    selectedArticle = {};
    selectedSchema = {};
  };

  const initialError = () => {
    error = {
      title: '',
      description: '',
      article_id: '',
      schema_id: '',
      assigned_to: '',
    };
  };

  const validateInput = (data) => {
    let valid = true;
    initialError();

    if (!data.title.trim()) {
      error.title = 'Please enter a title';
      valid = false;
    }

    if (!data.description.trim()) {
      error.description = 'Please enter a description';
      valid = false;
    }

    if (!data.article_id) {
      error.article_id = 'Please select an article';
      valid = false;
    }

    if (!data.schema_id) {
      error.schema_id = 'Please select a schema';
      valid = false;
    }

    if (data.assign_task) {
      if (!data.assigned_to) {
        error.assigned_to = 'Please select an assignee';
        valid = false;
      }
    }

    return valid;
  };

  const handleAddTask = async () => {
    if (validateInput(newTask)) {
      await add_task(newTask);
      initialState();
      showAddModal = false;

      await get_tasks(page, per_page);
    }
  };

  const handleStartTask = async (taskId) => {
    await start_task(taskId);
    await get_tasks(page, per_page);
  };

  const handleDeleteTask = async (taskId) => {
    const confirmed = confirm('Are you sure you want to delete this task?');
    if (confirmed) {
      await delete_task(taskId);
      await get_tasks(page, per_page);
    }
  };

  const handleFinalizeTask = async (taskId) => {
    await finalize_task(taskId);
    await get_tasks(page, per_page);
  };

  const handleAssignTask = async (taskId) => {
    await assign_task(taskId, $login_user.user_id);
    await get_tasks(page, per_page);
  };

  const handleApproveTask = async (taskId) => {
    await approve_task(taskId);
    await get_tasks(page, per_page);
  };

  const handleRejectTask = async (taskId) => {
    await reject_task(taskId);
    await get_tasks(page, per_page);
  };

  const selectUserToAssign = async (event, taskId) => {
    await assign_task(taskId, event.target.value);
    await get_tasks(page, per_page);
  };

  const getUserNameChars = (user) => {
    return (
      user.first_name[0] +
      ' ' +
      (user.last_name ? user.last_name[0] : user.first_name[1])
    );
  };

  const updateArticleSuggestions = async (value) => {
    if (value.length >= 3) {
      let suggestionResult = await search_articles(value);
      articleSuggestions = await suggestionResult.map((article) => {
        return {
          id: article.article_id,
          label: article.title,
          value: article.title,
        };
      });
    }
  };

  const updateSchemaSuggestions = async (value) => {
    if (value.length > 2) {
      let suggestionResult = await search_schemas(value);
      schemaSuggestions = await suggestionResult.map((schema) => {
        return {
          id: schema.schema_id,
          label: schema.table_name,
          value: schema.table_name,
        };
      });
    }
  };
</script>

{#if loading}
  <Loading />
{:else}
  <div class="task_page">
    <h1>Task Management</h1>

    {#if $login_user.role && $login_user.role.permissions.includes('task_mng')}
      <div class="btn-group mb-5">
        <Button variant="success" on:click={() => (showAddModal = true)}
          >Add</Button
        >
      </div>
    {/if}

    {#if $tasks.length > 0}
      <Pagination
        total={$pagination.total}
        limit={$pagination.per_page}
        rest={10}
        perpage={false}
        bind:page
      />

      <div class="task-grid mt-3 {semiLoading ? 'opacity-30' : ''}">
        {#each $tasks as task (task.task_id)}
          <Card>
            <div class="card-body">
              <a class="card-title mb-5" href={`/task/${task.task_id}`}>
                {truncate(task.title, 22)}
              </a>
              <p class="mb-3 mt-2 description-text">
                {truncate(task.description, 60)}
              </p>
              <p class="mb-1">
                <strong>Article:</strong>
                <Chip>
                  {truncate(task.article?.title, 30)}
                </Chip>
              </p>
              <p class="mb-1">
                <strong>Schema:</strong>
                <Chip>
                  {truncate(task.json_schema?.table_name, 30)}
                </Chip>
              </p>
              <p class="mb-1">
                <strong>Status:</strong>
                <Chip>{task.status}</Chip>
                {#if task.assigned_to}
                  <Chip>
                    assigned to {$all_user.find(
                      (user) => user.user_id == task.assigned_to
                    )?.first_name || 'test'}
                  </Chip>
                {/if}
              </p>
              <p class="mb-3 mt-3 flex">
                {#if task.approved_by.length <= 0}
                  <span class="m-4"></span>
                {:else}
                  <strong>Reviewed by: </strong>
                  {#each task.approved_by as approved_by}
                    <Avatar name={getUserNameChars(approved_by)} size="md" />
                  {/each}
                {/if}
              </p>
              <div class="btn-group">
                {#if task.status === 'created'}
                  {#if $login_user.role && $login_user.role.permissions.includes('assign_task')}
                    {#if $login_user.role.slug == 'assessor'}
                      <Button
                        variant="primary"
                        on:click={() => handleAssignTask(task.task_id)}
                      >
                        Assign
                      </Button>
                    {:else}
                      <Select
                        options={$all_user.map((user) => ({
                          value: user.user_id,
                          label: user.first_name + ' ' + user.last_name,
                        }))}
                        placeholder="Assign user..."
                        size={'md'}
                        on:change={(event) =>
                          selectUserToAssign(event, task.task_id)}
                      />
                    {/if}
                  {/if}
                {:else if task.status === 'assigned' && task.assigned_to == $login_user.user_id}
                  {#if $login_user.role && $login_user.role.permissions.includes('assign_task')}
                    <Button
                      variant="primary"
                      on:click={() => handleStartTask(task.task_id)}
                    >
                      Start
                    </Button>
                  {/if}
                {:else if task.status === 'in_progress' && task.assigned_to == $login_user.user_id}
                  {#if $login_user.role && $login_user.role.permissions.includes('assign_task')}
                    <Button
                      variant="success"
                      on:click={() => handleFinalizeTask(task.task_id)}
                    >
                      Finish
                    </Button>
                  {/if}
                {:else if task.status === 'finalized' || task.status === 'approved'}
                  {#if task.approved_by.length < 3 && !task.approved_by.find((approved) => approved.user_id == $login_user.user_id)}
                    {#if $login_user.role && $login_user.role.permissions.includes('review_task')}
                      <Button
                        variant="success"
                        on:click={() => handleApproveTask(task.task_id)}
                      >
                        Approve
                      </Button>
                    {/if}

                    <Button
                      variant="error"
                      on:click={() => handleRejectTask(task.task_id)}
                    >
                      {$login_user.role &&
                      $login_user.role.permissions.includes('review_task')
                        ? 'Reject'
                        : 'Restart'}
                    </Button>
                  {/if}
                {/if}

                {#if $login_user.role && $login_user.role.permissions.includes('task_mng')}
                  <Button
                    variant="error"
                    on:click={() => handleDeleteTask(task.task_id)}
                    >Delete
                  </Button>
                {/if}
              </div>
            </div>
          </Card>
        {/each}
      </div>

      <Pagination
        total={$pagination.total}
        limit={$pagination.per_page}
        rest={10}
        perpage={false}
        bind:page
      />
    {:else}
      <div class="notask">
        <h3>No tasks found. Create new task.</h3>
      </div>
    {/if}

    <Modal bind:open={showAddModal}>
      <Form horizontal>
        <FormGroup>
          <Input
            id="taskTitle"
            bind:value={newTask.title}
            validity={error.title ? 'error' : null}
          >
            Title
            <span slot="hint">{error.title}</span>
          </Input>
        </FormGroup>
        <FormGroup>
          <Input
            id="taskDescription"
            bind:value={newTask.description}
            validity={error.description ? 'error' : null}
          >
            Description
            <span slot="hint">{error.description}</span>
          </Input>
        </FormGroup>
        <FormGroup>
          <AutoComplete
            bind:suggestions={articleSuggestions}
            bind:selectedItem={selectedArticle}
            onTyping={updateArticleSuggestions}
            placeHolder="Select Article"
            className="full-width"
            validity={error.article_id ? 'error' : null}
            bind:inputValue={articleInputValue}
          />
        </FormGroup>
        <FormGroup>
          <AutoComplete
            suggestions={schemaSuggestions}
            bind:selectedItem={selectedSchema}
            onTyping={updateSchemaSuggestions}
            placeHolder="Select Schema"
            className="full-width"
            validity={error.schema_id ? 'error' : null}
            bind:inputValue={schemaInputValue}
          />
        </FormGroup>
        <FormGroup>
          <Checkbox bind:value={newTask.assign_task} inline>Assign</Checkbox>
          <Select
            options={$all_user.map((user) => ({
              value: user.user_id,
              label: user.first_name + ' ' + user.last_name,
            }))}
            placeholder="Select User to assign to"
            disabled={!newTask.assign_task}
            size={'md'}
            validity={error.assigned_to ? 'error' : null}
            on:change={(event) => (newTask.assigned_to = event.target.value)}
          />
        </FormGroup>
        <Button variant="success" on:click={handleAddTask}>Add</Button>
      </Form>
    </Modal>
  </div>
{/if}

<style>
  .task_page {
    padding: 20px;
  }

  h1 {
    text-align: center;
  }

  .task-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .task-grid .card-body a {
    font-size: 22px;
  }

  .btn-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .notask {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 200px;
  }

  .description-text {
    height: 50px;
  }

  .flex {
    display: flex;
    gap: 10px;
  }

  .card-title {
    text-decoration: underline !important;
    cursor: pointer;
  }

  .card-title:hover {
    color: #807fe2;
  }
</style>
