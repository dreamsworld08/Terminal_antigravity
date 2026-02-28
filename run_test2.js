const { spawn } = require('child_process');

async function main() {
    console.log("Starting server on 3001...");
    const server = spawn('npm', ['run', 'dev', '--', '-p', '3001'], { stdio: 'pipe' });

    server.stdout.on('data', data => { });
    server.stderr.on('data', data => { });

    await new Promise(r => setTimeout(r, 6000));

    console.log("Sending PUT request with full variants...");
    try {
        const variants = [
            { name: "Cognac", hex: "#9A4E1C", image: "https://images.unsplash.com/photo-1" },
            { name: "Black", hex: "#1C1C1C", image: "https://images.unsplash.com/photo-2" },
            { name: "Tan", hex: "#C19A6B", image: "https://images.unsplash.com/photo-3" },
            { name: "Navy", hex: "#1B2A4A", image: "https://images.unsplash.com/photo-4" }
        ];

        const payload = {
            name: "Dusk Nightstand",
            slug: "dusk-nightstand",
            description: "Sculptural nightstand with a single brushed drawer.",
            price: 82000,
            category: "bedroom",
            material: "Walnut",
            color: variants[0].name,
            dimensions: "50 × 40 × 55 cm",
            image: variants[0].image,
            images: JSON.stringify(variants),
            modelUrl: "https://example.com/model.obj",
            inStock: true,
            featured: false
        };

        console.log("Payload:", JSON.stringify(payload));

        const res = await fetch("http://localhost:3001/api/products/dusk-nightstand", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        console.log("Response status:", res.status);
        console.log("Response text:", await res.text());
    } catch (e) {
        console.error("Fetch error:", e);
    }

    server.kill();
}
main();
