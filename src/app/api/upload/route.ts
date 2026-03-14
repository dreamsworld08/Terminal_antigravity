import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import crypto from "crypto";
import path from "path";
import { writeFile, mkdir } from "fs/promises";
import fs from "fs";

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

        // Auto-convert .obj files to .glb for model-viewer / AR compatibility
        if (extension === ".obj") {
            try {
                const obj2gltf = (await import("obj2gltf")).default;
                // Write raw OBJ to a temp file so obj2gltf can read it
                const { unlink } = await import("fs/promises");
                const tmpObjPath = `/tmp/_tmp_${hash}.obj`;
                await writeFile(tmpObjPath, buffer);

                // Convert OBJ → GLB (binary glTF)
                const glb = await obj2gltf(tmpObjPath, { binary: true });
                buffer = Buffer.from(glb);
                extension = ".glb";

                // Clean up temp OBJ file
                try { await unlink(tmpObjPath); } catch { }
                console.log(`[upload] Converted OBJ → GLB for ${file.name}`);
            } catch (convErr) {
                console.error("[upload] OBJ→GLB conversion failed, saving raw OBJ:", convErr);
                // Fall back to saving the raw OBJ if conversion fails
            }
        }

        const filename = `uploads/${hash}${extension}`;

        // If Vercel Blob token is present, use it. Otherwise, save locally.
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Upload to Vercel Blob Storage
            const blob = await put(filename, buffer, {
                access: "public",
                contentType: file.type || "application/octet-stream",
            });
            return NextResponse.json({ url: blob.url }, { status: 201 });
        } else {
            // Local fallback
            const publicDir = path.join(process.cwd(), "public");
            const uploadDir = path.join(publicDir, "uploads");
            
            if (!fs.existsSync(uploadDir)) {
                await mkdir(uploadDir, { recursive: true });
            }
            
            const filePath = path.join(publicDir, filename);
            await writeFile(filePath, buffer);
            
            const origin = request.headers.get("origin") || "http://localhost:3000";
            return NextResponse.json({ url: `${origin}/${filename}` }, { status: 201 });
        }
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
