"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { Group } from "three";

interface ModelViewerProps {
    modelUrl: string;
    className?: string;
}

function Model({ url }: { url: string }) {
    const [obj, setObj] = useState<Group | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loader = new OBJLoader();
        loader.load(
            url,
            (loadedObj) => {
                setObj(loadedObj);
            },
            (xhr) => {
                // console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
            },
            (error) => {
                console.error("An error happened loading the OBJ file", error);
                setError("Failed to load 3D model");
            }
        );
    }, [url]);

    if (error) {
        return (
            <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshStandardMaterial color="red" />
            </mesh>
        );
    }

    if (!obj) {
        return null;
    }

    return <primitive object={obj} />;
}

export function ModelViewer({
    modelUrl,
    className = "w-full h-[500px]",
}: ModelViewerProps) {
    return (
        <div className={`relative bg-gray-50 rounded-lg overflow-hidden ${className}`}>
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 150], fov: 50 }}>
                <Suspense fallback={null}>
                    <Stage environment="city" intensity={0.5} shadows="contact">
                        <Model url={modelUrl} />
                    </Stage>
                </Suspense>
                <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={true} makeDefault />
            </Canvas>
            <div className="absolute bottom-4 right-4 text-xs text-gray-400 bg-white/80 px-2 py-1 rounded shadow-sm pointer-events-none">
                Interactive 3D Model
            </div>
        </div>
    );
}
