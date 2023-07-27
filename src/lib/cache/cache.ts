const cache = new Map<string, unknown>();

export function cacheOrRun<T>(key: string, fn: () => Promise<T>): T | Promise<T> {
	const cached = cache.get(key);
	if (cached) {
		return cached as T;
	}

	const data = fn();
	return data;
}

export async function setCache(key: string, data: unknown) {
	cache.set(key, data);
}
