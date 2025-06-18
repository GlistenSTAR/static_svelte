// @ts-nocheck
import API from '../../utils/api';
import { login_user, all_user } from '../../store';

export const set_login_user = async (token) => {
	try {
		let data = await API.post(`/current_user/`, { token: token });
		const permissions = data.role.permissions;
		const slug_array = permissions.map((permission) => permission.slug);
		data.role.permissions = slug_array;
		login_user.set(data);
	} catch (err) {
		console.log(err);
	}
};

export const logout_user = async () => {
	login_user.set({});
};

export const get_users = async () => {
	try {
		let data = await API.get(`/users/`);
		all_user.set(data);
	} catch (err) {
		console.log(err);
	}
};

export const get_limited_users = async () => {
	try {
		let data = await API.get(`/users/limited/`);
		all_user.set(data);
	} catch (err) {
		console.log(err);
	}
};

export const add_user = async (user_data) => {
	try {
		let data = await API.post(`/users/`, user_data);
		all_user.update((users) => {
			return [...users, data];
		});
	} catch (err) {
		console.log(err);
	}
};

export const update_user = async (user_data) => {
	try {
		let data = await API.put(`/users/${user_data.user_id}`, user_data);
		all_user.update((users) => users.map((user) => (user.user_id === data.user_id ? data : user)));
	} catch (err) {
		console.log(err);
	}
};

export const delete_user = async (user_id) => {
	try {
		let data = await API.delete(`/users/${user_id}`);
		all_user.update((users) => users.filter((user) => user.user_id !== data.user_id));
	} catch (err) {
		console.log(err);
	}
};
