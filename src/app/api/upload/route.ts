import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        let buffer = Buffer.from(await file.arrayBuffer());

        // Generate a unique filename using a random hash
        const hash = crypto.randomBytes(8).toString("hex");
        let extension = path.extname(file.name).toLowerCase() || ".jpg";

        // Ensure the upload directory is correct (public/uploads)
        const uploadDir = path.join(process.cwd(), "public", "uploads");

        const fs = await import("fs");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Auto-convert .obj files to .glb for model-viewer / AR compatibility
        if (extension === ".obj") {
            try {
                const obj2gltf = (await import("obj2gltf")).default;
                // Write raw OBJ to a temp file so obj2gltf can read it
                const tmpObjPath = path.join(uploadDir, `_tmp_${hash}.obj`);
                await writeFile(tmpObjPath, buffer);

                // Convert OBJ → GLB (binary glTF)
                const glb = await obj2gltf(tmpObjPath, { binary: true });
                buffer = Buffer.from(glb);
                extension = ".glb";

                // Clean up temp OBJ file
                try { fs.unlinkSync(tmpObjPath); } catch { }
                console.log(`[upload] Converted OBJ → GLB for ${file.name}`);
            } catch (convErr) {
                console.error("[upload] OBJ→GLB conversion failed, saving raw OBJ:", convErr);
                // Fall back to saving the raw OBJ if conversion fails
            }
        }

        const filename = `${hash}${extension}`;
        const filePath = path.join(uploadDir, filename);

        await writeFile(filePath, buffer);

        // Return the public URL
        const publicUrl = `/uploads/${filename}`;

        return NextResponse.json({ url: publicUrl }, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
