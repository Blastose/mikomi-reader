<script lang="ts">
	import { IconPlus } from '@tabler/icons-svelte';
	import { open } from '@tauri-apps/api/dialog';
	import { addMultipleBooksFromFiles } from '$lib/bindings';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import { invalidateAll } from '$app/navigation';
	import HeaderButton from './HeaderButton.svelte';

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
			invalidateAll();
		} catch {
			addToast({
				data: { color: 'bg-green-500', description: `Unable to add books`, title: 'Failure' }
			});
		}
	}
</script>

<HeaderButton handleClick={onClick} subText={'Add book(s)'}>
	<IconPlus />
</HeaderButton>
