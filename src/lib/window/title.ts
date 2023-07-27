import { appWindow } from '@tauri-apps/api/window';

export const APP_TITLE = 'Mikomi Reader';

export async function setTitle(title?: string) {
	if (!title) {
		await appWindow.setTitle(APP_TITLE);
	} else {
		await appWindow.setTitle(`${title} - ${APP_TITLE}`);
	}
}
