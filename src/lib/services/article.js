// @ts-nocheck
import API from '../../utils/api';
import { articles, pagination } from '../../store.js';

export const get_articles = async (page = 1, per_page = 1000) => {
	try {
		let data = await API.get(`/articles/?page=${page}&per_page=${per_page}`);
		if (data.items) {
			pagination.set(data);
			articles.set(data.items);
		}
	} catch (err) {
		console.log(err);
	}
};

export const search_articles = async (search = '') => {
	try {
		let data = await API.get(`/articles/search/?search=${search}`);
		if (data.items) {
			return data.items;
		}
	} catch (err) {
		console.log(err);
	}
};

export const add_article = async (formData) => {
	try {
		await API.post('/articles/', formData);
	} catch (error) {
		console.error('Error adding article:', error);
		throw error;
	}
};

export const edit_article = async (article_id, formData) => {
	try {
		let data = await API.put(`/articles/${article_id}/`, formData);
		if (data.article_id) {
			articles.update((articles) =>
				articles.map((article) => (article.article_id === data.article_id ? data : article))
			);
		}
	} catch (err) {
		console.log(err);
	}
};

export const update_article = async (article_data) => {
	try {
		let data = await API.put(`/articles/${article_data.article_id}/`, article_data);
		if (data.article_id) {
			articles.update((articles) =>
				articles.map((article) => (article.article_id === data.article_id ? data : article))
			);
		}
	} catch (err) {
		console.log(err);
	}
};

export const delete_article = async (article_id) => {
	try {
		let data = await API.delete(`/articles/${article_id}/`);
		if (data.article_id) {
			articles.update((articles) =>
				articles.filter((article) => article.article_id !== data.article_id)
			);
		}
	} catch (err) {
		console.log(err);
	}
};
