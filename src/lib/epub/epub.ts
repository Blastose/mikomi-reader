// TypeScript port of https://github.com/danigm/epub-rs/

import type { NavPoint } from '$lib/components/reader/toc/tocParser';
import { BlobReader, ZipReader, type Entry, Uint8ArrayWriter, TextWriter } from '@zip.js/zip.js';

class Archive {
	entries: Map<string, Entry>;

	private constructor(entries: Entry[]) {
		this.entries = new Map();

		for (const entry of entries) {
			this.entries.set(entry.filename, entry);
		}
	}

	static async fromZipReader(zipReader: ZipReader<unknown>) {
		const entries = await zipReader.getEntries();
		return new Archive(entries);
	}

	async getEntry(name: string) {
		const entry = this.entries.get(name);
		if (!entry) return undefined;
		if (!entry.getData) return undefined;

		const data = await entry.getData(new Uint8ArrayWriter());
		return data;
	}

	async getEntryAsString(name: string) {
		const entry = this.entries.get(name);
		if (!entry) return undefined;
		if (!entry.getData) return undefined;

		const data = await entry.getData(new TextWriter());
		return data;
	}

	async getContainerFile() {
		return await this.getEntryAsString('META-INF/container.xml');
	}
}

type Resource = {
	path: string;
	mime: string;
};

type Toc = { kind: 'Ncx' | 'Nav'; content: string; path: string };

export class Epub {
	archive: Archive;
	spine: Array<string>;
	toc: Array<NavPoint>;
	resources: Map<string, Resource>;
	metadata: Map<string, Array<string>>;
	rootFilePath: string;
	rootBasePath: string;
	current: number;
	uniqueIdentifier: string | null;
	coverId: string | null;

	constructor(archive: Archive, rootFilePath: string, rootBasePath: string) {
		this.archive = archive;
		this.spine = [];
		this.toc = [];
		this.resources = new Map();
		this.metadata = new Map();
		this.rootFilePath = rootFilePath;
		this.rootBasePath = rootBasePath;
		this.current = 0;
		this.uniqueIdentifier = null;
		this.coverId = null;
	}

	static async fromUrl(url: string): Promise<Epub> {
		const res = await fetch(url);
		const blob = await res.blob();

		const blobReader = new BlobReader(blob);
		const archive = await Archive.fromZipReader(new ZipReader(blobReader));

		const container = await archive.getContainerFile();
		if (!container) throw Error('Invalid epub');
		const rootFilePath = getRootFile(container);
		const rootBasePath = getParent(rootFilePath);

		const epub = new Epub(archive, rootFilePath, rootBasePath);
		await epub.fillResources();
		console.log(epub);
		return epub;
	}

	async fillResources() {
		const rootFile = await this.archive.getEntryAsString(this.rootFilePath);
		if (!rootFile) throw new Error('TODO');

		const parser = new DOMParser();
		const root = parser.parseFromString(rootFile, 'application/xhtml+xml');
		const uniqueIdentifierId = root.querySelector('pacakge')?.getAttribute('unique-identifier');

		// Manifest
		const manifest = root.querySelector('manifest');
		if (!manifest) throw new Error('TODO');
		const items = manifest.children;
		for (const item of items) {
			if (!this.coverId) {
				const properties = item.getAttribute('properties');
				const id = item.getAttribute('id');
				if (properties && properties === 'cover-image' && id) {
					this.coverId = id;
				}
			}

			this.insertResource(item);
		}

		// Spine
		const spine = root.querySelector('spine');
		if (!spine) throw new Error('TODO');
		const itemrefs = spine.children;
		for (const itemref of itemrefs) {
			const id = itemref.getAttribute('idref');
			if (!id) throw new Error('TODO');
			this.spine.push(id);
		}

		// TODO
		// toc.ncx

		// Metadata
		const metadata = root.querySelector('metadata');
		if (!metadata) throw new Error('TODO');
		const metadataChildren = metadata.children;
		for (const item of metadataChildren) {
			if (item.localName === 'meta') {
				const name = item.getAttribute('name');
				const content = item.getAttribute('content');
				const property = item.getAttribute('property');
				if (name && content) {
					if (name === 'cover') {
						this.coverId = content;
					}
					setMapArray(this.metadata, name, content);
				} else if (property) {
					const text = item.textContent ?? '';
					setMapArray(this.metadata, name, text);
				}
			} else {
				const name = item.localName;
				const text = item.textContent ?? '';
				if (name === 'identifier' && this.uniqueIdentifier === null && uniqueIdentifierId) {
					const id = item.getAttribute('id');
					if (id && id === uniqueIdentifierId) {
						this.uniqueIdentifier = text;
					}
				}

				setMapArray(this.metadata, name, text);
			}
		}
	}

	insertResource(element: Element) {
		const id = element.getAttribute('id');
		const href = element.getAttribute('href');
		const mediaType = element.getAttribute('media-type');
		if (!id || !href || !mediaType) throw new Error('TODO');

		this.resources.set(id, {
			path: this.joinBasePath(href),
			mime: mediaType
		});
	}

	joinBasePath(path: string) {
		if (this.rootBasePath === '') return path;

		return [this.rootBasePath, path].join('/');
	}

	mdata(name: string) {
		const result = this.metadata.get(name);
		return result?.at(0);
	}

	getReleaseIdentifier() {
		const modified = this.mdata('dcterms:modified');
		if (this.uniqueIdentifier && modified) {
			return `${this.uniqueIdentifier}@${modified}`;
		} else {
			return undefined;
		}
	}

	async getResourceByPath(path: string) {
		return await this.archive.getEntry(path);
	}

	async getResource(id: string) {
		const resource = this.resources.get(id);
		if (!resource) return undefined;
		const { path: path, mime: mime } = resource;

		const content = await this.getResourceByPath(path);
		if (!content) return undefined;
		return { content, mime, path };
	}

	async getResourceStrByPath(path: string) {
		return await this.archive.getEntryAsString(path);
	}

	async getResourceStr(id: string) {
		const resource = this.resources.get(id);
		if (!resource) return undefined;
		const { path, mime } = resource;
		const content = await this.getResourceStrByPath(path);
		if (!content) return undefined;
		return { content, mime };
	}

	getResourceMime(id: string) {
		const resource = this.resources.get(id);
		if (!resource) return undefined;
		return resource.mime;
	}

	getResourceMimeByPath(path: string) {
		for (const resource of this.resources) {
			if (resource[1].path === path) {
				return resource[1].mime;
			}
		}
		return undefined;
	}

	getCurrentId() {
		return this.spine.at(this.current);
	}

	async getCurrent() {
		const id = this.getCurrentId();
		if (!id) return undefined;
		return await this.getResource(id);
	}

	async getCurrentStr() {
		const id = this.getCurrentId();
		if (!id) return undefined;
		return await this.getResourceStr(id);
	}

	getCurrentMime() {
		const id = this.getCurrentId();
		if (!id) return undefined;
		return this.getResourceMime(id);
	}

	getCurrentPath() {
		const id = this.getCurrentId();
		if (!id) return undefined;
		return this.resources.get(id)?.path;
	}

	async getCurrentWithEpubUris() {
		const path = this.getCurrentPath();
		if (!path) throw new Error('curr path');
		const current = await this.getCurrentStr();
		if (!current) throw new Error('curr str');

		const parser = new DOMParser();
		const content = parser.parseFromString(current.content, 'application/xhtml+xml');
		const validTagsAndProperties = [
			{ tagName: 'link', property: 'href' },
			{ tagName: 'image', property: 'xlink:href' },
			{ tagName: 'a', property: 'href' },
			{ tagName: 'img', property: 'src' }
		];
		for (const node of content.querySelectorAll('*')) {
			const element = node.tagName;
			let attr = 'href';
			let value = node.getAttribute(attr);
			// TODO make this better
			if (!value) {
				attr = 'src';
				value = node.getAttribute(attr);
			}
			if (!value) {
				attr = 'xlink:href';
				value = node.getAttribute(attr);
			}

			if (value && validTagsAndProperties.some((v) => v.tagName === element)) {
				const epubUri = buildEpubUri(path, value);
				node.setAttribute(attr, epubUri);
			}
		}

		return content.documentElement.outerHTML;
	}

	goNext() {
		if (this.current + 1 >= this.spine.length) {
			return false;
		} else {
			this.current += 1;
			return true;
		}
	}

	goPrev() {
		if (this.current < 1) {
			return false;
		} else {
			this.current -= 1;
			return true;
		}
	}

	getNumChapters() {
		return this.spine.length;
	}

	getCurrentChapter() {
		return this.current;
	}

	setCurrentChapter(n: number) {
		if (n >= this.spine.length) {
			return false;
		} else {
			this.current = n;
			return true;
		}
	}

	resourceUriToChapter(uri: string) {
		for (const [id, resource] of this.resources) {
			if (resource.path === uri) {
				return this.resourceIdToChapter(id);
			}
		}
		return undefined;
	}

	resourceIdToChapter(uri: string) {
		const index = this.spine.findIndex((s) => s === uri);
		if (index === -1) return undefined;
		return index;
	}

	async getToc(): Promise<Toc | undefined> {
		const possibleTocs: { id: string; kind: 'Ncx' | 'Nav' }[] = [
			{
				id: 'toc.ncx',
				kind: 'Ncx'
			},
			{
				id: 'ncx',
				kind: 'Ncx'
			},
			{
				id: 'nav',
				kind: 'Nav'
			},
			{
				id: 'toc',
				kind: 'Nav'
			}
		];

		for (const possibleToc of possibleTocs) {
			const option = await this.getResourceStr(possibleToc.id);
			if (option) {
				const resource = this.resources.get(possibleToc.id);
				if (!resource) continue;
				return {
					kind: possibleToc.kind,
					content: option.content,
					path: resource.path
				};
			}
		}
		return undefined;
	}

	async getEpub() {
		const html_full: { id: string; htmlContent: string }[] = [];
		const csses = await this.getCss();
		// TODO fix width/height
		const imgs = await this.getImages();

		for (;;) {
			const currentPath = this.getCurrentPath();
			if (!currentPath) throw new Error('TODO');
			const currentWithEpubUris = await this.getCurrentWithEpubUris();
			if (!currentWithEpubUris) throw new Error('TODO');
			// const parser = new DOMParser();
			// const doc = parser.parseFromString(currentWithEpubUris, 'application/xhtml+xml');

			// const imgs = doc.querySelectorAll('img');
			// for (const img of imgs) {
			// 	if (img.src) {
			// 		img.value;
			// 	}
			// }

			// const links = doc.querySelectorAll('link');
			// for (const link of links) {
			// 	if (link.rel && link.type === 'text/css' && link.href) {
			// 		const hrefWithoutPrefix = stripPrefix(link.href, 'epub://');
			// 		const css = await this.getResourceStrByPath(hrefWithoutPrefix);
			// 		if (!css) continue;
			// 		csses.set(link.href, css);
			// 	}
			// }

			html_full.push({
				id: currentPath,
				htmlContent: currentWithEpubUris
			});

			if (!this.goNext()) {
				break;
			}
		}

		return {
			html: html_full,
			img: imgs,
			css: csses,
			toc: await this.getToc()
		};
	}

	async getCss() {
		const csses = new Map<string, string>();
		for (const [id, resource] of this.resources) {
			if (resource.mime === 'text/css') {
				const css = await this.getResourceStr(id);
				if (!css) continue;
				csses.set(buildEpubUri(this.rootBasePath, resource.path), css.content);
			}
		}
		return csses;
	}

	async getImages() {
		const imgs = new Map<string, { data: Uint8Array }>();
		for (const [id, resource] of this.resources) {
			if (/image\//.test(resource.mime)) {
				const img = await this.getResource(id);
				if (!img) continue;
				imgs.set(buildEpubUri(this.rootBasePath, resource.path), {
					data: img.content
				});
			}
		}
		return imgs;
	}
}

function getRootFile(container: string) {
	const parser = new DOMParser();
	const dom = parser.parseFromString(container, 'application/xhtml+xml');

	const rootfile = dom.querySelector('rootfile[full-path]');
	if (!rootfile) throw new Error('Invalid epub');

	return rootfile.getAttribute('full-path') as string; // we know it has the attribute from the querySelector
}

function getParent(path: string) {
	if (path === '/') return '';

	const splits = path.split('/');
	return splits.at(-2) ?? '';
}

function setMapArray<K, V>(map: Map<K, V[]>, key: K, value: V) {
	const result = map.get(key);
	if (!result) {
		map.set(key, [value]);
	} else {
		result.push(value);
	}
}

function buildEpubUri(path: string, append: string): string {
	if (append.startsWith('http')) {
		return append;
	}

	const pathSegments = path.split('/');
	const appendSegments = append.split('/');
	pathSegments.pop();

	for (const segment of appendSegments) {
		if (segment === '..') {
			pathSegments.pop();
		} else {
			pathSegments.push(segment);
		}
	}

	return `epub://${pathSegments.join('/')}`;
}
