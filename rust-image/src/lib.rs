use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn to_grayscale(data: &[u8]) -> Vec<u8> {
    let mut result = Vec::with_capacity(data.len());
    
    for chunk in data.chunks(4) {
        let r = chunk[0] as f32;
        let g = chunk[1] as f32;
        let b = chunk[2] as f32;
        
        // Grayscale 공식: 0.299R + 0.587G + 0.114B
        let gray = (0.299 * r + 0.587 * g + 0.114 * b) as u8;
        
        result.push(gray);    // R
        result.push(gray);    // G
        result.push(gray);    // B
        result.push(chunk[3]); // A
    }
    
    result
}