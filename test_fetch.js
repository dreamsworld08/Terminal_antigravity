async function main() {
    try {
        const res = await fetch("http://localhost:3000/api/products/dusk-nightstand", {
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
        console.log("Status:", res.status);
        const text = await res.text();
        console.log("Response:", text);
    } catch (e) {
        console.error("Fetch error:", e);
    }
}
main();
