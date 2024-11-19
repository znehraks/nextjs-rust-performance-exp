#[no_mangle]
pub fn to_grayscale(data: &mut [u8]) {
    data.chunks_exact_mut(4).for_each(|chunk| {
        let r = chunk[0] as f32;
        let g = chunk[1] as f32;
        let b = chunk[2] as f32;
        
        let gray = (0.299 * r + 0.587 * g + 0.114 * b) as u8;
        
        chunk[0] = gray;
        chunk[1] = gray;
        chunk[2] = gray;
        // chunk[3] (alpha) remains unchanged
    });
}