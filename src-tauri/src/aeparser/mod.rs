mod u24;

use std::fs::File;
use std::io::{Read, Seek, SeekFrom};
use std::str;
use std::convert::TryInto;
use serde::{Serialize, Deserialize};
use u24::U24;

#[derive(Debug, Serialize, Deserialize)]
pub struct ProjectItem {
    footage_dimensions: [i16; 2],
    footage_framerate: f64,
    frames: [u32; 2],
    name: String,
    background_color: [u8; 3],
}

fn position_of<T: Read + Seek>(stream: &mut T, s: &str, offset: u64) -> Option<u64> {
    let bytes = s.as_bytes();
    let mut buffer = vec![0; bytes.len()];
    stream.seek(SeekFrom::Start(offset)).ok()?;
    
    loop {
        if let Ok(n) = stream.read(&mut buffer) {
            if n == 0 {
                break;
            }
            if n < bytes.len() {
                // Check if we have enough bytes to form a full buffer
                let remaining_bytes = &buffer[..n];
                if remaining_bytes.ends_with(&bytes[..n]) {
                    return Some(stream.stream_position().ok()?);
                }
            } else {
                if buffer == bytes {
                    return Some(stream.stream_position().ok()?);
                }
            }
            stream.seek(SeekFrom::Current(-(n as i64 - 1))).ok()?;
        } else {
            break;
        }
    }

    None
}

pub fn parse_project(project_path: &str) -> Option<Vec<ProjectItem>> {
    let mut result: Vec<ProjectItem> = Vec::new();

    match File::open(project_path) {
        Ok(mut file) => {
            let mut buffer = Vec::new();
            file.read_to_end(&mut buffer).ok()?;
            let mut cursor = std::io::Cursor::new(buffer);

            let mut riff_magic = [0; 4];
            cursor.read_exact(&mut riff_magic).ok()?;
            if str::from_utf8(&riff_magic).unwrap() != "RIFX" {
                return None;
            }

            cursor.seek(SeekFrom::Current(4)).ok()?;
            let mut riff_format = [0; 4];
            cursor.read_exact(&mut riff_format).ok()?;
            if str::from_utf8(&riff_format).unwrap() != "Egg!" {
                return None;
            }

            let mut seekpos = 0;

            while let Some(offset) = position_of(&mut cursor, "idta", seekpos) {
                seekpos = offset;

                cursor.seek(SeekFrom::Current(92)).ok()?;
                let mut name_size_buffer = [0; 4];
                cursor.read_exact(&mut name_size_buffer).ok()?;
                let name_size: usize = i32::from_be_bytes(name_size_buffer).try_into().ok()?;
                let mut name_buffer = vec![0; name_size];
                cursor.read_exact(&mut name_buffer).ok()?;
                let name = String::from_utf8(name_buffer).ok()?;

                if let Some(offset) = position_of(&mut cursor, "LIST", offset) {
                    cursor.seek(SeekFrom::Start(offset.try_into().ok()?)).ok()?;

                    let mut list_size_buffer = [0; 4];
                    cursor.read_exact(&mut list_size_buffer).ok()?;
                    let list_size = i32::from_be_bytes(list_size_buffer);
                    cursor.seek(SeekFrom::Current(list_size.try_into().ok()?)).ok()?;

                    let mut cdta_buffer = [0; 4];
                    cursor.read_exact(&mut cdta_buffer).ok()?;
                    let cdta = str::from_utf8(&cdta_buffer).unwrap();
                    if cdta == "cdta" {
                        cursor.seek(SeekFrom::Current(8)).ok()?;

                        let mut framerate_divisor_buffer = [0; 4];
                        cursor.read_exact(&mut framerate_divisor_buffer).ok()?;
                        let framerate_divisor = i32::from_be_bytes(framerate_divisor_buffer);

                        let mut framerate_dividend_buffer = [0; 4];
                        cursor.read_exact(&mut framerate_dividend_buffer).ok()?;
                        let framerate_dividend = i32::from_be_bytes(framerate_dividend_buffer);

                        cursor.seek(SeekFrom::Current(6)).ok()?;
                        cursor.seek(SeekFrom::Current(2)).ok()?;
                        cursor.seek(SeekFrom::Current(3)).ok()?;
                        cursor.seek(SeekFrom::Current(3)).ok()?;

                        cursor.seek(SeekFrom::Current(2)).ok()?;
                        let mut start_frame_buffer = [0; 3];
                        cursor.read_exact(&mut start_frame_buffer).ok()?;
                        let start_frame = U24::from_be_bytes(start_frame_buffer);
                        cursor.seek(SeekFrom::Current(3)).ok()?;

                        cursor.seek(SeekFrom::Current(2)).ok()?;
                        let mut end_frame_buffer: [u8; 3] = [0; 3];
                        cursor.read_exact(&mut end_frame_buffer).ok()?;
                        let end_frame = U24::from_be_bytes(end_frame_buffer);

                        let mut end_frame_end_offset_buffer: [u8; 3] = [0; 3];
                        cursor.read_exact(&mut end_frame_end_offset_buffer).ok()?;

                        // maybe will be useful some day
                        let _end_frame_end_offset = U24::from_be_bytes(end_frame_end_offset_buffer);

                        cursor.seek(SeekFrom::Current(2)).ok()?;
                        let mut duration_buffer: [u8; 3] = [0; 3];
                        cursor.read_exact(&mut duration_buffer).ok()?;
                        let duration = U24::from_be_bytes(duration_buffer);
                        cursor.seek(SeekFrom::Current(3)).ok()?;

                        cursor.seek(SeekFrom::Current(2)).ok()?;
                        let mut background_color: [u8; 3] = [0; 3];
                        cursor.read_exact(&mut background_color).ok()?;

                        cursor.seek(SeekFrom::Current(85)).ok()?;

                        let mut width_buffer = [0; 2];
                        cursor.read_exact(&mut width_buffer).ok()?;
                        let width = i16::from_be_bytes(width_buffer);
                        let mut height_buffer = [0; 2];
                        cursor.read_exact(&mut height_buffer).ok()?;
                        let height = i16::from_be_bytes(height_buffer);

                        cursor.seek(SeekFrom::Current(12)).ok()?;

                        let mut framerate_buffer = [0; 2];
                        cursor.read_exact(&mut framerate_buffer).ok()?;
                        let framerate = i16::from_be_bytes(framerate_buffer);

                        cursor.seek(SeekFrom::Current(6)).ok()?;

                        let mut start_offset_buffer = [0; 4];
                        cursor.read_exact(&mut start_offset_buffer).ok()?;
                        let mut start_offset = u32::from_be_bytes(start_offset_buffer);

                        cursor.seek(SeekFrom::Current(2)).ok()?;

                        let mut comparison_framerate_buffer = [0; 2];
                        cursor.read_exact(&mut comparison_framerate_buffer).ok()?;
                        let comparison_framerate = i16::from_be_bytes(comparison_framerate_buffer);

                        if comparison_framerate != framerate {
                            start_offset /= 2;
                        }

                        let frames: [u32; 2];
                        if end_frame > 0x0013C680u32.into() || end_frame_end_offset_buffer[2] > 0x00 {
                            frames = [
                                ((start_offset + start_frame) / 2u32.into()).into(),
                                ((start_offset + duration) / 2u32.into()).into(),
                            ];
                        } else {
                            frames = [
                                ((start_offset + start_frame) / 2u32.into()).into(),
                                ((start_offset + end_frame) / 2u32.into()).into(),
                            ];
                        }

                        result.push(ProjectItem {
                            footage_dimensions: [width, height],
                            footage_framerate: framerate_dividend as f64 / framerate_divisor as f64,
                            frames,
                            name,
                            background_color,
                        });
                    }
                }
            }
            Some(result)
        },
        Err(e) => {
            eprintln!("{}", e);
            None
        }
    }
}
