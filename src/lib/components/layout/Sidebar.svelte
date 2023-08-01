<script lang="ts">
	import {
		IconBook2,
		IconBooks,
		IconCheckbox,
		IconCircleArrowRight,
		IconSettings
	} from '@tabler/icons-svelte';

	let active = true;
</script>

<div class="sticky top-0 z-50 w-full h-screen overflow-y-auto bg-gray-500 scroll bg-opacity-20">
	<div class="flex flex-col gap-1 py-4 pl-3 pr-1">
		<p class="py-2 text-lg font-bold">Mikomi Reader</p>

		<a href="/" class="{active ? 'text-white bg-black' : ''}  rounded-md">
			<button class="flex w-full gap-2 p-1">
				<IconBook2 />
				Home
			</button>
		</a>
		<p class="text-lg font-bold">Library</p>
		<a href="/books" class="duration-300 rounded-md hover:bg-gray-500 hover:text-white">
			<button class="flex w-full gap-2 p-1">
				<IconBooks />
				All
			</button>
		</a>
		<a href="/books" class="duration-300 rounded-md hover:bg-gray-500 hover:text-white">
			<button class="flex w-full gap-2 p-1">
				<IconCircleArrowRight />
				Plan to Read
			</button>
		</a>
		<a href="/books" class="duration-300 rounded-md hover:bg-gray-500 hover:text-white">
			<button class="flex w-full gap-2 p-1">
				<IconCheckbox />
				Finished
			</button>
		</a>
		<a href="/books" class="duration-300 rounded-md hover:bg-gray-500 hover:text-white">
			<button class="flex w-full gap-2 p-1">
				<IconSettings />
				Settings
			</button>
		</a>
	</div>
</div>

<style>
	.scroll {
		scrollbar-gutter: stable;
	}

	.scroll::-webkit-scrollbar {
		width: 8px;
	}

	.scroll::-webkit-scrollbar-track {
		background: transparent;
	}

	.scroll::-webkit-scrollbar-thumb {
		background-color: rgba(155, 155, 155, 0.5);
		border-radius: 20px;
		border: transparent;
		visibility: hidden;
	}

	.scroll:hover::-webkit-scrollbar-thumb {
		visibility: visible;
	}
</style>
