// desktop/src-tauri/src/bin/gen_bindings.rs

use vrcp_lib::create_specta_builder; 
use specta_typescript::{Typescript, BigIntExportBehavior};
fn main() {
    println!("🚀 Generating bindings...");

    let builder = create_specta_builder();

    builder
        .export(
            Typescript::default()
                .bigint(BigIntExportBehavior::Number) // BigIntをnumberとして扱う
                .formatter(specta_typescript::formatter::prettier)
                .header("// @ts-nocheck\n/* eslint-disable */"),
            "../src/lib/bindings.ts"
        )
        .expect("Failed to export typescript bindings");
        
    println!("✅ Bindings generated at ../src/lib/bindings.ts");
}