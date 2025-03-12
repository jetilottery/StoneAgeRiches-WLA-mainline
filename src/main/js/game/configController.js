/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config
 */
define({
	predefinedStyle: {
		landscape:{
			loadDiv:{
				width:960,
				height:600,
				position:'absolute',
				left: "50%",
				top: "50%"
			},
			progressBarDiv:{
				top: 520,
				left: 196,
				width:590,
				height:42,
				padding:0,
				position:'absolute'
			},
			loadingBarButton:{
				top: -20,
				left: "0%",
				width:46,
				height:50,
				padding:0,
				position:'absolute',
				backgroundRepeat:'no-repeat'
			},
			progressDiv:{
				top: 8,
				left: 10,
				height:26,
				width:"0%",
				position:'absolute',
				backgroundRepeat:'no-repeat'
			},
			copyRightDiv:{
				bottom:20,
				fontSize:20,
				fontFamily: '"Roboto Condenced"',
				position:'absolute'
			}
		},
		portrait:{
			loadDiv:{
				width:600,
				height:818,
				position:'absolute',
				left: "50%",
				top: "50%"
			},
			progressBarDiv:{
				top:730,
				left:5,
				width:590,
				height:42,
				padding:0,
				position:'absolute',
			},
			loadingBarButton:{
				top: -20,
				left: "0%",
				width:46,
				height:50,
				padding:0,
				position:'absolute',
				backgroundRepeat:'no-repeat'
			},
			progressDiv:{
				top: 8,
				left: 10,
				height:26,
				width:"0%",
				position:'absolute',
				backgroundRepeat:'no-repeat'
			},
			copyRightDiv:{
				width:'100%',
				textAlign:'center',
				bottom:20,
				fontSize:20,
				fontFamily: '"Roboto Condenced"',
				position:'absolute'
			}
		}
	}
});