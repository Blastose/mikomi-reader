<script lang="ts">
	import type { BookWithAuthorsAndCoverAndSettings } from '$lib/bindings.js';
	import { relativeTime } from '$lib/util/util';
	import { convertFileSrc } from '@tauri-apps/api/tauri';

	export let book: BookWithAuthorsAndCoverAndSettings;
	export let disablePointerEvents: boolean = false;
</script>

<a
	href="/book/{book.id}"
	class="flex flex-col gap-2 justify-end max-w-md"
	class:pointer-events-none={disablePointerEvents}
>
	<div class="shadow-md overflow-hidden">
		{#if book.cover}
			<img
				class="object-cover object-top w-full h-full rounded-md"
				height="200"
				width="134"
				src={convertFileSrc(book.cover)}
				alt=""
			/>
		{:else}
			<div class="w-full h-full bg-gray-300 shadow-md" />
		{/if}
	</div>
	<div class="hidden sm:block">
		<p class="text-sm">{relativeTime(new Date(), book.date_added)}</p>
	</div>
</a>
