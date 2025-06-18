<script>
  import { onMount, onDestroy } from 'svelte';
  import { Input } from 'svelte-spectre';

  export let suggestions = [];

  export let onTyping;

  export let selectedItem = {};

  export let placeHolder = 'Search...';

  export let className = '';

  export let validity = null;

  export let inputValue = '';

  let debounceTimeout;

  let isOpen = false;
  let autocompleteContainer;

  $: if (selectedItem) {
    inputValue = selectedItem.label;
  }

  function handleInput(event) {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      inputValue = event.target.value;
      onTyping(inputValue);
      isOpen = true;
    }, 500);
  }

  // function highlightMatch(label) {
  // 	const lowerCaseInput = inputValue.toLowerCase();
  // 	const index = label.toLowerCase().indexOf(lowerCaseInput);

  // 	if (index === -1) return label;

  // 	return (
  // 		label.slice(0, index) +
  // 		`<mark class="highlight">${label.slice(index, index + inputValue.length)}</mark>` +
  // 		label.slice(index + inputValue.length)
  // 	);
  // }

  function handleClickOutside(event) {
    if (
      autocompleteContainer &&
      !autocompleteContainer.contains(event.target)
    ) {
      isOpen = false;
    }
  }

  function selectSuggestion(item) {
    inputValue = item.label;
    selectedItem = item;
    isOpen = false;
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
</script>

<div class={`autocomplete ${className}`} bind:this={autocompleteContainer}>
  <Input
    type="text"
    {validity}
    bind:value={inputValue}
    on:input={handleInput}
    placeholder={placeHolder}
  />
  {#if isOpen && suggestions.length > 0}
    <ul class="autocomplete-ul">
      {#each suggestions as item}
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <li class="autocomplete-li" on:click={() => selectSuggestion(item)}>
          <!-- eslint-disable-next-line svelte/no-at-html-tags -->
          <!-- {@html highlightMatch(item.label)} -->
          {item.label}
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  .autocomplete {
    position: relative;
  }

  ul.autocomplete-ul {
    list-style: none;
    padding: 0;
    margin: 0 !important;
    border: 1px solid #f2f2f2;
    border-top: none;
    max-height: 100px;
    overflow-y: auto;
    position: absolute !important;
    width: 100%;
    background: #edeff3;
    z-index: 1000;
  }

  li.autocomplete-li {
    padding: 3px;
    cursor: pointer;
    list-style: none;
  }

  li.autocomplete-li:hover {
    background-color: #7270eb;
    color: white;
  }
</style>
