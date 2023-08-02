<script lang="ts">
	import { open } from '@tauri-apps/api/dialog';
	import { setTitle } from '$lib/window/title';
	import { onMount } from 'svelte';
	import { addBookFromFile, addMultipleBooksFromFiles } from '$lib/bindings';

	let a: string | undefined;
	let loading = false;
	let imgNode: HTMLImageElement;

	async function getEpubPath() {
		const file = await open({
			multiple: false,
			directory: false,
			filters: [{ extensions: ['epub'], name: 'epub' }]
		});
		if (file === null || Array.isArray(file)) {
			return null;
		}
		return file;
	}

	async function getEpubPathMany() {
		const files = await open({
			multiple: true,
			directory: false,
			filters: [{ extensions: ['epub'], name: 'epub' }]
		});
		if (files === null || !Array.isArray(files)) {
			return null;
		}
		return files;
	}

	async function addEpubToDatabase() {
		const path = await getEpubPath();
		if (!path) return;
		let res = await addBookFromFile(path).catch(() => null);
		if (!res) return;

		// const imageBytes = res[1];
		// const blob = new Blob([new Uint8Array(imageBytes)]);
		// imgNode.src = URL.createObjectURL(blob);
	}

	async function addEpubToDatabaseMany() {
		const paths = await getEpubPathMany();
		if (!paths) return;
		let res = await addMultipleBooksFromFiles(paths).catch(() => null);
		if (!res) return;
	}

	onMount(async () => {
		await setTitle();
	});
</script>

<div class="flex flex-col gap-2 container-mi">
	<h1>Welcome to SvelteKit</h1>
	<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
	<a href="/t">te</a>
	<a href="/books">books</a>

	<button on:click={addEpubToDatabase}>Throw</button>

	<button on:click={addEpubToDatabaseMany}>Add many</button>

	<img alt="" bind:this={imgNode} />
</div>
