const truncate = (text, len) =>
  text.length > len ? text.slice(0, len) + '...' : text;

export default truncate;
