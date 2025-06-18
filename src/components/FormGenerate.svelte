<script>
	import { FormGroup, Input, Select } from 'svelte-spectre';
	import Self from './FormGenerate.svelte';

	export let properties = {};
	export let description = {};
	export let onChange;

	const getMinMaxPlaceHolder = (value) => {
		let text = '';

		if (value.minimum != undefined) text += `Minimum: ${value.minimum}`;

		if (value.maximum != undefined) {
			if (value.minimum != undefined) text += ', ';

			text += `Maximum: ${value.maximum}`;
		}

		return text;
	};

	const handleChange = (e, key) => {
		if (onChange) {
			properties[key].value = e.target.value;
			onChange(properties);
		}
	};

	const handleCheck = (e, key) => {
		if (onChange) {
			properties[key].value = e.target.checked;
			onChange(properties);
		}
	};
</script>

<details class="p-3" open={true}>
	<summary>{description}</summary>
	<div class="p-5">
		<FormGroup>
			{#each Object.entries(properties) as [key, value] (key)}
				{#if value.type == 'string'}
					{#if value.enum}
						<h5>{value.description}</h5>
						<Select options={[key.toUpperCase(), ...value.enum]} />
					{:else}
						<Input type={value.type} on:change={(e) => handleChange(e, key)} value={value.value}>
							<h5>{value.description || key}</h5>
						</Input>
					{/if}
				{/if}

				{#if value.type == 'number'}
					<Input
						type={value.type}
						on:change={(e) => handleChange(e, key)}
						placeholder={getMinMaxPlaceHolder(value)}
						value={value.value}
						step="any"
					>
						{value.description || key}
					</Input>
				{/if}

				{#if value.type == 'integer'}
					<Input
						type={'number'}
						on:change={(e) => handleChange(e, key)}
						placeholder={getMinMaxPlaceHolder(value)}
						value={value.value}
					>
						{value.description || key}
					</Input>
				{/if}

				{#if value.type == 'boolean'}
					<label class="custom-checkbox my-3">
						<input type="checkbox" on:change={(e) => handleCheck(e, key)} checked={value.value} />
						<span class="checkmark"></span>
						{value.description || key}
					</label>
				{/if}

				{#if value.type == 'array' && value.items}
					{#if Array.isArray(value.items)}
						<Self
							properties={value.items.reduce((final, value, index) => {
								final[index] = value;
								return final;
							}, {})}
							description={value.description || value.definition || ''}
						/>
					{:else}
						<Self
							properties={{ [key]: value.items }}
							description={value.description || value.definition || ''}
						/>
					{/if}
				{/if}

				{#if value.type == 'object' || (typeof value.type == 'object' && value.type.includes('object'))}
					<Self
						properties={value.properties}
						description={value.description || value.definition || ''}
					/>
				{/if}
			{/each}
		</FormGroup>
	</div>
</details>

<style>
	summary {
		cursor: pointer;
	}
</style>
