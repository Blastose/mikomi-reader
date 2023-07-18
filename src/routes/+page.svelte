<script lang="ts">
	import { setTitle } from '$lib/window/title';
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/tauri';

	let a: string | undefined;

	async function addBook() {
		try {
			const res: string = await invoke('add_book', { title: 'My book', path: 'f' });
			console.log(res);
			a = res;
		} catch {
			console.log('pogpofjj');
		}
	}

	onMount(async () => {
		await setTitle();
	});
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
<a href="/t">te</a>
<a href="/books">books</a>

<button on:click={addBook}>Add book</button>
{#if a}
	{a}
{/if}
