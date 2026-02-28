import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { imageData } = body;

        if (!imageData) {
            return NextResponse.json(
                { error: "Image data is required" },
                { status: 400 }
            );
        }

        const openai = getOpenAI();

        // Step 1: Use GPT-4o Vision to analyze the 2D product image and create a detailed description
        const analysisResponse = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert product designer and 3D visualization specialist for luxury furniture.
Analyze 2D product images (furniture photos, sketches, or renders) and produce an extremely detailed description
that can be used to generate a clean isometric 3D product visualization. Focus on:
- Exact shape, silhouette, and proportions of the furniture piece
- Materials and surface finishes (wood grain direction, fabric texture, metal finish, stone veining)
- Color palette with specific tones (e.g., warm walnut, matte charcoal, cream bouclé)
- Structural details (legs, joints, edges, cushions, hardware)
- Design style (mid-century modern, Scandinavian, industrial, etc.)
- Any unique design features or distinguishing elements
Keep the description under 300 words but maximally detailed for isometric 3D product rendering.`,
                },
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Analyze this furniture/product image and create a detailed prompt for generating a clean isometric 3D rendering of this exact product. Focus on the product's shape, materials, colors, textures, and design details. Do NOT describe a room or interior — only describe the product itself.",
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: imageData,
                                detail: "high",
                            },
                        },
                    ],
                },
            ],
            max_tokens: 500,
        });

        const description =
            analysisResponse.choices[0]?.message?.content ||
            "A luxury furniture piece with premium materials and refined craftsmanship";

        // Step 2: Use DALL-E 3 to generate an isometric 3D product visualization
        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Professional isometric 3D product rendering of a single furniture piece: ${description}.
Render this as a clean, high-end isometric view (30-degree elevated angle, 45-degree rotation) showing the product from an attractive 3/4 top-down perspective.
Place the product on a clean, minimal neutral background (soft light gray or white studio backdrop) with subtle contact shadows beneath the piece.
Use studio lighting with soft diffused key light, gentle fill light, and subtle rim lighting to highlight the product's form and materials.
Show accurate material textures: realistic wood grain, fabric weave, leather grain, metal reflections, or stone veining as appropriate.
This must look like a professional e-commerce product render or a high-quality catalog visualization.
NO room environment, NO walls, NO floor plans, NO interior context — ONLY the isolated product on a clean background.
Ultra-sharp, photorealistic quality, 4K detail level.`,
            n: 1,
            size: "1024x1024",
            quality: "hd",
            style: "natural",
        });

        const generatedImageUrl = imageResponse?.data?.[0]?.url;

        if (!generatedImageUrl) {
            return NextResponse.json(
                { error: "Failed to generate 3D visualization" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            image: generatedImageUrl,
            description,
        });
    } catch (error: unknown) {
        console.error("2D-to-3D conversion error:", error);
        const message =
            error instanceof Error ? error.message : "Conversion failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
