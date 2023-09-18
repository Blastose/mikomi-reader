<script lang="ts">
	import {
		IconAlignJustified,
		IconAlignLeft,
		IconAlignCenter,
		IconColumns1,
		IconColumns2,
		IconArrowsHorizontal,
		IconArrowsVertical
	} from '@tabler/icons-svelte';
	import SettingsButton from './SettingsButton.svelte';
	import type { TextAlign } from './settings';
	import type { Orientation } from '../utils';

	export let textAlign: TextAlign;
	export let columnCount: 1 | 2;
	export let writingMode: Orientation;
	export let dispatchWrapper: (f: () => void) => void;
	export let onColumnCountChange: (newColumnCount: 1 | 2) => Promise<void>;
	export let onWritingModeChange: (newWritingMode: Orientation) => Promise<void>;
</script>

<div class="flex flex-col gap-2">
	<div class="flex flex-col gap-2">
		<h3 class="font-medium">Justify</h3>

		<div class="flex justify-around gap-2">
			<SettingsButton
				onClick={() => {
					dispatchWrapper(() => {
						textAlign = 'initial';
					});
				}}
				subText="Initial"
				active={textAlign === 'initial'}
			>
				<svelte:fragment slot="icon">
					<IconAlignCenter />
				</svelte:fragment>
			</SettingsButton>

			<SettingsButton
				onClick={() => {
					dispatchWrapper(() => {
						textAlign = 'justify';
					});
				}}
				subText="Justify"
				active={textAlign === 'justify'}
			>
				<svelte:fragment slot="icon">
					<IconAlignJustified />
				</svelte:fragment>
			</SettingsButton>

			<SettingsButton
				onClick={() => {
					dispatchWrapper(() => {
						textAlign = 'left';
					});
				}}
				subText="Left"
				active={textAlign === 'left'}
			>
				<svelte:fragment slot="icon">
					<IconAlignLeft />
				</svelte:fragment>
			</SettingsButton>
		</div>
	</div>

	{#if writingMode === 'horizontal'}
		<div class="flex flex-col gap-2">
			<h3 class="font-medium">Page layout</h3>

			<div class="flex justify-around gap-2">
				<SettingsButton
					onClick={() => {
						onColumnCountChange(1);
					}}
					subText="1 column"
					active={columnCount === 1}
				>
					<svelte:fragment slot="icon">
						<IconColumns1 />
					</svelte:fragment>
				</SettingsButton>

				<SettingsButton
					onClick={() => {
						onColumnCountChange(2);
					}}
					subText="2 columns"
					active={columnCount === 2}
				>
					<svelte:fragment slot="icon">
						<IconColumns2 />
					</svelte:fragment>
				</SettingsButton>
			</div>
		</div>
	{/if}

	<div class="flex flex-col gap-2">
		<h3 class="font-medium">Writing mode</h3>

		<div class="flex justify-around gap-2">
			<SettingsButton
				onClick={() => {
					onWritingModeChange('horizontal');
				}}
				subText="Horizontal"
				active={writingMode === 'horizontal'}
			>
				<svelte:fragment slot="icon">
					<IconArrowsHorizontal />
				</svelte:fragment>
			</SettingsButton>

			<SettingsButton
				onClick={() => {
					onWritingModeChange('vertical');
				}}
				subText="Vertical"
				active={writingMode === 'vertical'}
			>
				<svelte:fragment slot="icon">
					<IconArrowsVertical />
				</svelte:fragment>
			</SettingsButton>
		</div>
	</div>
</div>
