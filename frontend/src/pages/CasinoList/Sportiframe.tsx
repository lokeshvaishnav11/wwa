import React from "react";
import { useParams } from "react-router-dom";

const SportIframeTV = () => {
  const { type } = useParams();

  // ✅ Yahan apne allowed domains add karo
   const allowedDomains = [
    "localhost",
    "127.0.0.1",
    "yourdomain.com",
    "www.yourdomain.com",
    "six-run.com",
    "sixrun.pro",
    "admin.six-run.com",
    "admin.sixrun.pro"
  ];

  const currentDomain = window.location.hostname.toLowerCase();

  const isAllowedDomain = allowedDomains.some(
    (domain) => currentDomain === domain.toLowerCase()
  );

  // ❌ Domain whitelist me nahi hai
  if (!isAllowedDomain) {
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
        src={`https://tv.777exch.live/sports/${type}`}
        title="Sports Stream"
        width="100%"
        height="100%"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          display: "block",
        }}
      />
    </div>
  );
};

export default SportIframeTV;