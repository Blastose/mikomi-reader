<script lang="ts">
	import { IconPlus } from '@tabler/icons-svelte';
	import { open } from '@tauri-apps/api/dialog';
	import { addMultipleBooksFromFiles } from '$lib/bindings';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';

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

	async function addEpubToDatabaseMany() {
		const paths = await getEpubPathMany();
		if (!paths) return;
		let res = await addMultipleBooksFromFiles(paths).catch(() => null);
		if (!res) return;
	}

	async function onClick() {
		try {
			await addEpubToDatabaseMany();
			addToast({
				data: { color: 'bg-green-500', description: `Added book(s)`, title: 'Success' }
			});
		} catch {
			addToast({
				data: { color: 'bg-green-500', description: `Unable to add books`, title: 'Failure' }
			});
		}
	}
</script>

<button
	type="button"
	class="flex flex-col items-center p-2 text-gray-700 dark:text-neutral-300 dark:hover:text-black duration-300 rounded-md hover:text-black hover:bg-gray-200"
	on:click={onClick}
	aria-label="Add books"
>
	<IconPlus />
	<span class="text-xs">Add book(s)</span>
</button>
