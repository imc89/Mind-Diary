import React, { useState, useEffect } from "react";

const Mouse = () => {
    const [position, setPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const updatePosition = (e) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", updatePosition);
        return () => {
            window.removeEventListener("mousemove", updatePosition);
        };
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: "20px",
                height: "20px",
                backgroundColor: "rgba(0, 123, 255, 0.6)", // Blue glow color
                borderRadius: "50%",
                pointerEvents: "none",
                transform: "translate(-50%, -50%)",
                boxShadow: "0 0 10px rgba(0, 123, 255, 0.8)", // Glow effect
                zIndex: 9999,
            }}
        />
    );
};

export default Mouse;
