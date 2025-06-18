// @ts-nocheck
import API from '../../utils/api';
import { tasks, task, pagination } from '../../store.js';

export const get_tasks = async (page = 1, per_page = 1000) => {
	try {
		let data = await API.get(`/tasks/?page=${page}&per_page=${per_page}`);
		if (data.items) {
			pagination.set(data);
			tasks.set(data.items);
		}
	} catch (err) {
		console.log(err);
	}
};

export const get_task = async (task_id) => {
	try {
		let data = await API.get(`/tasks/${task_id}/`);
		if (data.task_id) {
			task.set(data);
		}
	} catch (err) {
		console.log(err);
	}
};

export const add_task = async (task_data) => {
	try {
		await API.post(`/tasks/`, task_data);
	} catch (err) {
		console.log(err);
	}
};

export const update_task = async (task_data) => {
	try {
		let data = await API.put(`/tasks/${task_data.task_id}/`, task_data);
		if (data.task_id) {
			await tasks.update((tasks) =>
				tasks.map((task) => (task.task_id === data.task_id ? data : task))
			);
			await task.set(data);
		}
	} catch (err) {
		console.log(err);
	}
};

export const delete_task = async (task_id) => {
	try {
		let data = await API.delete(`/tasks/${task_id}/`);
		if (data.task_id) {
			tasks.update((tasks) => tasks.filter((task) => task.task_id !== data.task_id));
		}
	} catch (err) {
		console.log(err);
	}
};

export const assign_task = async (task_id, user_id) => {
	try {
		let data = await API.put(`/tasks/${task_id}/assign/${user_id}/`);
		if (data.task_id) {
			tasks.update((tasks) => tasks.map((task) => (task.task_id === data.task_id ? data : task)));
			task.set(data);
		}
	} catch (err) {
		console.log(err);
	}
};

export const start_task = async (task_id) => {
	try {
		let data = await API.put(`/tasks/${task_id}/start/`);
		if (data.task_id) {
			tasks.update((tasks) => tasks.map((task) => (task.task_id === data.task_id ? data : task)));
		}
	} catch (err) {
		console.log(err);
	}
};

export const finalize_task = async (task_id) => {
	try {
		let data = await API.put(`/tasks/${task_id}/finalize/`);
		if (data.task_id) {
			tasks.update((tasks) => tasks.map((task) => (task.task_id === data.task_id ? data : task)));
		}
	} catch (err) {
		console.log(err);
	}
};

export const approve_task = async (task_id) => {
	try {
		let data = await API.put(`/tasks/${task_id}/approve/`);
		if (data.task_id) {
			tasks.update((tasks) => tasks.map((task) => (task.task_id === data.task_id ? data : task)));
		}
	} catch (err) {
		console.log(err);
	}
};

export const reject_task = async (task_id) => {
	try {
		let data = await API.put(`/tasks/${task_id}/reject/`);
		if (data.task_id) {
			tasks.update((tasks) => tasks.map((task) => (task.task_id === data.task_id ? data : task)));
		}
	} catch (err) {
		console.log(err);
	}
};
