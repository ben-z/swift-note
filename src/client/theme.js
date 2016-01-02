import LightenDarken from './util/lighten-darken'

function px_to_num(px){
  return Number(px.replace('px',''))
}
function num_to_px(num){
  return num+'px';
}
const ITEM_HEIGHT = '34px';
const PRIMARY_COLOR = '#2f83de';
const PANEL_BACKGROUND = '#448fe1';
const MODAL_WIDTH = '650px';
const DARKENED_WHITE = LightenDarken('#ffffff',-10);
const DARKENED_DARK_WHITE = LightenDarken('#ffffff',-30);

var theme = {

  //  #####   ####  #####  #   #
  //  #    # #    # #    #  # #
  //  #####  #    # #    #   #
  //  #    # #    # #    #   #
  //  #    # #    # #    #   #
  //  #####   ####  #####    #

  body: {
    backgroundColor: PRIMARY_COLOR,
    fontFamily: `'Brandon_reg', serif`
  },

  //  #    # #####    ##   #####  #####  ###### #####
  //  #    # #    #  #  #  #    # #    # #      #    #
  //  #    # #    # #    # #    # #    # #####  #    #
  //  # ## # #####  ###### #####  #####  #      #####
  //  ##  ## #   #  #    # #      #      #      #   #
  //  #    # #    # #    # #      #      ###### #    #

  wrapper: {
    width: '80%',
    marginLeft: 'auto',
    marginRight: 'auto',
    padding: '20px'
  },

  //  #####    ##   #    # ###### #
  //  #    #  #  #  ##   # #      #
  //  #    # #    # # #  # #####  #
  //  #####  ###### #  # # #      #
  //  #      #    # #   ## #      #
  //  #      #    # #    # ###### ######

  panel: {
    backgroundColor: PANEL_BACKGROUND,
    color: '#fff',
    textAlign: 'center',
    display: 'block',
    padding: '10px',
    marginTop: '8px',
    marginBottom: '8px',
    borderRadius: '3px',
    boxShadow: '2px 2px 0px 1px rgba(255,255,255,0.5)',
    hover: {
      boxShadow: '2px 2px 0px 1px rgba(255,255,255,0.7)',
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

  //  #    #  ####  #####    ##   #
  //  ##  ## #    # #    #  #  #  #
  //  # ## # #    # #    # #    # #
  //  #    # #    # #    # ###### #
  //  #    # #    # #    # #    # #
  //  #    #  ####  #####  #    # ######

  modal: {
  	width:'auto',
  	height: 'auto',
    inner: {
    	background: LightenDarken(PANEL_BACKGROUND,10),
    	borderRadius: '5px',
      borderColor: 'white',
    	borderStyle: 'outset',
    	maxWidth: '100%',
      padding:'20px',
    	position: 'absolute',
    	top:'60px',
    	left:'50%',
    	zIndex: 20,
    	marginLeft: num_to_px(-(px_to_num(MODAL_WIDTH)/2)),
    	width: MODAL_WIDTH,
    	overflowX: 'hidden',
      color: 'white'
    },
    close: {
      position:'fixed',
      right: 0,
      top: 0,
      color: '#333'
    },
    blur: {
      width: '100%',
      height: '100%',
      background: `repeating-linear-gradient(
                    -55deg,
                    ${DARKENED_WHITE},
                    ${DARKENED_WHITE} 10px,
                    ${DARKENED_DARK_WHITE} 10px,
                    ${DARKENED_DARK_WHITE} 20px
                  )`,
      position: 'fixed',
      display: 'block',
      bottom: 0,
      left: 0,
      opacity: 0.5
    },
    title: {
      display: 'inline'
    },
    subtitleActions: {
      display:'inline',
      marginLeft:'10px',
      icon:{
        verticalAlign: 'text-top'
      }
    }
  }
}

export default theme
