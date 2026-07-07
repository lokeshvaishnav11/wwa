const express = require("express");
const Redis = require("ioredis");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const axios = require("axios").default;

const Match = require("./models/Match.model");

const dsn ="mongodb://chero:chero0908nitin@62.72.58.167:27017/nchero?authSource=admin&replicaSet=rs0";
  

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());

// ---------------- DB Connection ----------------
const setConnection = async () => {
  try {
    await mongoose.connect(dsn);
    console.log("✅ DataBase Connected Successfully");
  } catch (err) {
    console.log("❌ error in connecting DataBase", err);
    process.exit(1);
  }
};

// ---------------- Redis Connection ----------------
const publisher = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

publisher.on("connect", () => {
  console.log("✅ Successfully connected to Redis");
});

publisher.on("error", (err) => {
  console.log("❌ Redis error:", err?.message || err);
});

// ---------------- In-memory store ----------------
let matches = []; // active matches list
const FancyData = {}; // FancyData[matchId] = array

// ---------------- Fetch active matches ----------------
const getMatches = async () => {
  try {
    const list = await Match.find({ active: true }).lean();
    matches = list || [];
    // console.log("Active matches:", matches.length);
  } catch (err) {
    console.log("❌ error in fetching matches:", err?.message || err);
  }
};

// ---------------- Fetch Fancy API Data ----------------
const getFancyDataApi = async () => {
  try {
    if (!matches || matches.length === 0) return;

    // parallel requests (but safe)
    await Promise.all(
      matches.map(async (m) => {
        try {
          // const url = `http://130.250.191.212:3009/getPriveteData?gmid=${m?.matchId}&sid=${m?.sportId}&key=dijbfuwd719e12rqhfbjdqdnkqnd11eqdqdnkanknakn`;

          const res = await axios.get(
          `https://docs.vkmster.com/sportapi/privateData?sportsid=4&gmid=${m.matchId}`,        {
          headers: {
            "x-api-key": "ad555ec066072775e43d341ae92b57a3a0718fa2",
            "x-api-secret":
              "864d26332d6fb6649a2251750884bdec4df3bf42800f4253c90a52a179a210e7",
          },
        }
      )  

          FancyData[m?.matchId] = res?.data?.data?.data || [];
        } catch (err) {
          console.log(
            `❌ Fancy API error matchId=${m?.matchId}:`,
            err?.message || err
          );
        }
      })
    );
  } catch (err) {
    console.log("❌ getFancyDataApi error:", err?.message || err);
  }
};

// ---------------- Format fancy + Redis store + socket emit ----------------
const formattedFancyData = async () => {
  try {
    if (!matches || matches.length === 0) return;

    for (const m of matches) {
      const data = FancyData[m.matchId];

      if (!data || !Array.isArray(data) || data.length === 0) continue;

      // ✅ FIXED FILTER (must be &&)
      const fancydata = data
       .filter(
  (fb) =>
    !fb.mname.includes("Bookmaker") &&
    fb.mname !== "MATCH_ODDS" &&
    fb.mname !== "TIED_MATCH" &&
    fb.gtype !== "cricketcasino"
)
        .flatMap((f) =>
          (f.section || []).map((fa) => ({
            BackPrice1: fa?.odds?.[0]?.odds || 0,
            BackPrice2: 0,
            BackPrice3: 0,
            BackSize1: fa?.odds?.[0]?.size || 0,
            BackSize2: 0,
            BackSize3: 0,

            LayPrice1: fa?.odds?.[1]?.odds || 0,
            LayPrice2: 0,
            LayPrice3: 0,
            LaySize1: fa?.odds?.[1]?.size || 0,
            LaySize2: 0,
            LaySize3: 0,

            RunnerName: fa?.nat,
            SelectionId: fa?.sid,

            ballsess: "1",
            gtype: f?.gtype,
            GameStatus: fa?.gstatus,
            gtstatus: fa?.gstatus,

            max: "50000",
            min: "100",
            remm: "",
            srno: fa?.sno?.toString(),
            mname: f?.mname,
          }))
        );

      const redisKey = `fancy-${m.matchId}`;

      // previous fancy from redis
      const previousFancyStr = await publisher.get(redisKey);
      let pfancy = [];
      if (previousFancyStr) {
        try {
          pfancy = JSON.parse(previousFancyStr);
        } catch (e) {
          pfancy = [];
        }
      }

      const currentSelectionIds = new Set(
        fancydata.map((item) => item.SelectionId)
      );
      const previousSelectionIds = new Set(
        pfancy.map((item) => item.SelectionId)
      );

      // Emit new fancy added
      for (const item of fancydata) {
        if (!previousSelectionIds.has(item.SelectionId)) {
          io.emit("newFancyAdded", {
            fancy: { matchId: m.matchId, ...item },
            matchId: m.matchId,
          });
        }
      }

      // Emit deactivated fancy
      const deactivated = pfancy.filter(
        (oldItem) => !currentSelectionIds.has(oldItem.SelectionId)
      );

      if (deactivated.length > 0) {
        io.emit("deactivateFancy", {
          [m.matchId]: deactivated.map((d) => d.SelectionId?.toString()),
        });
      }

      // Save updated fancy to Redis
      await publisher.set(redisKey, JSON.stringify(fancydata));
      console.log(`✅ Saved ${redisKey} to Redis`);
    }
  } catch (err) {
    console.log("❌ formattedFancyData error:", err?.message || err);
  }
};

// ---------------- BookMaker Odds Data ----------------
const BookMakerOddsData = async () => {
  try {
    if (!matches || matches.length === 0) return;

    for (const m of matches) {
      const allFancy = FancyData[m.matchId];
      if (!allFancy || !Array.isArray(allFancy)) continue;

      // Bookmaker / match type
      const bData = allFancy.filter((x) => {
        const gtype = (x?.gtype || "").toLowerCase();

        return (
          gtype.includes("match") ||
          gtype.includes("cricketcasino")
        );
      });


      if (!bData || bData.length === 0) continue;

      for (const Data of bData) {
        try {
          const transformRunners = (inputRunners) => {
            return {
              runners: (inputRunners || []).map((runner) => {
                const oddsArr = runner?.odds || [];

                const backOdds = oddsArr.filter((odd) => odd.otype === "back");
                const layOdds = oddsArr.filter((odd) => odd.otype === "lay");

                const backoddsmain = [...backOdds]
                  .reverse()
                  .map((x) => ({ size: x.size, price: x.odds  })); //x.odds 

                const layoddsmain = layOdds.map((x) => ({
                  size: x.size,
                  price: x.odds,
                }));

                return {
                  selectionId: runner.sid,
                  status: runner.gstatus.toUpperCase(),
                  lastPriceTraded: null,
                  runnerName: runner.nat,
                  totalMatched: 0,
                  ex: {
                    availableToBack: backoddsmain,
                    availableToLay: layoddsmain,
                  },
                };
              }),
            };
          };

          const output = transformRunners(Data?.section);

          const marketPayload = {
            ...Data,
            runners: output.runners,
            marketName: Data?.mname,
            marketId: Data?.mid?.toString(),
            matchId: Data?.gmid?.toString(),
          };

          if (!marketPayload.marketId) continue;

          const jsonMessage = JSON.stringify(marketPayload);

          await publisher.set(`odds-market-${marketPayload.marketId}`, jsonMessage);
          publisher.publish("getMarketData", jsonMessage);
        } catch (err) {
          console.log(
            `❌ BookMakerOddsData matchId=${m.matchId} error:`,
            err?.message || err
          );
        }
      }
    }
  } catch (err) {
    console.log("❌ BookMakerOddsData error:", err?.message || err);
  }
};

// ---------------- Start App ----------------
const start = async () => {
  await setConnection();

  // initial fetch
  await getMatches();
  await getFancyDataApi();

  // 🔥 Intervals (optimized)
  setInterval(getMatches, 5000); // every 5 sec (not 1 sec)
  setInterval(getFancyDataApi, 1000);
  setInterval(formattedFancyData, 1000);
  setInterval(BookMakerOddsData, 900);

  const PORT = 3030;
  server.listen(PORT, () => {
    console.log(`🚀 Socket Server running on port ${PORT}`);
  });
};

start();
