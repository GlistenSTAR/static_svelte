<script>
  import { onMount } from 'svelte';
  import {
    Button,
    Pagination,
    Code,
    Form,
    FormGroup,
    Input,
    Modal,
    Accordion,
    Divider,
  } from 'svelte-spectre';

  import {
    add_schema,
    get_schemas,
    update_schema,
    delete_schema,
  } from '../../lib/services/schemas';
  import { login_user, schemas, pagination, schema } from '../../store';
  import Loading from '../../components/loading.svelte';

  let new_schema = '';
  let existing_schema = {};

  let error = {};
  let showAddModalDialog = false;
  let showEditModalDialog = false;

  let loading = true;
  let semiLoading = true;
  let page = 1;
  let per_page = 100;

  onMount(async () => {
    if ($login_user) {
      if (
        !$login_user.role ||
        !$login_user.role.permissions.includes('schema_mng')
      ) {
        window.location.href = '/login';
        return;
      }
    }
  });

  const initialState = () => {
    new_schema = '';
  };

  const get_newData = async (page, per_page) => {
    semiLoading = true;
    await get_schemas(page, per_page);
    loading = false;
    semiLoading = false;
  };

  $: {
    get_newData(page, per_page);
  }

  const handle_delete = async (id) => {
    const confirmed = confirm('Are you sure you want to delete this schema?');
    if (confirmed) {
      await delete_schema(id);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileContent = await readFile(file);

    try {
      const jsonSchema = await sqlToJsonSchema(fileContent);
      loading = true;
      await add_schema(jsonSchema);
      error = {};
      loading = false;
    } catch (err) {
      console.log(err);
      error.fileInput =
        'Failed to parse the SQL dump file. Please check the file format.';
    }
  };

  const readFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  };

  const removeComments = (sql) => {
    return sql
      .replace(/--.*$/gm, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .trim();
  };

  const sqlToJsonSchema = (sqlDump) => {
    sqlDump = removeComments(sqlDump);
    const tables = sqlDump.split(';').filter((table) => table.trim() !== '');
    const schemaArray = [];

    tables.forEach((table) => {
      const tableNameMatch = table.match(
        /CREATE TABLE(?: IF NOT EXISTS)?\s+["]?(\w+)["]?/i
      );
      if (!tableNameMatch) return;

      const tableName = tableNameMatch[1];

      /* eslint-disable no-useless-escape */
      const columnMatches = [
        ...table.matchAll(
          /["]?(\w+)["]?\s+([\w\s\[\]]+)(?:\s+DEFAULT\s+[^\s,]+)?(?:\s+(NOT NULL|NULL))?/gi
        ),
      ];

      const properties = {};
      const primaryKeys = new Set();
      const foreignKeys = [];
      const indexedColumns = new Set();

      if (columnMatches.length === 0) {
        console.error(`Nocolumnsfoundfortable:${tableName}`);
      }

      columnMatches.forEach((match) => {
        const [, columnName, columnType, nullConstraint] = match;
        if (!columnName) return;

        if (
          ![
            'create',
            'table',
            'if not exists',
            'primary',
            'foreign',
            'references',
            'not',
          ].includes(columnName.toLowerCase()) &&
          columnName !== tableName
        ) {
          const cleanColumnType = columnType.trim().toUpperCase();
          let jsonType = 'string';
          let format = null;

          if (
            ['INT', 'INTEGER', 'SMALLINT', 'BIGINT'].includes(cleanColumnType)
          ) {
            jsonType = 'integer';
          } else if (
            ['NUMERIC', 'DECIMAL', 'REAL', 'DOUBLE PRECISION'].includes(
              cleanColumnType
            )
          ) {
            jsonType = 'number';
          } else if (cleanColumnType === 'BOOLEAN') {
            jsonType = 'boolean';
          } else if (cleanColumnType === 'UUID') {
            jsonType = 'string';
            format = 'uuid';
          } else if (
            cleanColumnType === 'JSONB' ||
            cleanColumnType === 'JSON'
          ) {
            jsonType = 'object';
          } else if (
            cleanColumnType.includes('VARCHAR') ||
            cleanColumnType.includes('CHAR') ||
            cleanColumnType.includes('TEXT')
          ) {
            jsonType = 'string';
          } else if (cleanColumnType.includes('TIMESTAMP')) {
            jsonType = 'string';
            format = 'date-time';
          } else if (
            cleanColumnType.includes('NUMERIC[') ||
            cleanColumnType.includes('[]')
          ) {
            jsonType = 'array';
          }

          properties[columnName] = {
            type: jsonType,
            description: columnName,
          };

          if (format) {
            properties[columnName].format = format;
          }

          if (nullConstraint === 'NOT NULL') {
            properties[columnName].nullable = false;
          } else {
            properties[columnName].nullable = true;
          }
        }
      });

      const pkMatch = table.match(/PRIMARY KEY\s*\(([^)]+)\)/);
      if (pkMatch) {
        pkMatch[1]
          .split(',')
          .map((pk) => pk.trim().replace(/"/g, ''))
          .forEach((pk) => primaryKeys.add(pk));
      }

      const fkMatches = [
        ...table.matchAll(
          /FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s*(\w+)\s*\(([^)]+)\)/g
        ),
      ];
      fkMatches.forEach(([, fkColumn, referencedTable, referencedColumn]) => {
        foreignKeys.push({ fkColumn, referencedTable, referencedColumn });
      });

      primaryKeys.forEach((pk) => {
        if (properties[pk]) {
          properties[pk].primaryKey = true;
        }
      });

      foreignKeys.forEach(({ fkColumn, referencedTable, referencedColumn }) => {
        if (properties[fkColumn]) {
          properties[fkColumn].foreignKey = {
            table: referencedTable,
            column: referencedColumn,
          };
        }
      });

      const indexMatches = [
        ...sqlDump.matchAll(
          /CREATE INDEX IF NOT EXISTS \w+ ON \w+ USING btree\(\s*["]?(\w+)["]?\s*\)/g
        ),
      ];
      indexMatches.forEach(([, indexColumn]) => {
        indexedColumns.add(indexColumn);
      });

      indexedColumns.forEach((indexCol) => {
        if (properties[indexCol]) {
          properties[indexCol].indexed = true;
        }
      });

      const tableSchema = {
        $schema: 'http://json-schema.org/draft-04/schema#',
        description: `${tableName} Schema`,
        type: 'object',
        additionalProperties: true,
        properties: properties,
      };

      schemaArray.push({
        tableName: tableName,
        schema: tableSchema,
      });
    });

    return schemaArray;
  };

  const showAddModal = () => {
    initialState();
    error = {};
    showAddModalDialog = true;
  };

  const showEditModal = (schema) => {
    showEditModalDialog = true;
    existing_schema = schema;
    existing_schema.json_schema = JSON.stringify(
      JSON.parse(schema.json_schema),
      null,
      2
    );
  };

  const applyTask = (value) => {
    schema.set(value);
    window.location.href = '/tasks';
  };

  const handleAddSchema = async () => {
    if (new_schema) {
      const jsonSchema = sqlToJsonSchema(new_schema);

      if (jsonSchema.length > 0) {
        loading = true;
        await add_schema(jsonSchema);
        await get_newData(page, per_page);
        error = {};
        showAddModalDialog = false;
        loading = false;
      }
    } else {
      error.json_data = 'Please input SQL query';
    }
  };

  const handleEditSchema = async () => {
    if (existing_schema) {
      loading = true;
      existing_schema.json_schema = existing_schema.json_schema.replace(
        /\s+/g,
        ' '
      );
      await update_schema(existing_schema);
      error = {};
      loading = false;
    }
    showEditModalDialog = false;
  };
</script>

{#if loading}
  <Loading />
{:else}
  <main>
    {#if error.fileInput}
      <p style="color: red;">{error.fileInput}</p>
    {/if}

    <div class="action-bar mt-6">
      <Button variant="primary" on:click={showAddModal}>Add</Button>
      <label for="fileUpload" class="ml-3">
        <span class="btn-upload">Upload SQL file</span>
        <input
          id="fileUpload"
          type="file"
          accept=".sql"
          on:change={handleFileUpload}
          hidden
        />
      </label>
    </div>

    {#if $schemas.length > 0}
      <Pagination
        total={$pagination.total}
        limit={$pagination.per_page}
        rest={10}
        perpage={false}
        bind:page
      />

      <div class="schema-grid mt-3 {semiLoading ? 'opacity-30' : ''}">
        {#each $schemas as schema (schema.schema_id)}
          <div class="flex justify-between">
            <div>
              <Accordion group="schema" toggled>
                <h5 slot="header">
                  <span>{schema.table_name}</span>
                </h5>
                <Code
                  >{JSON.stringify(
                    JSON.parse(schema.json_schema),
                    null,
                    2
                  )}</Code
                >
              </Accordion>
            </div>
            <div>
              <Button variant="success" on:click={() => applyTask(schema)}
                >Apply</Button
              >
              <Button variant="primary" on:click={() => showEditModal(schema)}
                >Edit</Button
              >
              <Button
                variant="error"
                on:click={() => handle_delete(schema.schema_id)}>Delete</Button
              >
            </div>
          </div>
          <Divider align="horizontal center" />
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
        <h3>No schemas found. Create new schema.</h3>
      </div>
    {/if}

    <Modal bind:open={showAddModalDialog}>
      <Form>
        <FormGroup>
          <Input
            type="text"
            placeholder="Please insert DDL"
            rows={5}
            bind:value={new_schema}
          >
            DDL
            <span slot="hint">{error.json_data}</span>
          </Input>
        </FormGroup>
        <Button variant="success" on:click={handleAddSchema}>Add</Button>
      </Form>
    </Modal>

    <Modal bind:open={showEditModalDialog}>
      <Form>
        <FormGroup>
          <Input
            type="text"
            placeholder="Table name"
            bind:value={existing_schema.table_name}
          >
            Table name
          </Input>
        </FormGroup>
        <FormGroup>
          <Input
            type="text"
            placeholder="Schema Data"
            rows={10}
            bind:value={existing_schema.json_schema}
          >
            Schema Data
          </Input>
        </FormGroup>
        <Button variant="success" on:click={handleEditSchema}>Edit</Button>
      </Form>
    </Modal>
  </main>
{/if}

<style>
  .btn-upload {
    vertical-align: middle;
    background-color: #4caf50;
    color: white;
    padding: 0.25rem 0.4rem;
    border: none;
    cursor: pointer;
    display: inline-flex !important;
    height: 1.8rem;
  }

  .action-bar {
    display: flex;
    justify-content: end;
  }
</style>
