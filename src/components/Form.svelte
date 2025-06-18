<script>
	import { Form } from 'svelte-spectre';
	import FormGroup from './FormGenerate.svelte';

	export let schema = {};
	export let onChange;

	let { description, properties } = schema;

	const handleChange = (value) => {
		properties = value;

		if (onChange) {
			onChange({ description, properties });
		}
	};
</script>

<Form>
	<h3>{description}</h3>
	<FormGroup {properties} {description} onChange={handleChange} />
</Form>
