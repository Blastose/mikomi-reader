<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { addBookFromFile } from '$lib/bindings';
	import { event } from '@tauri-apps/api';
	import { open } from '@tauri-apps/api/dialog';
	import { onDestroy, onMount } from 'svelte';
	import { IconBookUpload } from '@tabler/icons-svelte';
	import ProgressBar from './ProgressBar.svelte';
	import { writable, type Writable } from 'svelte/store';
	import { addToast } from '../toast/ToastContainer.svelte';

	export let openStore: Writable<boolean>;
	export let extensions: string[];
	let loadingFiles = false;

	function getValidPathsWithExtensions(paths: string[]) {
		const validPaths: string[] = [];
		for (const path of paths) {
			for (const extension of extensions) {
				if (path.endsWith(`.${extension}`)) {
					validPaths.push(path);
					break;
				}
			}
		}
		return validPaths;
	}

	async function handleClick() {
		const files = await open({
			multiple: true,
			directory: false,
			filters: [{ extensions: ['epub'], name: 'epub' }]
		});
		if (files === null || !Array.isArray(files)) {
			return null;
		}

		addEpubToDatabase(files);
	}

	let progressValue = writable(0);
	let numberOfBooksToAdd = 10;
	async function addEpubToDatabase(paths: string[]) {
		loadingFiles = true;
		numberOfBooksToAdd = paths.length;
		progressValue.set(0);
		let failedUploads = 0;
		for (const path of paths) {
			try {
				await addBookFromFile(path);
				progressValue.update((v) => v + 1);
			} catch {
				failedUploads++;
			}
		}
		invalidateAll();
		openStore.set(false);
		if (failedUploads > 0) {
			addToast({
				data: { title: `Added book(s) with ${failedUploads} failed`, color: '', description: '' }
			});
		} else {
			addToast({ data: { title: 'Added book(s)', color: '', description: '' } });
		}
		numberOfBooksToAdd = 0;
		loadingFiles = false;
	}

	let fileDropHover: Promise<() => void>;
	onMount(() => {
		fileDropHover = event.listen('tauri://file-drop', (e) => {
			const validPaths = getValidPathsWithExtensions(e.payload as string[]);
			addEpubToDatabase(validPaths);
		});
	});

	onDestroy(async () => {
		const unlisten = await fileDropHover;
		unlisten();
	});
</script>

<button on:click={handleClick} class="drop-container flex gap-4 items-center h-full justify-center">
	<span class="flex flex-col items-center gap-2">
		{#if loadingFiles}
			<p>Adding books...</p>
			{#key numberOfBooksToAdd}
				<ProgressBar value={progressValue} maxValue={numberOfBooksToAdd} />
			{/key}
			<p>{$progressValue} / {numberOfBooksToAdd}</p>
		{:else}
			<IconBookUpload />
			<p>Choose files or drag them here</p>
		{/if}
	</span>
</button>

<style>
	.drop-container {
		background-image: url("data:image/svg+xml,%3csvg width='100%25' height='100%25' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='100%25' height='100%25' fill='none' stroke='white' stroke-width='4' stroke-dasharray='6%2c 14' stroke-dashoffset='0' stroke-linecap='square'/%3e%3c/svg%3e");
	}

	.drop-container:focus-visible {
		background-image: none;
	}
</style>
