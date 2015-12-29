import LightenDarken from './util/lighten-darken'

const ITEM_HEIGHT = '34px'
const PANEL_BACKGROUND = '#448fe1';


var theme = {
  body: {
    backgroundColor: '#2f83de',
    fontFamily: `'Brandon_reg', serif`
  },
  wrapper: {
    width: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '20px'
  },
  panel: {
    backgroundColor: PANEL_BACKGROUND,
    color: '#fff',
    textAlign: 'center',
    display: 'block',
    padding: '10px',
    marginTop: '6px',
    marginBottom: '6px',
    borderRadius: '3px',
    boxShadow: '2px 2px 0px 1px rgba(225,225,225,0.5)',
    hover: {
      boxShadow: '2px 2px 0px 1px rgba(225,225,225,0.7)',
      backgroundColor: LightenDarken(PANEL_BACKGROUND, 3),
      cursor: 'pointer'
    },
    title: {
      verticalAlign: 'top',
      fontSize: '1.5em',
      textAlign: 'left',
      display: 'inline-block',
      width: '48%',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      marginLeft: '2%',
      lineHeight: ITEM_HEIGHT
    },
    date: {
      opacity: 0.5,
      textAlign: 'center',
      display: 'inline-block',
      width: '30%',
      lineHeight: ITEM_HEIGHT
    },
    icons: {
      width: '18%',
      display: 'inline-block',
      textAlign: 'right',
      marginRight: '2%',
      lineHeight: ITEM_HEIGHT,
      icon: {
        marginLeft: 3,
        marginRight:3,
        hover: {
          fontSize: '1.05em'
        }
      }
    }
  }
}

export default theme
