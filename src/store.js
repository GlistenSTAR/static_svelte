import { writable } from 'svelte/store';

export const login_user = writable({});

export const all_user = writable([]);

export const roles = writable([]);

export const permissions = writable([]);

export const tasks = writable([]);

export const task = writable({});

export const articles = writable([]);

export const schemas = writable([]);

export const schema = writable({});

export const pagination = writable({
  total: null,
  per_page: null,
  total_pages: null,
  page: null,
});

const isBrowser = typeof window !== 'undefined';

const savedTheme = isBrowser
  ? localStorage.getItem('darkTheme') === 'true'
  : false;

export const darkTheme = writable(savedTheme);

if (isBrowser) {
  darkTheme.subscribe((value) => {
    localStorage.setItem('darkTheme', value);
  });
}
