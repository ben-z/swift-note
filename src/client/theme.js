import LightenDarken from './util/lighten-darken'

function px_to_num(px){
  return Number(px.replace('px',''))
}
function num_to_px(num){
  return num+'px';
}
const ITEM_HEIGHT = '34px'
const PANEL_BACKGROUND = '#448fe1';
const MODAL_WIDTH = '650px';

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
          fontSize: '1.05em',
          cursor: 'pointer',
          twox: {
            fontSize: '2.1em',
            cursor: 'pointer'
          }
        }
      }
    }
  },
  modal: {
  	width:'auto',
  	height: 'auto',
    inner: {
    	background: '#fff',
    	borderRadius: '2px',
    	borderColor: 'black',
    	borderStyle: 'solid',
    	maxWidth: '100%',
    	position: 'absolute',
    	top:'60px',
    	left:'50%',
    	zIndex: 20,
    	marginLeft: num_to_px(-(px_to_num(MODAL_WIDTH)/2)),
    	width: MODAL_WIDTH,
    	overflowX: 'hidden',
    },
    close: {
      position:'fixed',
      right: 0,
      top: 0
    },
    blur: {
      width: '100%',
      height: '100%',
      backgroundColor: 'black',
      position: 'fixed',
      display: 'block',
      bottom: 0,
      left: 0,
      opacity: 0.5
    }
  }
}

export default theme
