<script>
  import { Container, Navbar, Switch } from 'svelte-spectre';

  import { nodeAttribute } from '../utils/dom';
  import { darkTheme } from '../store';

  $: nodeAttribute(
    document.documentElement,
    'color-scheme',
    $darkTheme ? 'dark' : 'light'
  );
</script>

<footer class="py-2 mt-2">
  <Container>
    <Navbar>
      <nav slot="left">
        Created by <a href="https://tilde.pro" target="_blank">Tilde MI</a>
        and<br />
        <a href="https://mpds.io" target="_blank"
          >Materials Platform for Data Science</a
        >.
      </nav>
      <nav slot="center"></nav>
      <nav slot="right">
        <Switch bind:value={$darkTheme}>Dark theme</Switch>
      </nav>
    </Navbar>
  </Container>
</footer>

<style lang="scss">
  :global(body),
  :global(html) {
    height: 100%;

    :global(.spectre) {
      min-height: 100%;
      display: grid !important;
      grid-template-rows: auto 1fr auto;
    }
  }

  footer {
    font-size: 14px;
  }

  @media (prefers-color-scheme: dark) {
    footer {
      background-color: #343a51;
    }
  }
  @media (prefers-color-scheme: light) {
    footer {
      background-color: #f1f1fc;
    }
  }
  :global([color-scheme='dark']) {
    footer {
      background-color: #343a51;
    }
  }
  :global([color-scheme='light']) {
    footer {
      background-color: #f1f1fc;
    }
  }
</style>
