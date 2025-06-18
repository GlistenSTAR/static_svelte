<script>
  // @ts-nocheck
  import {
    Button,
    Modal,
    Form,
    FormGroup,
    Input,
    Card,
    Pagination,
    Container,
    Col,
    Grid,
    Icon,
  } from 'svelte-spectre';

  import {
    get_articles,
    add_article,
    edit_article,
    delete_article,
  } from '../../lib/services/article';
  import { login_user, articles, pagination } from '../../store';
  import Loading from '../../components/loading.svelte';

  import truncate from '../../utils/truncate';

  let showAddModal = false;
  let showEditModal = false;

  let newArticle = {
    article_id: null,
    title: '',
    authors: '',
    coden: '',
    pubdata: '',
    pubyear: null,
    doi: '',
    document: '',
    file: null,
  };

  let error = {
    title: '',
    authors: '',
    coden: '',
    pubdata: '',
    pubyear: '',
    doi: '',
    file: '',
  };

  let loading = true;
  let semiLoading = true;
  let page = 1;
  let per_page = 100;

  const get_newData = async (page, per_page) => {
    semiLoading = true;
    await get_articles(page, per_page);
    loading = false;
    semiLoading = false;
  };

  $: get_newData(page, per_page);

  const initialState = () => {
    newArticle = {
      title: '',
      authors: '',
      coden: '',
      pubdata: '',
      pubyear: null,
      doi: '',
      file: null,
    };
  };

  const initialError = () => {
    error = {
      title: '',
      authors: '',
      coden: '',
      pubdata: '',
      pubyear: '',
      doi: '',
      file: '',
    };
  };

  const validateInput = (data) => {
    let valid = true;
    initialError();

    if (!data.title.trim())
      (error.title = 'Please enter a title'), (valid = false);
    if (!data.authors.trim())
      (error.authors = 'Please enter authors'), (valid = false);
    if (!data.coden.trim())
      (error.coden = 'Please enter a coden'), (valid = false);
    if (!data.pubdata.trim())
      (error.pubdata = 'Please enter a pubdata'), (valid = false);
    if (!data.doi.trim()) (error.doi = 'Please enter a doi'), (valid = false);
    if (!data.file) (error.file = 'Please upload a file'), (valid = false);

    const year = parseInt(data.pubyear);
    const currentYear = new Date().getFullYear();
    if (!data.pubyear || isNaN(year) || year < 1800 || year > currentYear) {
      error.pubyear =
        'Please enter a valid publication year (1800 - current year)';
      valid = false;
    }

    return valid;
  };

  const handleAddArticle = async () => {
    if (validateInput(newArticle)) {
      const formData = new FormData();
      formData.append('title', newArticle.title);
      formData.append('authors', newArticle.authors);
      formData.append('coden', newArticle.coden);
      formData.append('pubdata', newArticle.pubdata);
      formData.append('pubyear', newArticle.pubyear);
      formData.append('doi', newArticle.doi);
      formData.append('file', newArticle.file);

      await add_article(formData);

      initialState();
      showAddModal = false;

      await get_articles(page, per_page);
    }
  };

  const handleEditArticle = async () => {
    if (newArticle.title.trim()) {
      const formData = new FormData();
      formData.append('title', newArticle.title);
      formData.append('authors', newArticle.authors);
      formData.append('coden', newArticle.coden);
      formData.append('pubdata', newArticle.pubdata);
      formData.append('pubyear', newArticle.pubyear);
      formData.append('doi', newArticle.doi);

      if (newArticle.file) {
        formData.append('file', newArticle.file);
      }

      await edit_article(newArticle.article_id, formData);

      initialState();
      showEditModal = false;

      await get_articles(page, per_page);
    }
  };

  const clickEditButton = async (article) => {
    showEditModal = true;
    newArticle = { ...article };
  };

  const handleDeleteArticle = async (articleId) => {
    await delete_article(articleId);
    await get_articles(page, per_page);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    newArticle = { ...newArticle, file: file };
  };
</script>

{#if loading}
  <Loading />
{:else}
  <div class="article_page">
    <h1>Article Management</h1>

    {#if $login_user.role && $login_user.role.permissions.includes('article_mng')}
      <div class="btn-group mb-5">
        <Button
          variant="success"
          on:click={() => {
            showAddModal = true;
            initialState();
          }}
          >Add
        </Button>
      </div>
    {/if}

    {#if $articles.length > 0}
      <Pagination
        total={$pagination.total}
        limit={$pagination.per_page}
        rest={10}
        perpage={false}
        bind:page
      />

      <div class="article-grid mt-3 {semiLoading ? 'opacity-30' : ''}">
        {#each $articles as article (article.article_id)}
          <Card>
            <div class="card-body">
              <h4 class="card-title mb-5">{truncate(article.title, 25)}</h4>
              <p class="mb-1">Authors : {truncate(article.authors, 20)}</p>
              <p class="mb-1">Pub Year : {article.pubyear}</p>

              <!-- <p class="mb-1">{article.pubdata}</p>
							<p class="mb-1">{article.coden}</p>
							<p class="mb-1">{article.doi}</p> -->
              <div class="btn-group">
                {#if $login_user.role && $login_user.role.permissions.includes('article_mng')}
                  {#if article.esdd_created}
                    <Button
                      variant="success"
                      on:click={() => clickEditButton(article)}>Edit</Button
                    >
                  {/if}
                  <Button
                    variant="error"
                    on:click={() => handleDeleteArticle(article.article_id)}
                  >
                    Delete
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
      <div class="no_article">
        <h3>No articles found. Create new article.</h3>
      </div>
    {/if}

    <Modal bind:open={showAddModal}>
      <Form horizontal>
        <Container>
          <FormGroup>
            <Input
              id="articleTitle"
              bind:value={newArticle.title}
              validity={error.title ? 'error' : null}
            >
              Title
              <span slot="hint">{error.title}</span>
            </Input>
          </FormGroup>
          <FormGroup>
            <Input
              id="articleAuthors"
              bind:value={newArticle.authors}
              validity={error.authors ? 'error' : null}
            >
              Authors
              <span slot="hint">{error.authors}</span>
            </Input>
          </FormGroup>
          <FormGroup>
            <Input
              id="articleCoden"
              bind:value={newArticle.coden}
              validity={error.coden ? 'error' : null}
            >
              Coden
              <span slot="hint">{error.coden}</span>
            </Input>
          </FormGroup>
          <FormGroup>
            <Input
              id="articlePubdata"
              bind:value={newArticle.pubdata}
              validity={error.pubdata ? 'error' : null}
            >
              Pubdata
              <span slot="hint">{error.pubdata}</span>
            </Input>
          </FormGroup>
          <FormGroup>
            <Input
              id="articlePubyear"
              bind:value={newArticle.pubyear}
              validity={error.pubyear ? 'error' : null}
            >
              Pubyear
              <span slot="hint">{error.pubyear}</span>
            </Input>
          </FormGroup>
          <FormGroup>
            <Input
              id="articleDoi"
              bind:value={newArticle.doi}
              validity={error.doi ? 'error' : null}
              class="mb-5"
            >
              Doi
              <span slot="hint">{error.doi}</span>
            </Input>
          </FormGroup>
        </Container>
        <div class="mt-5">
          <Container>
            <Grid>
              <Col col="4">
                <span class="mt-5">File Upload</span>
              </Col>
              <Col col="8">
                <label class="m-5 mt-5" for="fileInput">
                  <span class="file-input-label">
                    {#if newArticle.file}
                      {newArticle.file.name}
                    {:else}
                      <Icon icon="upload" size="2x" color="primary" />
                    {/if}
                  </span>
                  <input
                    type="file"
                    name="articleFile"
                    id="fileInput"
                    onchange={handleFileChange}
                    hidden
                  />
                </label>
                <span>{error.file}</span>
              </Col>
            </Grid>
          </Container>
        </div>
        <div class="mt-5 mb-5">
          <Button variant="success" on:click={handleAddArticle}>Add</Button>
        </div>
      </Form>
    </Modal>

    <Modal bind:open={showEditModal}>
      <Form horizontal>
        <FormGroup>
          <Input id="articleTitle" bind:value={newArticle.title}>Title</Input>
        </FormGroup>
        <FormGroup>
          <Input id="articleAuthors" bind:value={newArticle.authors}
            >Authors</Input
          >
        </FormGroup>
        <FormGroup>
          <Input id="articleCoden" bind:value={newArticle.coden}>Coden</Input>
        </FormGroup>
        <FormGroup>
          <Input id="articlePubdata" bind:value={newArticle.pubdata}
            >Pubdata</Input
          >
        </FormGroup>
        <FormGroup>
          <Input id="articlePubyear" bind:value={newArticle.pubyear}
            >Pubyear</Input
          >
        </FormGroup>
        <FormGroup>
          <Input id="articleDoi" bind:value={newArticle.doi}>Doi</Input>
        </FormGroup>
        <FormGroup>
          <Container>
            <Grid stack>
              <Col col="4">
                <span>File Upload</span>
              </Col>
              <Col col="8">
                <label class="m-5" for="fileInput">
                  <span class="file-input-label">
                    {#if newArticle.file}
                      {newArticle.file.name}
                    {:else if newArticle.document}
                      {newArticle.document}
                    {:else}
                      <Icon icon="upload" size="2x" color="initial" />
                    {/if}
                  </span>
                  <input
                    type="file"
                    name="articleFile"
                    id="fileInput"
                    onchange={handleFileChange}
                    hidden
                  />
                </label>
                <span>{error.file}</span>
              </Col>
            </Grid>
          </Container>
        </FormGroup>
        <Button variant="success" on:click={handleEditArticle}>Edit</Button>
      </Form>
    </Modal>
  </div>
{/if}

<style>
  .article_page {
    padding: 20px;
  }

  h1 {
    text-align: center;
  }

  .article-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .btn-group {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .no_article {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 200px;
  }

  .file-input-label {
    cursor: pointer;
    font-weight: bold;
    text-decoration: underline;
  }
</style>
