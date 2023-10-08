<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { addCollection } from '$lib/bindings';
	import InputModal from '$lib/components/modal/InputModal.svelte';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import type { Writable } from 'svelte/store';

	export let openStore: Writable<boolean>;
	export let inputValue: string;

	async function handleAddCollection() {
		try {
			await addCollection({ id: crypto.randomUUID(), name: inputValue });
			addToast({ data: { title: 'Created collection', color: '', description: '' } });
			await invalidateAll();
		} catch {
			addToast({ data: { title: 'Cannot create collection', color: '', description: '' } });
		}
	}
</script>

<InputModal
	modalTitle="Add new collection"
	{openStore}
	placeholder="Collection name"
	onSave={handleAddCollection}
	confirmText="Create collection"
	cancelText="Cancel"
	bind:inputValue
/>
