use epub::doc::EpubDoc;
use image::GenericImageView;
use serde::Serialize;
use specta::Type;
use std::{collections::HashMap, io::BufReader};
use xml::reader::{ParserConfig, XmlEvent};

#[derive(Serialize, Type)]
pub struct EpubData {
    html: Vec<(String, String)>,
    img: HashMap<String, (Vec<u8>, u32, u32)>,
    css: HashMap<String, String>,
    toc: Vec<TocData>,
}

#[derive(Serialize, Type)]
struct TocData {
    pub label: String,
    pub content: String,
}

#[tauri::command]
#[specta::specta]
pub async fn get_epub(path: &str) -> Result<EpubData, ()> {
    let doc = EpubDoc::new(path);
    let mut doc = doc.unwrap();
    let mut imgs: HashMap<String, (Vec<u8>, u32, u32)> = HashMap::new();
    let mut csses: HashMap<String, String> = HashMap::new();
    let mut html_full: Vec<(String, String)> = vec![];

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
                                imgs.insert(res.to_string(), (img, width, height));
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

        html_full.push((String::from(current_path.to_string_lossy()), st_ht));

        if !doc.go_next() {
            break;
        }
    }

    let toc = doc.toc;
    println!("{:#?}", toc);
    let toc = toc
        .into_iter()
        .map(|v| TocData {
            content: String::from(v.content.to_string_lossy()),
            label: v.label,
        })
        .collect();

    Ok(EpubData {
        html: html_full,
        img: imgs,
        css: csses,
        toc,
    })
}
