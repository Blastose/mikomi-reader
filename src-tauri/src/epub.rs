use epub::doc::EpubDoc;
use image::GenericImageView;
use serde::Serialize;
use specta::Type;
use std::{collections::HashMap, fs::File, io::BufReader};
use xml::reader::{ParserConfig, XmlEvent};

#[derive(Serialize, Type)]
pub struct HtmlData {
    id: String,
    html_content: String,
}

#[derive(Serialize, Type)]
pub struct EpubData {
    html: Vec<HtmlData>,
    img: HashMap<String, ImageData>,
    css: HashMap<String, String>,
    toc: Option<Toc>,
}

#[derive(Serialize, Type)]
pub enum TocKind {
    Ncx,
    Nav,
}

#[derive(Serialize, Type)]
pub struct Toc {
    pub kind: TocKind,
    pub content: String,
    pub path: String,
}

pub struct PossibleTocId<'a> {
    pub kind: TocKind,
    pub id: &'a str,
}

#[derive(Serialize, Type)]
pub struct ImageData {
    data: Vec<u8>,
    width: u32,
    height: u32,
}

#[tauri::command]
#[specta::specta]
pub async fn get_epub(path: &str) -> Result<EpubData, ()> {
    let doc = EpubDoc::new(path);
    let mut doc = doc.unwrap();
    let mut imgs: HashMap<String, ImageData> = HashMap::new();
    let mut csses: HashMap<String, String> = HashMap::new();
    let mut html_full: Vec<HtmlData> = vec![];

    loop {
        let current_path = doc.get_current_path().unwrap();
        let ht = doc.get_current_with_epub_uris().unwrap();
        let xml_slice = ht.as_slice();
        let reader = ParserConfig::new().create_reader(BufReader::new(xml_slice));

        for e in reader {
            let e = e.unwrap();
            match e {
                XmlEvent::StartElement {
                    name,
                    attributes,
                    namespace: _,
                } => {
                    if name.local_name == "image" || name.local_name == "img" {
                        for attr in attributes {
                            if attr.name.local_name == "href" || attr.name.local_name == "src" {
                                let res = attr.value;
                                let res_without_epub_prefix = res.strip_prefix("epub://").unwrap();
                                let img =
                                    doc.get_resource_by_path(res_without_epub_prefix).unwrap();
                                let (width, height) =
                                    image::load_from_memory(&img).unwrap().dimensions();
                                imgs.insert(
                                    res.to_string(),
                                    ImageData {
                                        data: img,
                                        width,
                                        height,
                                    },
                                );
                            }
                        }
                    } else if name.local_name == "link" {
                        let mut has_rel = false;
                        let mut has_type_css = false;
                        let mut has_href = false;
                        let mut href = String::from("");
                        for attr in attributes {
                            if attr.name.local_name == "rel" {
                                has_rel = true;
                            } else if attr.name.local_name == "type" && attr.value == "text/css" {
                                has_type_css = true;
                            } else if attr.name.local_name == "href" {
                                has_href = true;
                                href = attr.value;
                            }
                        }
                        if has_rel && has_type_css && has_href {
                            let href_without_prefix = href.strip_prefix("epub://").unwrap();
                            let css = doc.get_resource_by_path(href_without_prefix);
                            match css {
                                Some(v) => {
                                    csses.insert(href.to_string(), String::from_utf8(v).unwrap());
                                }
                                None => (),
                            }
                        }
                    }
                }
                _ => (),
            }
        }

        let st_ht = String::from_utf8(ht).unwrap();

        html_full.push(HtmlData {
            id: String::from(current_path.to_string_lossy()),
            html_content: st_ht,
        });

        if !doc.go_next() {
            break;
        }
    }

    let toc = get_toc_data(doc);

    Ok(EpubData {
        html: html_full,
        img: imgs,
        css: csses,
        toc,
    })
}

fn get_toc_data(mut doc: EpubDoc<BufReader<File>>) -> Option<Toc> {
    let possible_tocs = vec![
        PossibleTocId {
            id: "toc.ncx",
            kind: TocKind::Ncx,
        },
        PossibleTocId {
            id: "ncx",
            kind: TocKind::Ncx,
        },
        PossibleTocId {
            id: "nav",
            kind: TocKind::Nav,
        },
        PossibleTocId {
            id: "toc",
            kind: TocKind::Nav,
        },
    ];

    let mut toc: Option<Toc> = None;

    for possible_toc in possible_tocs {
        let resource_option = doc.get_resource(possible_toc.id);
        match resource_option {
            Some(resource) => {
                let path_and_mime = doc.resources.get(possible_toc.id).unwrap();
                toc = Some(Toc {
                    kind: possible_toc.kind,
                    content: String::from_utf8(resource.0).unwrap(),
                    path: String::from(path_and_mime.to_owned().0.to_string_lossy()),
                });
                break;
            }
            None => (),
        }
    }

    toc
}
