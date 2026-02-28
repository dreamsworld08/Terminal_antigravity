const { spawn } = require('child_process');

async function main() {
    console.log("Starting server on 3001...");
    const server = spawn('npm', ['run', 'dev', '--', '-p', '3001'], { stdio: 'pipe' });

    server.stdout.on('data', data => console.log(`[STDOUT] ${data}`));
    server.stderr.on('data', data => console.error(`[STDERR] ${data}`));

    // Wait 5 seconds for server to start
    await new Promise(r => setTimeout(r, 6000));

    console.log("Sending PUT request...");
    try {
        const res = await fetch("http://localhost:3001/api/products/dusk-nightstand", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: "Dusk Nightstand",
                slug: "dusk-nightstand",
                description: "Sculptural nightstand with a single brushed drawer.",
                price: 82000,
                category: "bedroom",
                material: "Walnut",
                color: "Cognac",
                dimensions: "50 × 40 × 55 cm",
                image: "https://example.com/image.jpg",
                images: "[]",
                modelUrl: null,
                inStock: true,
                featured: false
            })
        });
        console.log("Response status:", res.status);
        console.log("Response text:", await res.text());
    } catch (e) {
        console.error("Fetch error:", e);
    }

    server.kill();
}
main();
