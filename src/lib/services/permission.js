// @ts-nocheck
import API from '../../utils/api';
import { permissions } from '../../store';
import { set_login_user } from './user';

export const get_permissions = async () => {
	try {
		let data = await API.get(`/permissions/`);
		permissions.set(data);
	} catch (err) {
		console.log(err);
	}
};

export const add_permission = async (permission_data) => {
	try {
		let data = await API.post(`/permissions/`, permission_data);
		permissions.update((permissions) => {
			return [...permissions, data];
		});
	} catch (err) {
		console.log(err);
	}
};

export const update_permission = async (permission_data) => {
	try {
		let data = await API.put(`/permissions/${permission_data.permission_id}`, permission_data);
		permissions.update((permissions) =>
			permissions.map((permission) =>
				permission.permission_id === data.permission_id ? data : permission
			)
		);

		set_login_user(localStorage.getItem('access_token'));
	} catch (err) {
		console.log(err);
	}
};

export const delete_permission = async (permission_id) => {
	try {
		let data = await API.delete(`/permissions/${permission_id}`);
		if (data.ok) {
			permissions.update((permissions) =>
				permissions.filter((permission) => permission.permission_id !== permission_id)
			);
		}
	} catch (err) {
		console.log(err);
	}
};
