// @ts-nocheck
import API from '../../utils/api';
import { pagination, schemas } from '../../store.js';

export const add_schema = async (schemaData) => {
	try {
		const jsonString = JSON.stringify(schemaData);

		await API.post(`/schemas/`, { schema_data: jsonString });

		await get_schemas(pagination.page, pagination.per_page);
	} catch (err) {
		console.log(err);
		throw err;
	}
};

export const get_schemas = async (page = 1, per_page = 1000) => {
	try {
		let data = await API.get(`/schemas/?page=${page}&per_page=${per_page}`);

		if (data.items) {
			pagination.set(data);
			schemas.set(data.items);
		}
	} catch (err) {
		console.log(err);
	}
};

export const search_schemas = async (search = '') => {
	try {
		let data = await API.get(`/schemas/search/?search=${search}`);
		if (data.items) {
			return data.items;
		}
	} catch (err) {
		console.log(err);
	}
};

export const update_schema = async (schemaData) => {
	try {
		// console.log(schemaData);
		let data = await API.put(`/schemas/${schemaData.schema_id}/`, schemaData);

		if (data.schema_id) {
			schemas.update((schemas) =>
				schemas.map((schema) => (schema.schema_id === data.schema_id ? data : schema))
			);
		}
	} catch (err) {
		console.log(err);
	}
};

export const delete_schema = async (schema_id) => {
	try {
		let data = await API.delete(`/schemas/${schema_id}/`);

		if (data.schema_id) {
			schemas.update((schemas) => schemas.filter((schema) => schema.schema_id !== data.schema_id));
		}
	} catch (err) {
		console.log(err);
	}
};
