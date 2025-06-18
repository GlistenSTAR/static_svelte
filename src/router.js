import { pattern } from 'svelte-pathfinder';

export const routes = [
  { name: 'home', pattern: pattern('/') },
  { name: 'article', pattern: pattern('/article') },
  { name: 'callback', pattern: pattern('/callback') },
  { name: 'form_generator', pattern: pattern('/form_generator') },
  { name: 'login', pattern: pattern('/login') },
  { name: 'permissions', pattern: pattern('/permissions') },
  { name: 'roles', pattern: pattern('/roles') },
  { name: 'schema', pattern: pattern('/schema') },
  { name: 'tasks', pattern: pattern('/tasks') },
  { name: 'users', pattern: pattern('/users') },
];
