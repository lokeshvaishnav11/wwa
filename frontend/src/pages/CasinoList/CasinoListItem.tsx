// import React, { MouseEvent } from 'react'
// import { isMobile } from 'react-device-detect'
// import { selectCasinoMatchList } from '../../redux/actions/casino/casinoSlice'
// import { useAppSelector } from '../../redux/hooks'
// import ICasinoMatch from '../../models/ICasinoMatch'
// import { useNavigateCustom } from '../_layout/elements/custom-link'
// import { toast } from 'react-toastify'
// const CasinoListItem = (props: any) => {
//   const gamesList = useAppSelector<any>(selectCasinoMatchList)
//   const navigate = useNavigateCustom()
//   const casinoWidth = isMobile ? 'col-3' : 'col11'

//   const onCasinoClick = (e: MouseEvent<HTMLAnchorElement>, Item: ICasinoMatch) => {
//     e.preventDefault()
//     if (!Item.isDisable && Item.match_id!=-1 ) navigate.go(`/casino/${Item.slug}/${Item.match_id}`)
//       else toast.warn('This game is suspended by admin, please try again later')
//   }
//   return (
//     <>
//           {gamesList &&
//             gamesList
//             .filter((item: any) => !item.isDisable && item.match_id !== -1)
//             .map((Item: any, key: number) => {
//               return (
//                 <div className={"casino-list-item col-4"} key={key}>
//                   <a href='#' onClick={(e) => onCasinoClick(e, Item)} className=''>
//                       <div className="casino-list-item-banner" 
//                         style={{ backgroundImage: `url(${Item.image})`}}>
//                       </div>
//                       <div className='casino-list-name'>{Item.title}</div>
               
//                   </a>
//                 </div>
//               )
//             })}
//     </>
//   )
// }
// export default React.memo(CasinoListItem)



// import React, { MouseEvent } from 'react'
// import { selectCasinoMatchList } from '../../redux/actions/casino/casinoSlice'
// import { useAppSelector } from '../../redux/hooks'
// import ICasinoMatch from '../../models/ICasinoMatch'
// import { useNavigateCustom } from '../_layout/elements/custom-link'
// import { toast } from 'react-toastify'


// const CasinoListItem = (props: any) => {
//   const gamesList = useAppSelector<any>(selectCasinoMatchList)
//   const navigate = useNavigateCustom()

//   const onCasinoClick = (e: MouseEvent<HTMLAnchorElement>, Item: ICasinoMatch) => {
//     e.preventDefault()
//     if (!Item.isDisable && Item.match_id != -1) navigate.go(`/casino/${Item.slug}/${Item.match_id}`)
//     else toast.warn('This game is suspended by admin, please try again later')
//   }

//   return (
//     <div className="chub-grid">
//       {gamesList &&
//         gamesList
//           .filter((item: any) => !item.isDisable && item.match_id !== -1)
//           .map((Item: any, key: number) => {
//             return (
//               <div className="chub-card" key={key}>
//                 <a href="#" onClick={(e) => onCasinoClick(e, Item)} className="chub-link">
//                   <div className="chub-img-wrap">
//                     <img
//                       src={Item.image}
//                       alt={Item.title}
//                       className="chub-img"
//                       loading="lazy"
//                     />
//                   </div>
//                   <div className="chub-title">{Item.title}</div>
//                 </a>
//               </div>
//             )
//           })}
//     </div>
//   )
// }
// export default React.memo(CasinoListItem)

import React, { MouseEvent, useMemo, useState } from 'react'
import { selectCasinoMatchList } from '../../redux/actions/casino/casinoSlice'
import { useAppSelector } from '../../redux/hooks'
import ICasinoMatch from '../../models/ICasinoMatch'
import { useNavigateCustom } from '../_layout/elements/custom-link'
import { toast } from 'react-toastify'

// Category definitions — "match" holds keyword(s) checked against the
// game title (lowercased) to decide which category a game belongs to.
const CATEGORIES = [
  { key: 'all', label: 'All', match: [] as string[] },
  { key: 'crash', label: 'Crash', match: ['crash', 'aviator'] },
  { key: 'teenpatti', label: 'Teenpatti', match: ['teenpatti', 'teen patti'] },
  { key: 'lucky7', label: 'Lucky7', match: ['lucky 7', 'lucky7'] },
  { key: 'dragontiger', label: 'Dragon Tiger', match: ['dragon tiger'] },
  { key: '32card', label: '32 Card', match: ['32 card', 'card 32', '32cards'] },
  { key: 'poker', label: 'Poker', match: ['poker'] },
  { key: 'andarbahar', label: 'Andar Bahar', match: ['andar bahar', 'andar bhar'] },
]

// A unique, unlikely-to-collide prefix. Every rule below uses !important
// so it wins even against legacy/template CSS that also uses !important.
const P = 'cbz2026'

const CasinoListItem = (props: any) => {
  const gamesList = useAppSelector<any>(selectCasinoMatchList)
  const navigate = useNavigateCustom()
  const [activeCategory, setActiveCategory] = useState('all')

  const onCasinoClick = (e: MouseEvent<HTMLAnchorElement>, Item: ICasinoMatch) => {
    e.preventDefault()
    if (!Item.isDisable && Item.match_id != -1) navigate.go(`/casino/${Item.slug}/${Item.match_id}`)
    else toast.warn('This game is suspended by admin, please try again later')
  }

  const visibleGames = useMemo(() => {
    if (!gamesList) return []
    const base = gamesList.filter((item: any) => !item.isDisable && item.match_id !== -1)

    if (activeCategory === 'all') return base

    const category = CATEGORIES.find((c) => c.key === activeCategory)
    if (!category || category.match.length === 0) return base

    return base.filter((item: any) => {
      const title = (item.title || '').toLowerCase()
      return category.match.some((keyword) => title.includes(keyword))
    })
  }, [gamesList, activeCategory])

  return (
    <div className={`${P}-root`}>
      {/* Scoped stylesheet — !important beats any legacy/template CSS,
          and the "cbz2026" prefix avoids colliding with existing classes */}
      <style>{`
        .${P}-tabs {
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
          overflow-x: auto !important;
          white-space: nowrap !important;
          background: #0d2c54 !important;
          padding: 10px !important;
          margin: 0 !important;
          list-style: none !important;
        }
        .${P}-tab {
          flex: 0 0 auto !important;
          border: none !important;
          font-size: 13px !important;
          font-weight: 600 !important;
          padding: 7px 16px !important;
          border-radius: 18px !important;
          cursor: pointer !important;
          background: transparent !important;
          color: #cfd8e3 !important;
        }
        .${P}-tab-active {
          background: #ffffff !important;
          color: #0d2c54 !important;
        }
        .${P}-grid {
          display: grid !important;
          grid-template-columns: repeat(3, 1fr) !important;
          gap: 10px !important;
          padding: 10px !important;
          width: 53% !important;
          box-sizing: border-box !important;
          margin: 0 !important;
          list-style: none !important;
        }
        .${P}-card {
          width: 100% !important;
          max-width: 100% !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        .${P}-link {
          display: block !important;
          text-decoration: none !important;
          border-radius: 8px !important;
          overflow: hidden !important;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15) !important;
          background: #0d2c54 !important;
        }
        /* padding-bottom trick = forces a perfect square box on every
           browser, even old ones that don't support aspect-ratio */
        .${P}-imgwrap {
          position: relative !important;
          width: 100% !important;
          height: 0 !important;
          padding-bottom: 105% !important;
          overflow: hidden !important;
          background: #1a3a63 !important;
        }
        .${P}-img {
          position: absolute !important;
          top: 0 !important;
          left: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          object-fit: cover !important;
          display: block !important;
          margin: 0 !important;
        }
        .${P}-title {
          background: #0d2c54 !important;
          color: #fff !important;
          text-align: center !important;
          font-size: 11.5px !important;
          font-weight: 600 !important;
          padding: 6px 4px !important;
          line-height: 1.25 !important;
          min-height: 32px !important;
          margin: 0 !important;
        }
      `}</style>

      {/* CATEGORY SCROLLER */}
      <div className={`${P}-tabs`}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            className={`${P}-tab ${activeCategory === cat.key ? `${P}-tab-active` : ''}`}
            onClick={() => setActiveCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* GAME GRID — 3 per row, guaranteed via !important */}
      <div className={`${P}-grid`}>
        {visibleGames.map((Item: any, key: number) => {
          return (
            <div className={`${P}-card`} key={key}>
              <a href="#" onClick={(e) => onCasinoClick(e, Item)} className={`${P}-link`}>
                <div className={`${P}-imgwrap`}>
                  <img
                    src={Item.image}
                    alt={Item.title}
                    className={`${P}-img`}
                    loading="lazy"
                  />
                </div>
                <div className={`${P}-title`}>{Item.title}</div>
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}
export default React.memo(CasinoListItem)