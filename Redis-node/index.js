// const express = require("express");
// const Redis = require("ioredis");
// const http = require("http");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const axios = require("axios").default;

// const Match = require("./models/Match.model");

// const dsn ="mongodb://chero:chero0908nitin@62.72.58.167:27017/nchero?authSource=admin&replicaSet=rs0";
  

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// app.use(express.json());

// // ---------------- DB Connection ----------------
// const setConnection = async () => {
//   try {
//     await mongoose.connect(dsn);
//     console.log("✅ DataBase Connected Successfully");
//   } catch (err) {
//     console.log("❌ error in connecting DataBase", err);
//     process.exit(1);
//   }
// };

// // ---------------- Redis Connection ----------------
// const publisher = new Redis({
//   host: "127.0.0.1",
//   port: 6379,
// });

// publisher.on("connect", () => {
//   console.log("✅ Successfully connected to Redis");
// });

// publisher.on("error", (err) => {
//   console.log("❌ Redis error:", err?.message || err);
// });

// // ---------------- In-memory store ----------------
// let matches = []; // active matches list
// const FancyData = {}; // FancyData[matchId] = array

// // ---------------- Fetch active matches ----------------
// const getMatches = async () => {
//   try {
//     const list = await Match.find({ active: true }).lean();
//     matches = list || [];
//     // console.log("Active matches:", matches.length);
//   } catch (err) {
//     console.log("❌ error in fetching matches:", err?.message || err);
//   }
// };

// // ---------------- Fetch Fancy API Data ----------------
// const getFancyDataApi = async () => {
//   try {
//     if (!matches || matches.length === 0) return;

//     // parallel requests (but safe)
//     await Promise.all(
//       matches.map(async (m) => {
//         try {
//           // const url = `http://130.250.191.212:3009/getPriveteData?gmid=${m?.matchId}&sid=${m?.sportId}&key=dijbfuwd719e12rqhfbjdqdnkqnd11eqdqdnkanknakn`;

//           const res = await axios.get(
//           `https://docs.vkmster.com/sportapi/privateData?sportsid=4&gmid=${m.matchId}`,        {
//           headers: {
//             "x-api-key": "a3f41cc1eff0e0609f70b738d9e9d6cfda7b7465",
//             "x-api-secret":
//               "06926b1891e99df1dd28f123c4935cfb87d07e4b9641f21ac99bc6f31263f946",
//           },
//         }
//       )  

//           FancyData[m?.matchId] = res?.data?.data?.data || [];
//         } catch (err) {
//           console.log(
//             `❌ Fancy API error matchId=${m?.matchId}:`,
//             err?.message || err
//           );
//         }
//       })
//     );
//   } catch (err) {
//     console.log("❌ getFancyDataApi error:", err?.message || err);
//   }
// };

// // ---------------- Format fancy + Redis store + socket emit ----------------
// const formattedFancyData = async () => {
//   try {
//     if (!matches || matches.length === 0) return;

//     for (const m of matches) {
//       const data = FancyData[m.matchId];

//       if (!data || !Array.isArray(data) || data.length === 0) continue;

//       // ✅ FIXED FILTER (must be &&)
//       const fancydata = data
//        .filter(
//   (fb) =>
//     !fb.mname.includes("Bookmaker") &&
//     fb.mname !== "MATCH_ODDS" &&
//     fb.mname !== "TIED_MATCH" &&
//     fb.gtype !== "cricketcasino"
// )
//         .flatMap((f) =>
//           (f.section || []).map((fa) => ({
//             BackPrice1: fa?.odds?.[0]?.odds || 0,
//             BackPrice2: 0,
//             BackPrice3: 0,
//             BackSize1: fa?.odds?.[0]?.size || 0,
//             BackSize2: 0,
//             BackSize3: 0,

//             LayPrice1: fa?.odds?.[1]?.odds || 0,
//             LayPrice2: 0,
//             LayPrice3: 0,
//             LaySize1: fa?.odds?.[1]?.size || 0,
//             LaySize2: 0,
//             LaySize3: 0,

//             RunnerName: fa?.nat,
//             SelectionId: fa?.sid,

//             ballsess: "1",
//             gtype: f?.gtype,
//             GameStatus: fa?.gstatus,
//             gtstatus: fa?.gstatus,

//             max: "50000",
//             min: "100",
//             remm: "",
//             srno: fa?.sno?.toString(),
//             mname: f?.mname,
//           }))
//         );

//       const redisKey = `fancy-${m.matchId}`;

//       // previous fancy from redis
//       const previousFancyStr = await publisher.get(redisKey);
//       let pfancy = [];
//       if (previousFancyStr) {
//         try {
//           pfancy = JSON.parse(previousFancyStr);
//         } catch (e) {
//           pfancy = [];
//         }
//       }

//       const currentSelectionIds = new Set(
//         fancydata.map((item) => item.SelectionId)
//       );
//       const previousSelectionIds = new Set(
//         pfancy.map((item) => item.SelectionId)
//       );

//       // Emit new fancy added
//       for (const item of fancydata) {
//         if (!previousSelectionIds.has(item.SelectionId)) {
//           io.emit("newFancyAdded", {
//             fancy: { matchId: m.matchId, ...item },
//             matchId: m.matchId,
//           });
//         }
//       }

//       // Emit deactivated fancy
//       const deactivated = pfancy.filter(
//         (oldItem) => !currentSelectionIds.has(oldItem.SelectionId)
//       );

//       if (deactivated.length > 0) {
//         io.emit("deactivateFancy", {
//           [m.matchId]: deactivated.map((d) => d.SelectionId?.toString()),
//         });
//       }

//       // Save updated fancy to Redis
//       await publisher.set(redisKey, JSON.stringify(fancydata));
//       console.log(`✅ Saved ${redisKey} to Redis`);
//     }
//   } catch (err) {
//     console.log("❌ formattedFancyData error:", err?.message || err);
//   }
// };

// // ---------------- BookMaker Odds Data ----------------
// const BookMakerOddsData = async () => {
//   try {
//     if (!matches || matches.length === 0) return;

//     for (const m of matches) {
//       const allFancy = FancyData[m.matchId];
//       if (!allFancy || !Array.isArray(allFancy)) continue;

//       // Bookmaker / match type
//       const bData = allFancy.filter((x) => {
//         const gtype = (x?.gtype || "").toLowerCase();

//         return (
//           gtype.includes("match") ||
//           gtype.includes("cricketcasino")
//         );
//       });


//       if (!bData || bData.length === 0) continue;

//       for (const Data of bData) {
//         try {
//           const transformRunners = (inputRunners) => {
//             return {
//               runners: (inputRunners || []).map((runner) => {
//                 const oddsArr = runner?.odds || [];

//                 const backOdds = oddsArr.filter((odd) => odd.otype === "back");
//                 const layOdds = oddsArr.filter((odd) => odd.otype === "lay");

//                 const backoddsmain = [...backOdds]
//                   .reverse()
//                   .map((x) => ({ size: x.size, price: x.odds  })); //x.odds 

//                 const layoddsmain = layOdds.map((x) => ({
//                   size: x.size,
//                   price: x.odds,
//                 }));

//                 return {
//                   selectionId: runner.sid,
//                   status: runner.gstatus.toUpperCase(),
//                   lastPriceTraded: null,
//                   runnerName: runner.nat,
//                   totalMatched: 0,
//                   ex: {
//                     availableToBack: backoddsmain,
//                     availableToLay: layoddsmain,
//                   },
//                 };
//               }),
//             };
//           };

//           const output = transformRunners(Data?.section);

//           const marketPayload = {
//             ...Data,
//             runners: output.runners,
//             marketName: Data?.mname,
//             marketId: Data?.mid?.toString(),
//             matchId: Data?.gmid?.toString(),
//           };

//           if (!marketPayload.marketId) continue;

//           const jsonMessage = JSON.stringify(marketPayload);

//           await publisher.set(`odds-market-${marketPayload.marketId}`, jsonMessage);
//           publisher.publish("getMarketData", jsonMessage);
//         } catch (err) {
//           console.log(
//             `❌ BookMakerOddsData matchId=${m.matchId} error:`,
//             err?.message || err
//           );
//         }
//       }
//     }
//   } catch (err) {
//     console.log("❌ BookMakerOddsData error:", err?.message || err);
//   }
// };

// const getPendingFancyList = async () => {
//   try {
//     const { data } = await axios.get(
//       "https://napi.A2Z.online/api/get-business-fancy-list"
//     );
//     console.log("lokesh")
//     return data?.data?.list || [];
//   } catch (e) {
//     console.log("Pending Fancy Error", e.message);
//     return [];
//   }
// };

// const groupFancyByMatch = (list) => {
//   return list.reduce((acc, item) => {
//     if (!acc[item.matchId]) {
//       acc[item.matchId] = [];
//     }

//     acc[item.matchId].push(item);

//     return acc;
//   }, {});
// };

// const getProviderResult = async (matchId) => {
//   try {
//     const { data } = await axios.get(
//           `https://docs.vkmster.com/sportapi/sportsResult?sportsid=4&gmid=${matchId}`,        {
//           headers: {
//             "x-api-key": "a3f41cc1eff0e0609f70b738d9e9d6cfda7b7465",
//             "x-api-secret":
//               "06926b1891e99df1dd28f123c4935cfb87d07e4b9641f21ac99bc6f31263f946",
//           },
//         }
//       ) 
//       console.log(data,"data")
//     return data?.markets || [];
//   } catch (e) {
//     console.log("Provider Error", matchId, e.message);
//     return [];
//   }
// };

// const declareFancyResult = async (payload) => {
//   try {
//     await axios.post(
//       "https://napi.A2Z.online/api/update-fancy-result",
//       payload
//     );
//   } catch (e) {
//     console.log("Declare Error", e.message);
//   }
// };

// const processMatchResult = async (matchId, pendingFancy) => {

//     const markets = await getProviderResult(matchId);

//     if (!markets.length)
//         return;

//     const jobs = [];

//     for (const fancy of pendingFancy) {

//         const market = markets.find(
//             x =>
//                 x.marketName.trim().toLowerCase() ===
//                 fancy.selectionName.trim().toLowerCase()
//         );

//         if (!market)
//             continue;

//         if (market.status !== "SETTLE")
//             continue;

//         jobs.push(

//             declareFancyResult({

//                 message: "ok",

//                 result: String(market.winnerId),

//                 runnerName: fancy.selectionName,

//                 matchId: fancy.matchId,

//                 isRollback: false

//             })

//         );

//     }

//     await Promise.allSettled(jobs);

// }

// const processPendingFancyResult = async () => {

//     const list = await getPendingFancyList();

//     if (!list.length)
//         return;

//     const grouped = groupFancyByMatch(list);

//     const jobs = [];

//     for (const matchId in grouped) {

//         jobs.push(

//             processMatchResult(
//                 Number(matchId),
//                 grouped[matchId]
//             )

//         );

//     }

//     await Promise.allSettled(jobs);

// }

// // ---------------- Start App ----------------
// const start = async () => {
//   await setConnection();

//   // initial fetch
//   await getMatches();
//   await getFancyDataApi();

//   // 🔥 Intervals (optimized)
//   setInterval(getMatches, 5000); // every 5 sec (not 1 sec)
//   setInterval(getFancyDataApi, 1000);
//   setInterval(formattedFancyData, 1000);
//   setInterval(BookMakerOddsData, 900);
//   setInterval(processPendingFancyResult,2000);

//   const PORT = 3031;
//   server.listen(PORT, () => {
//     console.log(`🚀 Socket Server running on port ${PORT}`);
//   });
// };

// start();



// const express = require("express");
// const Redis = require("ioredis");
// const http = require("http");
// const { Server } = require("socket.io");
// const mongoose = require("mongoose");
// const axios = require("axios").default;

// const Match = require("./models/Match.model");

// // Mongo DSN
// const dsn = process.env.MONGO_URI || "mongodb://chero:chero0908nitin@62.72.58.167:27017/atoz?authSource=admin&replicaSet=rs0";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// app.use(express.json());

// // ---------------- DB Connection ----------------
// const setConnection = async () => {
//   try {
//     await mongoose.connect(dsn);
//     console.log("✅ DataBase Connected Successfully");
//   } catch (err) {
//     console.log("❌ error in connecting DataBase", err);
//     process.exit(1);
//   }
// };

// // ---------------- Redis Connection ----------------
// const publisher = new Redis({
//   host: "127.0.0.1",
//   port: 6379,
// });

// publisher.on("connect", () => {
//   console.log("✅ Successfully connected to Redis");
// });

// publisher.on("error", (err) => {
//   console.log("❌ Redis error:", err?.message || err);
// });

// // ---------------- In-memory store ----------------
// let matches = []; // active matches list
// const FancyData = {}; // FancyData[matchId] = array

// // ---------------- Fetch active matches + RAM Cleanup ----------------
// const getMatches = async () => {
//   try {
//     const list = await Match.find({ active: true }).lean();
//     matches = list || [];

//     // 🧹 MEMORY LEAK CLEANUP: Purane inactive matches ko RAM (FancyData) se delete karo
//     const activeMatchIds = new Set(matches.map((m) => String(m.matchId)));
//     Object.keys(FancyData).forEach((matchId) => {
//       if (!activeMatchIds.has(String(matchId))) {
//         delete FancyData[matchId];
//       }
//     });

//   } catch (err) {
//     console.log("❌ error in fetching matches:", err?.message || err);
//   }
// };

// // ---------------- Fetch Fancy API Data ----------------
// const getFancyDataApi = async () => {
//   try {
//     if (!matches || matches.length === 0) return;

//     // Parallel requests (safe)
//     await Promise.all(
//       matches.map(async (m) => {
//         try {
//           const res = await axios.get(
//             `http://165.232.177.161:3088/data/v1?sportsid=4&gmid=${m.matchId}&marketId=${m.matchId}&key=lokesh8279`,
//             {
//           headers: {
//             "x-api-key": "1cfdeb5a7b55d02111f3e2bd324f609f2330c928",
//             "x-api-secret":
//               "0e3be4c11c551261575a87b50a0b14da1c87c50aada2770c765a1ed6f2d5b84b",
//           },
//         }
//           );

//           console.log (res?.data?.data?.data ,"FRGYHUJIOP")

//           FancyData[m?.matchId] = res?.data?.data?.data || [];
//         } catch (err) {
//           console.log(
//             `❌ Fancy API error matchId=${m?.matchId}:`,
//             err?.message || err
//           );
//         }
//       })
//     );
//   } catch (err) {
//     console.log("❌ getFancyDataApi error:", err?.message || err);
//   }
// };

// // ---------------- Format fancy + Redis store + socket emit ----------------
// const formattedFancyData = async () => {
//   try {
//     if (!matches || matches.length === 0) return;

//     for (const m of matches) {
//       const data = FancyData[m.matchId];

//       if (!data || !Array.isArray(data) || data.length === 0) continue;

//       const fancydata = data
//         .filter(
//           (fb) =>
//             !fb.mname.includes("Bookmaker") &&
//             fb.mname !== "MATCH_ODDS" &&
//             fb.mname !== "TIED_MATCH" &&
//             fb.gtype !== "cricketcasino" && fb.gtype == "fancy"
//         )
//         .flatMap((f) =>
//           (f.section || []).map((fa) => ({
//             BackPrice1: fa?.odds?.[2]?.odds || fa?.odds?.[0]?.odds ||0,
//             BackPrice2: 0,
//             BackPrice3: 0,
//             BackSize1: fa?.odds?.[2]?.size || fa?.odds?.[0]?.size || 0,
//             BackSize2: 0,
//             BackSize3: 0,

//             LayPrice1: fa?.odds?.[4]?.odds || fa?.odds?.[1]?.odds || 0,
//             LayPrice2: 0,
//             LayPrice3: 0,
//             LaySize1: fa?.odds?.[4]?.size || fa?.odds?.[1]?.size || 0,
//             LaySize2: 0,
//             LaySize3: 0,

//             RunnerName: fa?.nat,
//             SelectionId: fa?.sid,

//             ballsess: "1",
//             gtype: f?.gtype,
//             GameStatus: fa?.gstatus,
//             gtstatus: fa?.gstatus,

//             max: "50000",
//             min: "100",
//             rem: fa?.rem,
//             srno: fa?.sno?.toString(),
//             mname: f?.mname,
//           }))
//         );

//       const redisKey = `fancy-${m.matchId}`;

//       // previous fancy from redis
//       const previousFancyStr = await publisher.get(redisKey);
//       let pfancy = [];
//       if (previousFancyStr) {
//         try {
//           pfancy = JSON.parse(previousFancyStr);
//         } catch (e) {
//           pfancy = [];
//         }
//       }

//       const currentSelectionIds = new Set(
//         fancydata.map((item) => item.SelectionId)
//       );
//       const previousSelectionIds = new Set(
//         pfancy.map((item) => item.SelectionId)
//       );

//       // Emit new fancy added
//       for (const item of fancydata) {
//         if (!previousSelectionIds.has(item.SelectionId)) {
//           io.emit("newFancyAdded", {
//             fancy: { matchId: m.matchId, ...item },
//             matchId: m.matchId,
//           });
//         }
//       }

//       // Emit deactivated fancy
//       const deactivated = pfancy.filter(
//         (oldItem) => !currentSelectionIds.has(oldItem.SelectionId)
//       );

//       if (deactivated.length > 0) {
//         io.emit("deactivateFancy", {
//           [m.matchId]: deactivated.map((d) => d.SelectionId?.toString()),
//         });
//       }

//       // 💥 ADDED TTL: Safe 3 Seconds Expiry on Fancy Data
//       await publisher.set(redisKey, JSON.stringify(fancydata), "EX", 3);
//     }
//   } catch (err) {
//     console.log("❌ formattedFancyData error:", err?.message || err);
//   }
// };

// // ---------------- BookMaker Odds Data ----------------
// const BookMakerOddsData = async () => {
//   try {
//     if (!matches || matches.length === 0) return;

//     for (const m of matches) {
//       const allFancy = FancyData[m.matchId];
//       if (!allFancy || !Array.isArray(allFancy)) continue;

//       // Bookmaker / match type
//       const bData = allFancy.filter((x) => {
//         const gtype = (x?.gtype || "").toLowerCase();
//         return gtype.includes("match") || gtype.includes("cricketcasino");
//       });

//       if (!bData || bData.length === 0) continue;

//       for (const Data of bData) {
//         try {
//           const transformRunners = (inputRunners) => {
//             return {
//               runners: (inputRunners || []).map((runner) => {
//                 const oddsArr = runner?.odds || [];

//                 const backOdds = oddsArr.filter((odd) => odd.otype === "back");
//                 const layOdds = oddsArr.filter((odd) => odd.otype === "lay");

//                 const backoddsmain = [...backOdds]
//                   .reverse()
//                   .map((x) => ({ size: x.size, price: x.odds }));

//                 const layoddsmain = layOdds.map((x) => ({
//                   size: x.size,
//                   price: x.odds,
//                 }));

//                 return {
//                   selectionId: runner.sid,
//                   status: runner.gstatus.toUpperCase(),
//                   lastPriceTraded: null,
//                   runnerName: runner.nat,
//                   totalMatched: 0,
//                   ex: {
//                     availableToBack: backoddsmain,
//                     availableToLay: layoddsmain,
//                   },
//                 };
//               }),
//             };
//           };

//           const output = transformRunners(Data?.section);

//           const marketPayload = {
//             ...Data,
//             runners: output.runners,
//             marketName: Data?.mname,
//             marketId: Data?.mid?.toString(),
//             matchId: Data?.gmid?.toString(),
//           };

//           if (!marketPayload.marketId) continue;

//           const jsonMessage = JSON.stringify(marketPayload);

//           // 💥 ADDED TTL: Safe 2 Seconds Expiry for Odds Data
//           await publisher.set(`odds-market-${marketPayload.marketId}`, jsonMessage, "EX", 2);
//           publisher.publish("getMarketData", jsonMessage);
//         } catch (err) {
//           console.log(
//             `❌ BookMakerOddsData matchId=${m.matchId} error:`,
//             err?.message || err
//           );
//         }
//       }
//     }
//   } catch (err) {
//     console.log("❌ BookMakerOddsData error:", err?.message || err);
//   }
// };

// // // ---------------- Fancy Results Processors ----------------
// // const getPendingFancyList = async () => {
// //   try {
// //     const { data } = await axios.get(
// //       "https://api.a2zlive.shop/api/get-business-fancy-list"
// //     );
// //     return data?.data?.list || [];
// //   } catch (e) {
// //     console.log("Pending Fancy Error", e.message);
// //     return [];
// //   }
// // };

// // const groupFancyByMatch = (list) => {
// //   return list.reduce((acc, item) => {
// //     if (!acc[item.matchId]) {
// //       acc[item.matchId] = [];
// //     }
// //     acc[item.matchId].push(item);
// //     return acc;
// //   }, {});
// // };

// // const getProviderResult = async (matchId) => {
// //   try {
// //     const { data } = await axios.get(
// //       `https://docs.vkmster.com/sportapi/sportsResult?sportsid=4&gmid=${matchId}`,
// //       {
// //         headers: {
// //           "x-api-key": "a3f41cc1eff0e0609f70b738d9e9d6cfda7b7465",
// //           "x-api-secret":
// //             "06926b1891e99df1dd28f123c4935cfb87d07e4b9641f21ac99bc6f31263f946",
// //         },
// //       }
// //     );
// //     return data?.markets || [];
// //   } catch (e) {
// //     console.log("Provider Error", matchId, e.message);
// //     return [];
// //   }
// // };

// // const declareFancyResult = async (payload) => {
// //   try {
// //     await axios.post(
// //       "https://api.a2zlive.shop/api/update-fancy-result",
// //       payload
// //     );
// //   } catch (e) {
// //     console.log("Declare Error", e.message);
// //   }
// // };

// // const processMatchResult = async (matchId, pendingFancy) => {
// //   const markets = await getProviderResult(matchId);
// //   if (!markets.length) return;

// //   const jobs = [];

// //   for (const fancy of pendingFancy) {
// //     const market = markets.find(
// //       (x) =>
// //         x.marketName.trim().toLowerCase() ===
// //         fancy.selectionName.trim().toLowerCase()
// //     );

// //     if (!market || market.status !== "SETTLE") continue;

// //     jobs.push(
// //       declareFancyResult({
// //         message: "ok",
// //         result: String(market.winnerId),
// //         runnerName: fancy.selectionName,
// //         matchId: fancy.matchId,
// //         isRollback: false,
// //       })
// //     );
// //   }

// //   await Promise.allSettled(jobs);
// // };

// // const processPendingFancyResult = async () => {
// //   const list = await getPendingFancyList();
// //   if (!list.length) return;

// //   const grouped = groupFancyByMatch(list);
// //   const jobs = [];

// //   for (const matchId in grouped) {
// //     jobs.push(processMatchResult(Number(matchId), grouped[matchId]));
// //   }

// //   await Promise.allSettled(jobs);
// // };

// // ---------------- Fancy Results Processors ----------------

// const FANCY_APIS = [
//   "https://api.a2zlive.shop",
//   "https://api.star-99.com",
//   "https://api.betx99.co",
// ];

// const getPendingFancyList = async () => {
//   const responses = await Promise.allSettled(
//     FANCY_APIS.map(async (baseUrl) => {
//       const { data } = await axios.get(
//         `${baseUrl}/api/get-business-fancy-list`
//       );

//       const list = data?.data?.list || [];

//       // Source backend save kar rahe hain,
//       // taaki result usi backend me declare ho.
//       return list.map((item) => ({
//         ...item,
//         __baseUrl: baseUrl,
//       }));
//     })
//   );

//   const finalList = [];

//   responses.forEach((response, index) => {
//     if (response.status === "fulfilled") {
//       finalList.push(...response.value);
//     } else {
//       console.log(
//         "Pending Fancy Error:",
//         FANCY_APIS[index],
//         response.reason?.message
//       );
//     }
//   });

//   return finalList;
// };


// const groupFancyByMatch = (list) => {
//   return list.reduce((acc, item) => {
//     if (!acc[item.matchId]) {
//       acc[item.matchId] = [];
//     }

//     acc[item.matchId].push(item);
//     return acc;
//   }, {});
// };


// const getProviderResult = async (matchId) => {
//   try {
//     const { data } = await axios.get(
//       `http://165.232.177.161:3088/sportapi/sportsResult?sportsid=4&gmid=${matchId}&key=lokesh8279`,
//       {
//         headers: {
//           "x-api-key": "1cfdeb5a7b55d02111f3e2bd324f609f2330c928",
//           "x-api-secret":
//             "0e3be4c11c551261575a87b50a0b14da1c87c50aada2770c765a1ed6f2d5b84b",
//         },
//       }
//     );

//     return data?.markets || [];
//   } catch (e) {
//     console.log("Provider Error", matchId, e.message);
//     return [];
//   }
// };


// const declareFancyResult = async (baseUrl, payload) => {
//   try {
//     await axios.post(
//       `${baseUrl}/api/update-fancy-result`,
//       payload
//     );
//   } catch (e) {
//     console.log(
//       "Declare Error:",
//       baseUrl,
//       payload?.matchId,
//       payload?.runnerName,
//       e.message
//     );
//   }
// };


// const processMatchResult = async (matchId, pendingFancy) => {
//   const markets = await getProviderResult(matchId);

//   if (!markets.length) return;

//   const jobs = [];

//   for (const fancy of pendingFancy) {
//     const market = markets.find(
//       (x) =>
//         x.marketName?.trim().toLowerCase() ===
//         fancy.selectionName?.trim().toLowerCase()
//     );

//     if (!market || market.status !== "SETTLE") {
//       continue;
//     }

//     jobs.push(
//       declareFancyResult(
//         fancy.__baseUrl,
//         {
//           message: "ok",
//           result: String(market.winnerId),
//           runnerName: fancy.selectionName,
//           matchId: fancy.matchId,
//           isRollback: false,
//         }
//       )
//     );
//   }

//   await Promise.allSettled(jobs);
// };


// const processPendingFancyResult = async () => {
//   const list = await getPendingFancyList();

//   if (!list.length) return;

//   const grouped = groupFancyByMatch(list);
//   const jobs = [];

//   for (const matchId in grouped) {
//     jobs.push(
//       processMatchResult(
//         Number(matchId),
//         grouped[matchId]
//       )
//     );
//   }

//   await Promise.allSettled(jobs);
// };
// // ---------------- Start App ----------------

// const start = async () => {
//   const PORT = Number(process.env.PORT || 3031);

//   // 1. Server sabse pehle start karo
//   server.listen(PORT, () => {
//     console.log(`🚀 Socket & Redis Engine running on port ${PORT}`);
//   });

//   server.on("error", (err) => {
//     console.error("❌ Server Error:", err.message);
//   });

//   // 2. MongoDB connection
//   console.log("⏳ Connecting MongoDB...");
//   await setConnection();
//   console.log("✅ MongoDB connected");

//   // 3. Active matches fetch
//   console.log("⏳ Fetching matches...");
//   await getMatches();
//   console.log(`✅ Active matches: ${matches.length}`);

//   // 4. Prevent overlapping jobs
//   const runJob = (name, fn, interval) => {
//     let running = false;

//     const execute = async () => {
//       if (running) return;

//       running = true;

//       try {
//         await fn();
//       } catch (err) {
//         console.error(`❌ ${name}:`, err.message);
//       } finally {
//         running = false;
//       }
//     };

//     execute();
//     setInterval(execute, interval);
//   };

//   // 5. Start background jobs
//   runJob("Matches", getMatches, 5000);
//   runJob("Fancy API", getFancyDataApi, 1000);
//   runJob("Fancy Redis", formattedFancyData, 1000);
//   runJob("Bookmaker", BookMakerOddsData, 900);
//   runJob("Results", processPendingFancyResult, 2000);

//   console.log("✅ All background jobs started");
// };

// start().catch((err) => {
//   console.error("❌ Startup failed:", err.message);
// });





const express = require("express");
const Redis = require("ioredis");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const axios = require("axios").default;

const Match = require("./models/Match.model");

// Mongo DSN
const dsn ="mongodb://chero:chero0908nitin@62.72.58.167:27017/atoz?authSource=admin&replicaSet=rs0";
if (!dsn) { console.error('MONGO_URI is required'); process.exit(1); }

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
const fancyUpdatedAt = new Map();
const providerRetryAt = new Map();
const providerLastWarningAt = new Map();
const jobStats = {};
const FANCY_TIMEOUT_MS = Number(process.env.FANCY_TIMEOUT_MS || 6000);
const RESULT_TIMEOUT_MS = Number(process.env.RESULT_TIMEOUT_MS || 8000);
const FANCY_TTL_SECONDS = Number(process.env.FANCY_TTL_SECONDS || 10);
const ODDS_TTL_SECONDS = Number(process.env.ODDS_TTL_SECONDS || 10);
const MAX_FANCY_CONCURRENCY = Math.max(1, Number(process.env.MAX_FANCY_CONCURRENCY || 8));
const RESULT_404_RETRY_MS = Number(process.env.RESULT_404_RETRY_MS || 60000);
const FANCY_FRESH_MS = Number(process.env.FANCY_FRESH_MS || 12000);
// if (!process.env.SPORT_API_KEY || !process.env.SPORT_API_SECRET) { console.error('SPORT_API_KEY and SPORT_API_SECRET are required'); process.exit(1); }
const logError = (name, err) => console.error(`[${name}]`, err?.message || err);

app.get('/health', (_req, res) => {
  const now = Date.now();
  res.json({
    ok: mongoose.connection.readyState === 1 && publisher.status === 'ready',
    mongo: mongoose.connection.readyState,
    redis: publisher.status,
    activeMatches: matches.length,
    freshFancyMatches: [...fancyUpdatedAt.values()].filter(t => now - t < FANCY_FRESH_MS).length,
    jobs: jobStats,
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// ---------------- Fetch active matches + RAM Cleanup ----------------
const getMatches = async () => {
  try {
    const list = await Match.find({ active: true }).lean();
    matches = list || [];

    // 🧹 MEMORY LEAK CLEANUP: Purane inactive matches ko RAM (FancyData) se delete karo
    const activeMatchIds = new Set(matches.map((m) => String(m.matchId)));
    Object.keys(FancyData).forEach((matchId) => {
      if (!activeMatchIds.has(String(matchId))) {
        delete FancyData[matchId];
        fancyUpdatedAt.delete(String(matchId));
      }
    });

  } catch (err) {
    console.log("❌ error in fetching matches:", err?.message || err);
  }
};

// ---------------- Fetch Fancy API Data ----------------
const getFancyDataApi = async () => {
  if (!matches.length) return;
  const currentMatches = [...matches];
  let success = 0;
  let failed = 0;
  let cursor = 0;
  const worker = async () => {
    while (cursor < currentMatches.length) {
      const m = currentMatches[cursor++];
      const id = String(m.matchId);
      try {
        const res = await axios.get('http://165.232.177.161:3088/data/v1', {
          params: { sportsid: 4, gmid: id, marketId: id, key: 'lokesh8279' },
          // headers: {
          //   'x-api-key': process.env.SPORT_API_KEY,
          //   'x-api-secret': process.env.SPORT_API_SECRET
          // },
          timeout: FANCY_TIMEOUT_MS
        });
        const data = res?.data?.data?.data;
        if (!Array.isArray(data)) throw new Error('Unexpected fancy response structure');
        FancyData[id] = data;
        fancyUpdatedAt.set(id, Date.now());
        success++;
      } catch (err) {
        failed++;
        logError(`Fancy API match=${id} status=${err.response?.status || '-'}`, err);
        // Preserve last good data; freshness checks prevent stale Redis writes.
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(MAX_FANCY_CONCURRENCY, currentMatches.length) }, worker));
  if (process.env.DEBUG_FANCY === '1') {
    console.log(`[Fancy] matches=${currentMatches.length} success=${success} failed=${failed}`);
  }
};

// ---------------- Format fancy + Redis store + socket emit ----------------
const formattedFancyData = async () => {
  try {
    if (!matches || matches.length === 0) return;

    for (const m of matches) {
      const data = FancyData[m.matchId];

      if (!Array.isArray(data) || Date.now() - (fancyUpdatedAt.get(String(m.matchId)) || 0) > FANCY_FRESH_MS) continue;

      const fancydata = data
        .filter(
          (fb) =>
            !(fb?.mname || "").includes("Bookmaker") &&
            fb.mname !== "MATCH_ODDS" &&
            fb.mname !== "TIED_MATCH" &&
            fb.gtype !== "cricketcasino" && fb.gtype == "fancy"
        )
        .flatMap((f) =>
          (f.section || []).map((fa) => ({
            BackPrice1: fa?.odds?.[2]?.odds || fa?.odds?.[0]?.odds ||0,
            BackPrice2: 0,
            BackPrice3: 0,
            BackSize1: fa?.odds?.[2]?.size || fa?.odds?.[0]?.size || 0,
            BackSize2: 0,
            BackSize3: 0,

            LayPrice1: fa?.odds?.[4]?.odds || fa?.odds?.[1]?.odds || 0,
            LayPrice2: 0,
            LayPrice3: 0,
            LaySize1: fa?.odds?.[4]?.size || fa?.odds?.[1]?.size || 0,
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
            rem: fa?.rem,
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

      // 💥 ADDED TTL: Safe 3 Seconds Expiry on Fancy Data
      await publisher.set(redisKey, JSON.stringify(fancydata), "EX", FANCY_TTL_SECONDS);
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
      if (!Array.isArray(allFancy) || Date.now() - (fancyUpdatedAt.get(String(m.matchId)) || 0) > FANCY_FRESH_MS) continue;

      // Bookmaker / match type
      const bData = allFancy.filter((x) => {
        const gtype = (x?.gtype || "").toLowerCase();
        return gtype.includes("match") || gtype.includes("cricketcasino");
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
                  .map((x) => ({ size: x.size, price: x.odds }));

                const layoddsmain = layOdds.map((x) => ({
                  size: x.size,
                  price: x.odds,
                }));

                return {
                  selectionId: runner.sid,
                  status: String(runner.gstatus || "").toUpperCase(),
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

          // 💥 ADDED TTL: Safe 2 Seconds Expiry for Odds Data
          await publisher.set(`odds-market-${marketPayload.marketId}`, jsonMessage, "EX", ODDS_TTL_SECONDS);
          await publisher.publish("getMarketData", jsonMessage);
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

// ---------------- Fancy Results Processors ----------------

const FANCY_APIS = [
  "https://api.a2zlive.shop",
  "https://api.star-99.com",
  "https://api.betx99.co",
];

const getPendingFancyList = async () => {
  const responses = await Promise.allSettled(
    FANCY_APIS.map(async (baseUrl) => {
      const { data } = await axios.get(
        `${baseUrl}/api/get-business-fancy-list`, { timeout: RESULT_TIMEOUT_MS }
      );

      const list = data?.data?.list || [];

      // Source backend save kar rahe hain,
      // taaki result usi backend me declare ho.
      return list.map((item) => ({
        ...item,
        __baseUrl: baseUrl,
      }));
    })
  );

  const finalList = [];

  responses.forEach((response, index) => {
    if (response.status === "fulfilled") {
      finalList.push(...response.value);
    } else {
      console.log(
        "Pending Fancy Error:",
        FANCY_APIS[index],
        response.reason?.message
      );
    }
  });

  return finalList;
};


const groupFancyByMatch = (list) => {
  return list.reduce((acc, item) => {
    if (!acc[item.matchId]) {
      acc[item.matchId] = [];
    }

    acc[item.matchId].push(item);
    return acc;
  }, {});
};


const getProviderResult = async (matchId) => {
  const id = String(matchId);
  if (Date.now() < (providerRetryAt.get(id) || 0)) return [];
  try {
    const { data } = await axios.get('http://165.232.177.161:3088/sportapi/sportsResult', {
      params: { sportsid: 4, gmid: id, key: 'lokesh8279' },
      // headers: {
      //   'x-api-key': process.env.SPORT_API_KEY,
      //   'x-api-secret': process.env.SPORT_API_SECRET
      // },
      timeout: RESULT_TIMEOUT_MS
    });
    providerRetryAt.delete(id);
    return Array.isArray(data?.markets) ? data.markets : [];
  } catch (err) {
    const status = err.response?.status;
    if (status === 404) providerRetryAt.set(id, Date.now() + RESULT_404_RETRY_MS);
    const last = providerLastWarningAt.get(id) || 0;
    if (Date.now() - last > 30000) {
      logError(`Provider result match=${id} status=${status || '-'}`, err);
      providerLastWarningAt.set(id, Date.now());
    }
    return [];
  }
};

const declareFancyResult = async (baseUrl, payload) => {
  try {
    await axios.post(
      `${baseUrl}/api/update-fancy-result`,
      payload, { timeout: RESULT_TIMEOUT_MS }
    );
  } catch (e) {
    console.log(
      "Declare Error:",
      baseUrl,
      payload?.matchId,
      payload?.runnerName,
      e.message
    );
  }
};


const processMatchResult = async (matchId, pendingFancy) => {
  const markets = await getProviderResult(matchId);

  if (!markets.length) return;

  const jobs = [];

  for (const fancy of pendingFancy) {
    const market = markets.find(
      (x) =>
        x.marketName?.trim().toLowerCase() ===
        fancy.selectionName?.trim().toLowerCase()
    );

    if (!market || market.status !== "SETTLE") {
      continue;
    }

    jobs.push(
      declareFancyResult(
        fancy.__baseUrl,
        {
          message: "ok",
          result: String(market.winnerId),
          runnerName: fancy.selectionName,
          matchId: fancy.matchId,
          isRollback: false,
        }
      )
    );
  }

  await Promise.allSettled(jobs);
};


const processPendingFancyResult = async () => {
  const list = await getPendingFancyList();

  if (!list.length) return;

  const grouped = groupFancyByMatch(list);
  const jobs = [];

  for (const matchId in grouped) {
    jobs.push(
      processMatchResult(
        Number(matchId),
        grouped[matchId]
      )
    );
  }

  await Promise.allSettled(jobs);
};


// ---------------- BOOKMAKER RESULT PROCESSOR ----------------

// Successfully sent results ko repeat nahi karenge
const bookmakerResultSent = new Set();

// Ek time par duplicate processing avoid
let bookmakerResultRunning = false;

const processBookmakerResult = async () => {
  if (bookmakerResultRunning) return;

  bookmakerResultRunning = true;

  try {
    // Existing active matches
    const currentMatches = [...matches];

    // Limited concurrency - low server load
    const concurrency = 3;
    let cursor = 0;

    const worker = async () => {
      while (cursor < currentMatches.length) {
        const match = currentMatches[cursor++];
        const matchId = String(match.matchId);

        try {
          // Existing result provider API reuse
          const markets = await getProviderResult(matchId);

          if (!Array.isArray(markets) || !markets.length) {
            continue;
          }

          const bookmakerResults = markets.filter((market) => {
            return (
              String(market.mname || "").trim().toUpperCase() ===
                "BOOKMAKER" &&
              String(market.status || "").trim().toUpperCase() ===
                "SETTLE" &&
              market.rollback !== true &&
              typeof market.winnerName === "string" &&
              market.winnerName.trim().length > 0
            );
          });

          for (const result of bookmakerResults) {
            const winner = result.winnerName.trim();
            const resultMatchId = String(result.gmid || matchId);

            // Same match ka result usi match ke against
            if (resultMatchId !== matchId) continue;

            for (const baseUrl of FANCY_APIS) {
              const resultKey =
                `${baseUrl}:${resultMatchId}:${result.stdtro_id || "BOOKMAKER"}:${winner}`;

              if (bookmakerResultSent.has(resultKey)) {
                continue;
              }

              try {
                await axios.get(
                  `${baseUrl}/api/match-result-by-redis`,
                  {
                    params: {
                      matchid: resultMatchId,
                      winner: winner,
                    },
                    timeout: RESULT_TIMEOUT_MS,
                  }
                );

                // Mark sent only after successful API response
                bookmakerResultSent.add(resultKey);

                console.log(
                  `[BOOKMAKER RESULT] Success match=${resultMatchId} winner=${winner} backend=${baseUrl}`
                );

              } catch (err) {
                console.error(
                  `[BOOKMAKER RESULT] Failed match=${resultMatchId} backend=${baseUrl}:`,
                  err.message
                );
              }
            }
          }

        } catch (err) {
          console.error(
            `[BOOKMAKER RESULT] Match ${matchId} error:`,
            err.message
          );
        }
      }
    };

    await Promise.all(
      Array.from(
        { length: Math.min(concurrency, currentMatches.length) },
        worker
      )
    );

  } catch (err) {
    console.error("[BOOKMAKER RESULT] Error:", err.message);
  } finally {
    bookmakerResultRunning = false;
  }
};








// ---------------- Start App ----------------
const runJob = (name, fn, ms) => {
  let running = false;
  const execute = async () => {
    if (running) return;
    running = true;
    const begin = Date.now();
    try {
      await fn();
      jobStats[name] = { lastSuccess: new Date().toISOString(), durationMs: Date.now() - begin };
    } catch (err) {
      jobStats[name] = { lastError: new Date().toISOString(), message: err.message };
      logError(name, err);
    } finally {
      running = false;
    }
  };
  execute();
  return setInterval(execute, ms);
};

const start = async () => {
  const PORT = Number(process.env.PORT || 3031);
  server.on('error', err => logError('HTTP server', err));
  server.listen(PORT, () => console.log(`🚀 Socket & Redis Engine running on port ${PORT}`));

  console.log('Connecting MongoDB...');
  await setConnection();
  await getMatches();
  console.log(`Active matches: ${matches.length}`);

  runJob('matches', getMatches, 5000);
  // Fetch once per cycle, then update Redis and publish odds from same snapshot.
  runJob('fancyPipeline', async () => {
    await getFancyDataApi();
    await formattedFancyData();
    await BookMakerOddsData();
  }, Number(process.env.FANCY_POLL_MS || 1000));
  runJob('results', processPendingFancyResult, Number(process.env.RESULT_POLL_MS || 5000));
  runJob(
  'bookmakerResults',
  processBookmakerResult,
  2 * 60 * 1000
);
  console.log('All background jobs started');
};

start().catch(err => logError('Startup', err));
