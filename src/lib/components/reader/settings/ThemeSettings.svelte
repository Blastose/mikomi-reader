<script lang="ts">
	import ColorPicker from '$lib/components/settings/ColorPicker.svelte';
	import {
		readerThemeStore,
		savedReaderThemes,
		type ReaderThemeSettings
	} from '$lib/components/reader/stores/readerSettingsStore';
	import { presetReaderThemes } from '$lib/components/reader/stores/readerSettingsStore';
	import ImageBlendMode from './ImageBlendMode.svelte';
	import { IconDeviceFloppy, IconPencil, IconTrash, IconX } from '@tabler/icons-svelte';
	import { addReaderTheme, removeReaderTheme, updateReaderTheme } from '$lib/bindings';
	import { createDialog, melt } from '@melt-ui/svelte';
	import { fade, fly } from 'svelte/transition';
	import { addToast } from '$lib/components/toast/ToastContainer.svelte';
	import { flip } from 'svelte/animate';

	const {
		elements: { overlay, content, title, close, portalled },
		states: { open }
	} = createDialog({
		forceVisible: true,
		preventScroll: false
	});

	async function addCurrentThemeToReaderThemes() {
		const id = crypto.randomUUID();
		await addReaderTheme({
			background_color: $readerThemeStore.backgroundColor,
			color: $readerThemeStore.color,
			id,
			image_blend_mode: $readerThemeStore.imageMixBlendMode,
			link_color: $readerThemeStore.linkColor,
			name: 'Custom theme'
		});

		savedReaderThemes.update((themes) => {
			themes.push({
				...$readerThemeStore,
				name: 'Custom theme',
				id
			});
			return themes;
		});
	}

	async function deleteSavedTheme(deletedTheme: ReaderThemeSettings & { id: string }) {
		savedReaderThemes.update((themes) => {
			return themes.filter((theme) => theme.id !== deletedTheme.id);
		});
		await removeReaderTheme(deletedTheme.id);

		const onUndo = () => {
			addReaderTheme({
				background_color: deletedTheme.backgroundColor,
				color: deletedTheme.color,
				id: deletedTheme.id,
				image_blend_mode: deletedTheme.imageMixBlendMode,
				link_color: deletedTheme.linkColor,
				name: deletedTheme.name
			});

			savedReaderThemes.update((themes) => {
				themes.push(deletedTheme);
				return themes;
			});
		};

		addToast({
			data: { title: 'Theme deleted', color: '', description: '', onUndo }
		});
	}

	let editingTheme: ReaderThemeSettings & { id: string };
	let newThemeNameInput: HTMLInputElement;
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col gap-2">
		<div>
			<ColorPicker label="Background color" bind:color={$readerThemeStore.backgroundColor} />
			<span class="text-sm">{$readerThemeStore.backgroundColor}</span>
		</div>

		<div>
			<ColorPicker label="Text color" bind:color={$readerThemeStore.color} />
			<span class="text-sm">{$readerThemeStore.color}</span>
		</div>
		<div>
			<ColorPicker label="Link color" bind:color={$readerThemeStore.linkColor} />
			<span class="text-sm">{$readerThemeStore.linkColor}</span>
		</div>

		{#key $readerThemeStore}
			<ImageBlendMode bind:imageBlendMode={$readerThemeStore.imageMixBlendMode} />
		{/key}
		<button
			on:click={addCurrentThemeToReaderThemes}
			class="flex flex-col items-center rounded-md p-2 bg-neutral-700"
		>
			<IconDeviceFloppy />
			<span class="text-sm">Save current theme as preset</span>
		</button>
	</div>

	<div class="flex flex-col gap-2">
		<h3 class="font-medium">Preset themes</h3>
		<div class="flex flex-col gap-2">
			{#each presetReaderThemes as presetTheme}
				<button
					class="bg-neutral-700 rounded-md flex flex-col gap-1 items-center p-2 text-white"
					on:click={() => {
						readerThemeStore.set(structuredClone(presetTheme));
						localStorage.setItem('last-reader-theme', JSON.stringify(presetTheme));
					}}
				>
					<span
						class="block rounded-full w-6 h-6 border"
						style="background-color: {presetTheme.backgroundColor};"
					/>
					<span class="text-sm">{presetTheme.name}</span>
				</button>
			{/each}
		</div>
		<div class="flex flex-col gap-2">
			{#each $savedReaderThemes as savedTheme (savedTheme.id)}
				<div class="flex gap-2" animate:flip={{ duration: 300 }}>
					<button
						class="grow bg-neutral-700 rounded-md flex flex-col gap-1 items-center p-2 text-white"
						on:click={() => {
							readerThemeStore.set(structuredClone(savedTheme));
							localStorage.setItem('last-reader-theme', JSON.stringify(savedTheme));
						}}
					>
						<span
							class="block rounded-full w-6 h-6 border"
							style="background-color: {savedTheme.backgroundColor};"
						/>
						<span class="text-sm">{savedTheme.name}</span>
					</button>

					<div class="flex flex-col gap-2">
						<button
							class="flex flex-col items-center justify-center bg-neutral-800 px-4 rounded-md"
							on:click={() => {
								editingTheme = savedTheme;
								open.set(true);
							}}
						>
							<IconPencil />
						</button>
						<button
							on:click={() => {
								deleteSavedTheme(savedTheme);
							}}
							class="flex flex-col items-center justify-center bg-neutral-800 px-4 rounded-md"
						>
							<IconTrash />
						</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<div use:melt={$portalled}>
	{#if $open}
		<div
			transition:fade={{ duration: 150 }}
			use:melt={$overlay}
			class="fixed inset-0 z-50 bg-black/50"
		/>
		<div
			class="dialog-theme fixed left-[50%] top-[50%] z-50 max-h-[85vh] w-[90vw]
            max-w-[350px] translate-x-[-50%] translate-y-[-50%] rounded-xl bg-white
            p-6 shadow-lg"
			use:melt={$content}
			transition:fly={{
				duration: 150,
				y: -10,
				opacity: 0
			}}
		>
			<div class="flex flex-col gap-4">
				<h2 use:melt={$title} class="m-0 text-lg font-medium">Change theme name</h2>

				<label class="flex gap-2 items-center">
					<span>New name: </span>
					<input
						bind:this={newThemeNameInput}
						class="bg-neutral-700 rounded-md px-2 py-1"
						type="text"
						placeholder="Theme name"
						value={editingTheme?.name ?? ''}
					/>
				</label>
				<button
					on:click={() => {
						editingTheme.name = newThemeNameInput.value;
						updateReaderTheme(editingTheme.id, editingTheme.name);
						savedReaderThemes.update((themes) => themes);
						open.set(false);
					}}
					class="bg-neutral-700 rounded-md p-2">Save</button
				>
			</div>

			<button
				use:melt={$close}
				aria-label="Close"
				class="absolute right-[10px] top-[10px] inline-flex p-1
            appearance-none items-center justify-center rounded-full text-neutral-200
            hover:bg-neutral-700 focus:shadow-neutral-400 focus:outline-none focus:ring-2
            focus:ring-neutral-400"
			>
				<IconX />
			</button>
		</div>
	{/if}
</div>
