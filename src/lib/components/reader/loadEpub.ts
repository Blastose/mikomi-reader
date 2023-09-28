import postcss from 'postcss';
import prefixer from 'postcss-prefix-selector';
import { parseNavToc, parseNcxToc } from '$lib/components/reader/toc/tocParser';
import { Epub } from '$lib/epub/epub';
import { convertFileSrc } from '@tauri-apps/api/tauri';
import type { Toc } from '$lib/epub/epub';

async function prefixCss(css: string) {
	const prefed = postcss()
		.use(
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			prefixer({
				prefix: '.text-epub',
				transform(_prefix, selector, prefixedSelector) {
					if (selector === 'body') {
						return 'div.new-body';
					} else {
						return prefixedSelector;
					}
				}
			})
		)
		.process(css).css;
	return prefed;
}

function parseToc(toc: Toc | null) {
	if (!toc) return [];

	const parser = new DOMParser();
	let tocNavs;
	if (toc.kind === 'Nav') {
		const tocDoc = parser.parseFromString(toc.content, 'text/html');
		const navElement = tocDoc.querySelector('nav > ol');
		if (!navElement) throw Error('Invalid NAV TOC');
		tocNavs = parseNavToc(navElement, toc.path);
	} else {
		const tocDoc = parser.parseFromString(toc.content, 'text/xml');
		let navMap = tocDoc.querySelector('navMap');
		if (!navMap) {
			// .toc file is not able to be parsed by .parseFromString so
			// we just extract out the content between <navMap> tags
			const regexMatch = toc.content.match(/<navMap>.*<\/navMap>/s);
			let tocContent = toc.content;
			if (regexMatch) {
				tocContent = regexMatch[0];
			}
			const tocDoc = parser.parseFromString(tocContent, 'text/xml');
			navMap = tocDoc.querySelector('navMap');
		}
		if (!navMap) throw Error('Invalid NAV TOC');

		tocNavs = parseNcxToc(navMap, toc.path);
	}

	return tocNavs;
}

async function addEpubCssToHead(csses: Record<string, string>) {
	for (const [key, css] of Object.entries(csses)) {
		let newCss = await prefixCss(css);
		newCss = newCss.replaceAll(/font-size: *0;/g, '');
		newCss = newCss.replaceAll(/page-break-inside: *always;/g, 'break-inside: column;');
		newCss = newCss.replaceAll(/page-break-after: *always;/g, 'break-after: column;');
		newCss = newCss.replaceAll(/page-break-before: *always;/g, 'break-before: column;');
		newCss = newCss.replaceAll(/overflow: *hidden;/g, '');

		const styleNode = document.createElement('style');
		styleNode.id = key;
		styleNode.classList.add('epub-css');
		styleNode.appendChild(document.createTextNode(newCss));
		document.head.appendChild(styleNode);
	}
}

function createImageUrls(
	imgNodes: Element[],
	imgMap: Record<string, { data: Uint8Array }>,
	objectUrls: string[]
) {
	for (const node of imgNodes) {
		const imageNodeType = node.getAttribute('src')
			? 'src'
			: node.getAttribute('xlink:href')
			? 'xlink:href'
			: null;
		if (!imageNodeType) return;

		const imageEpubUri = node.getAttribute(imageNodeType);
		if (!imageEpubUri) return;

		const imageData = imgMap[imageEpubUri];
		if (!imageData) return;
		const blob = new Blob([imageData.data]);
		const blobUrl = URL.createObjectURL(blob);

		node.setAttribute(imageNodeType, blobUrl);

		objectUrls.push(blobUrl);
	}
}

function fixPreserveAspectRatio(doc: Document) {
	const svgNodes = doc.querySelectorAll('svg');
	for (const node of svgNodes) {
		node.removeAttribute('preserveAspectRatio');
	}
}

function parseHtml(
	htmlData: { id: string; htmlContent: string }[],
	imgMap: Record<string, { data: Uint8Array }>
) {
	const parser = new DOMParser();
	let newHtml = '';
	const blobUrls: string[] = [];

	for (const [index, { id, htmlContent }] of htmlData.entries()) {
		const xmlDoc = parser.parseFromString(htmlContent, 'application/xhtml+xml');
		const imgNodes = xmlDoc.querySelectorAll('body img');
		const imageNodes = xmlDoc.querySelectorAll('body image');
		createImageUrls([...imgNodes, ...imageNodes], imgMap, blobUrls);

		fixPreserveAspectRatio(xmlDoc);

		let bodyIdElement = '';
		if (xmlDoc.body.id) {
			bodyIdElement = `<span id="${xmlDoc.body.id}"></span>`;
		}

		newHtml += `
      <div id="${id}" class="new-body ${xmlDoc.body.classList.toString()}">
        ${index === 0 ? '<div id="text-epub-start"></div>' : ''}
        ${bodyIdElement}${xmlDoc.body.outerHTML}
      </div>
    `;
	}

	return {
		newHtml,
		blobUrls
	};
}

export async function loadEpub(path: string) {
	const fileSrc = convertFileSrc(path);
	const epub = await Epub.fromUrl(fileSrc);
	const { html, img, css, toc } = await epub.getEpub();

	const tocNavs = parseToc(toc ?? null);
	await addEpubCssToHead(Object.fromEntries(css));

	const { newHtml, blobUrls } = parseHtml(html, Object.fromEntries(img));

	return {
		newHtml,
		blobUrls,
		tocNavs
	};
}
