const ITEM_HEIGHT = '34px'

export default {
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
    backgroundColor: '#448fe1',
    color: '#fff',
    textAlign: 'center',
    display: 'block',
    padding: '10px',
    marginTop: '6px',
    marginBottom: '6px',
    borderRadius: '3px',
    boxShadow: '2px 2px 0px 1px rgba(225,225,225,0.5)',
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
        marginLeft: 2,
        marginRight:2
      }
    }
  }
}
