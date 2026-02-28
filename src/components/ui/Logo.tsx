import React from "react";

export function Logo({ className = "w-10 h-10", ...props }: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            {...props}
        >
            <defs>
                <linearGradient id="terminal-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#D4AF37" />
                    <stop offset="50%" stopColor="#FFE58F" />
                    <stop offset="100%" stopColor="#AA7C11" />
                </linearGradient>
                <filter id="gold-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="1.5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Left Shape */}
            <path
                d="M 47,25 L 20,25 Q 10,25 5,15 Q 12,35 22,35 L 37,35 L 37,70 Q 37,90 20,95 Q 46,94 47,70 Z"
                fill="url(#terminal-gold)"
            />

            {/* Right Shape */}
            <path
                d="M 53,25 L 80,25 Q 90,25 95,15 Q 88,35 78,35 L 63,35 L 63,70 Q 63,90 80,95 Q 54,94 53,70 Z"
                fill="url(#terminal-gold)"
            />
        </svg>
    );
}
