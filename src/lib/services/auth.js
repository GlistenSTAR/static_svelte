const API_URL = 'http://localhost:8000/api/v1';

export const auth_github = async () => {
  window.location.href = API_URL + '/auth/github';
};

export const auth_mpds = async () => {
  window.location.href = API_URL + '/auth/mpds';
};
