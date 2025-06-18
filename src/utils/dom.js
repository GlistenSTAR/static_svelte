export function nodeAttribute(node, name, value, set = true) {
  set ? node.setAttribute(name, value) : node.removeAttribute(name);
}
