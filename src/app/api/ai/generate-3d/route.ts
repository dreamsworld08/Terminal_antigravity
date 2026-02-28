import { NextResponse } from "next/server";
import { getOpenAI } from "@/lib/openai";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt || !prompt.trim()) {
            return NextResponse.json(
                { error: "A prompt is required" },
                { status: 400 }
            );
        }

        const openai = getOpenAI();

        const imageResponse = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Ultra-realistic, hyper-detailed, photorealistic 3D architectural interior design photograph: ${prompt}.
Make this look completely indistinguishable from reality. Use premium materials and textures with exact light bounces, soft ambient shadowing, and global illumination.
The lighting must be natural, high-end, and perfectly exposed like an editorial photograph for Architectural Digest.
Absolutely NO AI-artifacts, NO stylized rendering, and NO cartoonish features. This must be an ultra-realistic 4K photo.
Keep a luxury aesthetic, captured on a full-frame camera with an attractive 3/4 perspective angle.`,
            n: 1,
            size: "1024x1024",
            quality: "hd",
            style: "natural",
        });

        const generatedImage = imageResponse?.data?.[0]?.url;

        if (!generatedImage) {
            return NextResponse.json(
                {
                    error: "AI could not generate an image for this prompt. Try rephrasing.",
                    description: prompt,
                },
                { status: 422 }
            );
        }

        return NextResponse.json({
            success: true,
            image: generatedImage,
            description: prompt,
            prompt,
        });
    } catch (error: unknown) {
        console.error("3D generation error:", error);
        const message =
            error instanceof Error ? error.message : "Generation failed";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
