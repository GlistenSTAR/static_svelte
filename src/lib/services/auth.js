// @ts-nocheck
import { env } from '$env/dynamic/public';

export const auth_github = async () => {
	window.location.href = (env.PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/auth/github';
};

export const auth_mpds = async () => {
	console.log(env.PUBLIC_API_URL);
	window.location.href = (env.PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/auth/mpds';
};
