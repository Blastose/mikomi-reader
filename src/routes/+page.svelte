<script lang="ts">
	import { setTitle } from '$lib/window/title';
	import { onMount } from 'svelte';
	import { addBook as addBookBinding } from '$lib/bindings';

	let a: string | undefined;
	let loading = false;

	async function addBook() {
		loading = true;
		await addBookBinding('My book2', '/f/');
		loading = false;
	}

	onMount(async () => {
		await setTitle();
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<a href="/t">te</a>
<a href="/books">books</a>

<button disabled={loading} on:click={addBook}>Add book</button>
{#if a}
	{a}
{/if}
