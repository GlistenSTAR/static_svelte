// @ts-nocheck
import API from '../../utils/api';
import { roles } from '../../store';
import { set_login_user } from './user';

export const get_roles = async () => {
	try {
		let data = await API.get(`/roles/`);

		if (data.length > 0) roles.set(data);
	} catch (err) {
		console.log(err);
	}
};

export const add_role = async (role_data) => {
	try {
		let data = await API.post(`/roles/`, role_data);

		if (data.role_id)
			roles.update((roles) => {
				return [...roles, data];
			});
	} catch (err) {
		console.log(err);
	}
};

export const update_role = async (role_data) => {
	try {
		let data = await API.put(`/roles/${role_data.role_id}`, role_data);

		if (data.role_id) {
			roles.update((roles) => roles.map((role) => (role.role_id === data.role_id ? data : role)));
			set_login_user(localStorage.getItem('access_token'));
		}
	} catch (err) {
		console.log(err);
	}
};

export const delete_role = async (role_id) => {
	try {
		let data = await API.delete(`/roles/${role_id}`);
		if (data.ok) {
			roles.update((roles) => roles.filter((role) => role.role_id !== role_id));
		}
	} catch (err) {
		console.log(err);
	}
};
