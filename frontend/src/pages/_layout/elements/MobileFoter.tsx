// import { CustomLink } from "./custom-link";

// const MobileFooter = () => {
//      const menu = [
//     { name: "in-play", icon: "fas fa-home" , link:"/match/4"},
//     { name: "upcoming", icon: "fas fa-stopwatch" , link:"/"},
//     { name: "profit & loss", icon: "fas fa-trophy" , link:"/sports"},
//     // { name: "Casino", icon: "fas fa-dice" , link:"/casino-games"},
//     { name: "Account", icon: "fas fa-user" , link:"/account"},
//   ];
//   return (
//       <>
//       {/* 🔽 PAGE CONTENT */}
//       <div style={{ paddingBottom: "70px" }}>
//         {/* 👆 important: footer ke liye space */}
//       </div>

//       {/* 🔽 FIXED FOOTER */}
//       <div
//         className="d-flex justify-content-around align-items-center"
//         style={{
//           position: "fixed",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//           background: "linear-gradient(180deg, #1B2E39, #1B2E39)",
//           height: "65px",
//           zIndex: 99999999,
//           borderTop: "1px solid rgba(255,255,255,0.1)"
//         }}
//       >
//         {menu.map((item, i) => (
//           <CustomLink 
//                 to={item.link}
//             key={i}
//             className="d-flex flex-column align-items-center justify-content-center"
//            style={
//   item.name === "Sports"
//     ? {
//          color: "white",
//         fontSize: "12px",
//         cursor: "pointer",
//         flex: 1,
//       }
//     : {
//         color: "white",
//         fontSize: "12px",
//         cursor: "pointer",
//         flex: 1,
//       }
// }
//           >
//             {/* ✅ Casino Image */}
//             {item.name === "Casino" ? (
//               <img
//                 src="/imgs/casino.gif" // 👈 apni image path
//                 alt="casino"
//                 style={{
//                   width: "30px",
//                   height: "30px",
//                   marginBottom: "2px",
//                 }}
//               />
//             ) : (
//               <i
//                 className={item.icon}
//                 style={{ fontSize: "28px", marginBottom: "2px" }}
//               ></i>
//             )}
//             <span style={{fontSize:"13px"}}>{item.name}</span>
//           </CustomLink>
//         ))}
//       </div>
//     </>
//   );
// };
// export default MobileFooter;


// import { useState } from "react";
// import { CustomLink, useNavigateCustom } from "./custom-link";
// import { useLocation } from "react-router-dom";

// const MobileFooter = () => {
//   const location = useLocation();
//   const navigate = useNavigateCustom();
//   const [showAccountMenu, setShowAccountMenu] = useState(false);

//   const menu = [
//     { name: "In-Play", icon: "fas fa-running", link: "/match/4" },
//     { name: "Upcoming", icon: "fas fa-calendar-alt", link: "/" },
//     { name: "Profit & Loss", icon: "fas fa-trophy", link: "/new-accountstatement" },
//     // { name: "Casino", icon: "fas fa-dice", link: "/casino-games" },
//     { name: "Account", icon: "fas fa-user", link: "/account" },
//   ];

//   // 🔗 Update these paths to match your actual routes
//   const accountMenuItems = [
//     // { label: "My Ledger", link: "/my-ledger" },
//     // { label: "My Commission", link: "#" },
//     // { label: "Current Bets", link: "/current-bets" },
//     { label: "Account Statement", link: "/accountstatement" },
//     { label: "Casino Results", link: "#" },
//     { label: "Rules", link: "/rules" },
//     { label: "Secure Auth Verification", link: "#" },
//     { label: "Change Password", link: "/changepassword" },
//     { label: "Old Data", link: "#" },
//     { label: "Logout", link: "/logout" },
//   ];

//   const handleAccountItemClick = (link: string) => {
//     setShowAccountMenu(false);
//     navigate.go(link);
//   };

//  return (
//   <>
//     <div style={{ paddingBottom: "70px" }} />

//     <div
//       className="d-flex justify-content-around align-items-center"
//       style={{
//         position: "fixed",
//         bottom: 13,
//         left: 0,
//         width: "100%",
//         background: "#0d2c54",
//         height: "42px",
//         zIndex: 99999999,
//         borderTop: "1px solid rgba(255,255,255,0.1)",
//         overflow: "hidden",
//         borderRadius: "30px",
//       }}
//     >
//       {menu.map((item, i) => {
//         const isActive = location.pathname === item.link;

//         if (item.name === "Account") {
//           return (
//             <div
//               key={i}
//               onClick={() => setShowAccountMenu(true)}
//               className="d-flex flex-column align-items-center justify-content-center"
//               style={{
//                 color: "#fff",
//                 fontSize: "12px",
//                 cursor: "pointer",
//                 flex: 1,
//                 height: "100%",
//               }}
//             >
//               <i
//                 className={item.icon}
//                 style={{ fontSize: "18px", marginBottom: "2px" }}
//               />
//               <span style={{ fontSize: "12px", fontWeight: 600 }}>
//                 {item.name}
//               </span>
//             </div>
//           );
//         }

//         return (
//           <CustomLink
//             key={i}
//             to={item.link}
//             className="d-flex flex-column align-items-center justify-content-center"
//             style={{
//               color: "#fff",
//               fontSize: "12px",
//               cursor: "pointer",
//               flex: 1,
//               height: "100%",
//               position: "relative",
//               background: isActive
//                 ? "linear-gradient(180deg,#ef2d78,#d81a63)"
//                 : "transparent",
//               borderRadius: isActive ? "0 40px 40px 0" : "0",
//             }}
//           >
//             <i
//               className={item.icon}
//               style={{ fontSize: "18px", marginBottom: "2px" }}
//             />
//             <span style={{ fontSize: "12px", fontWeight: 600 }}>
//               {item.name}
//             </span>
//           </CustomLink>
//         );
//       })}
//     </div>

//     {showAccountMenu && (
//       <>
//         <div
//           onClick={() => setShowAccountMenu(false)}
//           style={{
//             position: "fixed",
//             inset: 0,
//             background: "rgba(0,0,0,.45)",
//             zIndex: 99999998,
//           }}
//         />

//         <div
//           style={{
//             position: "fixed",
//             bottom: 0,
//             left: 0,
//             right: 0,
//             background: "#0d3f87",
//             borderTopLeftRadius: "25px",
//             borderTopRightRadius: "25px",
//             zIndex: 99999999,
//             overflow: "hidden",
//           }}
//         >
//           <div
//             style={{
//               width: 60,
//               height: 5,
//               background: "#fff",
//               borderRadius: 20,
//               margin: "10px auto",
//             }}
//           />

//           {/* ✕ CLOSE BUTTON */}
//           <button
//             onClick={() => setShowAccountMenu(false)}
//             aria-label="Close menu"
//             style={{
//               position: "absolute",
//               top: 12,
//               right: 16,
//               width: 32,
//               height: 32,
//               borderRadius: "50%",
//               border: "none",
//               background: "rgba(255,255,255,0.15)",
//               color: "#fff",
//               fontSize: "18px",
//               lineHeight: 1,
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               cursor: "pointer",
//             }}
//           >
//             ✕
//           </button>

//           {accountMenuItems.map((item) => (
//             <div
//               key={item.label}
//               onClick={() => handleAccountItemClick(item.link)}
//               style={{
//                 color: "#fff",
//                 padding: "18px 22px",
//                 borderBottom: "1px solid rgba(255,255,255,.15)",
//                 fontSize: "18px",
//                 cursor: "pointer",
//               }}
//             >
//               {item.label}
//             </div>
//           ))}
//         </div>
//       </>
//     )}
//   </>
// )
// }

// export default MobileFooter;




import { useState } from "react";
import { CustomLink, useNavigateCustom } from "./custom-link";
import { useLocation } from "react-router-dom";
import { useAppDispatch } from "../../../redux/hooks";
import { logout } from "../../../redux/actions/login/loginSlice"; // 🔗 update this path/action name if different in your project

const MobileFooter = () => {
  const location = useLocation();
  const navigate = useNavigateCustom();
  const dispatch = useAppDispatch();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const menu = [
    { name: "In-Play", icon: "fas fa-running", link: "/match/4" },
    { name: "Upcoming", icon: "fas fa-calendar-alt", link: "/" },
    { name: "Profit & Loss", icon: "fas fa-trophy", link: "/new-accountstatement" },
    // { name: "Casino", icon: "fas fa-dice", link: "/casino-games" },
    { name: "Account", icon: "fas fa-user", link: "/account" },
  ];

  // 🔗 Update these paths to match your actual routes
  const accountMenuItems = [
    { label: "My Ledger", link: "/new-accountstatement" },
    // { label: "My Commission", link: "/my-commission" },
    // { label: "Current Bets", link: "/current-bets" },
    { label: "Account Statement", link: "/accountstatement" },
    { label: "Casino Results", link: "/casino-results" },
    { label: "Rules", link: "/rules" },
    // { label: "Secure Auth Verification", link: "/secure-auth-verification" },
    { label: "Change Password", link: "/changepassword" },
    // { label: "Old Data", link: "/old-data" },
    { label: "Logout", link: "/login", isLogout: true },
  ];

  const logoutUser = () => {
    dispatch(logout());
    navigate.go("/login");
  };

  const handleAccountItemClick = (item: (typeof accountMenuItems)[number]) => {
    setShowAccountMenu(false);

    if (item.isLogout) {
      logoutUser();
    } else {
      navigate.go(item.link);
    }
  };

 return (
  <>
    <div style={{ paddingBottom: "70px" }} />

    <div
      className="d-flex justify-content-around align-items-center"
      style={{
        position: "fixed",
        bottom: 13,
        left: 0,
        width: "100%",
        background: "#0d2c54",
        height: "42px",
        zIndex: 99999999,
        borderTop: "1px solid rgba(255,255,255,0.1)",
        overflow: "hidden",
        borderRadius: "30px",
      }}
    >
      {menu.map((item, i) => {
        const isActive = location.pathname === item.link;

        if (item.name === "Account") {
          return (
            <div
              key={i}
              onClick={() => setShowAccountMenu(true)}
              className="d-flex flex-column align-items-center justify-content-center"
              style={{
                color: "#fff",
                fontSize: "12px",
                cursor: "pointer",
                flex: 1,
                height: "100%",
              }}
            >
              <i
                className={item.icon}
                style={{ fontSize: "18px", marginBottom: "2px" }}
              />
              <span style={{ fontSize: "12px", fontWeight: 600 }}>
                {item.name}
              </span>
            </div>
          );
        }

        return (
          <CustomLink
            key={i}
            to={item.link}
            className="d-flex flex-column align-items-center justify-content-center"
            style={{
              color: "#fff",
              fontSize: "12px",
              cursor: "pointer",
              flex: 1,
              height: "100%",
              position: "relative",
              background: isActive
                ? "linear-gradient(180deg,#ef2d78,#d81a63)"
                : "transparent",
              borderRadius: isActive ? "0 40px 40px 0" : "0",
            }}
          >
            <i
              className={item.icon}
              style={{ fontSize: "18px", marginBottom: "2px" }}
            />
            <span style={{ fontSize: "12px", fontWeight: 600 }}>
              {item.name}
            </span>
          </CustomLink>
        );
      })}
    </div>

    {showAccountMenu && (
      <>
        <div
          onClick={() => setShowAccountMenu(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.45)",
            zIndex: 99999998,
          }}
        />

        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#0d3f87",
            borderTopLeftRadius: "25px",
            borderTopRightRadius: "25px",
            zIndex: 99999999,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: 60,
              height: 5,
              background: "#fff",
              borderRadius: 20,
              margin: "10px auto",
            }}
          />

          {/* ✕ CLOSE BUTTON */}
          <button
            onClick={() => setShowAccountMenu(false)}
            aria-label="Close menu"
            style={{
              position: "absolute",
              top: 12,
              right: 16,
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "none",
              background: "rgba(255,255,255,0.15)",
              color: "#fff",
              fontSize: "18px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            ✕
          </button>

          {accountMenuItems.map((item) => (
            <div
              key={item.label}
              onClick={() => handleAccountItemClick(item)}
              style={{
                color: item.isLogout ? "#ff6b81" : "#fff",
                padding: "18px 22px",
                borderBottom: "1px solid rgba(255,255,255,.15)",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              {item.label}
            </div>
          ))}
        </div>
      </>
    )}
  </>
)
}

export default MobileFooter;