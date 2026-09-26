import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CasinoIframeTV = () => {
  const { type } = useParams();
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const checkDevTools = () => {
      const threshold = 160;

      const widthDiff =
        window.outerWidth - window.innerWidth;

      const heightDiff =
        window.outerHeight - window.innerHeight;

      if (
        widthDiff > threshold ||
        heightDiff > threshold
      ) {
        setBlocked(true);
      }
    };

    // First check
    checkDevTools();

    // Continue checking
    const interval = window.setInterval(
      checkDevTools,
      400
    );

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // Inspect detect hua to iframe completely remove
  if (blocked) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          background: "#fff",
          color: "#111",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1
          style={{
            fontSize: "60px",
            margin: 0,
          }}
        >
          404
        </h1>

        <p
          style={{
            fontSize: "20px",
            marginTop: "10px",
          }}
        >
          Page Not Found
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        margin: 0,
        padding: 0,
        overflow: "hidden",
        background: "#000",
      }}
    >
      <iframe
        src={`https://tv.777exch.live/${type}`}
        title="Casino Stream"
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        style={{
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
};

export default CasinoIframeTV;