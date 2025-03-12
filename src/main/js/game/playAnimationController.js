/**
 * @module game/playAnimationController
 * @description 
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/audioPlayer/AudioPlayerProxy',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
	"skbJet/component/gladPixiRenderer/Sprite",
    '../game/gameUtils',
    'skbJet/componentCRDC/gladRenderer/gladButton'
], function (msgBus, audio, gr, loader, SKBeInstant, Sprite, gameUtils, GladButton) {
	var resultData;
	var resultGemstone;
	var resultMoney;
    var winValueCheck = 0;
	var gemstoneRow = [],
		scenarioDataMatrix = [];
	var gemstoneTypeList = [];
	var SMOKE_TIME_INTERVAL = 5;
	var SMALL_SMOKE_TIME_INTERVAL = 5;
	var noWinDelay;
	var quietInterval;
	var smokeInterval;
	var smokeSmallInterval;
	var startTime,symbolEndTime;
	var startStopInterval;
	var theirLeftFeetFrameAnimation = [];
	var winValue = [];
	var winMap = {};
	var winMoneyPlaying = false;
	var gemstoneList = ["A","B","C","D","E","F","G","H"];
	var symbolResidue = 30;
	var winSymbolResidue = 6;
	var totalNumber = 0;
	
	var channelNum = 3;
    var clickedNum = 0;
	
	var winChannel=0;
    var symbolChannel = 0;
    var eInstantChannel = 0;
    var winlineChannel = 0;
	var noWinDelayInterval = null;
	var newGame = false;
 	function initGame(){
        if(SKBeInstant.config.customBehaviorParams){
            noWinDelay = SKBeInstant.config.customBehaviorParams.noWinInterval || 250;
		}else{
            noWinDelay = 250;
		}
		for(var i = 0;i < 9;i++){
			gemstoneTypeList.push("gem_0" + i);
		}
		for(i = 0;i < 6;i++){
			gemstoneRow[i] = [];
			scenarioDataMatrix[i] = [];
			//Light of money
			gr.lib["_winLight_0" + i].show(false);
			gr.lib["_StoneBG_0" + i].show(false);
		}
		for(i = 0;i < 30;i++){
			i = addZero(i);
			gr.lib["_light_" + i].show(false);
			gr.lib["_light_III_" + i].show(false);
			gr.lib["_yellowCard_" + i].show(false);
			gr.lib["_stoneDim_" + i].show(false);
		}
		for(i = 14;i < 21;i++){
			theirLeftFeetFrameAnimation.push("hunterAnimation_II_00" + i);
		}
		//Add animation from sprite Texture Cache.
		addSpriteSheetAnimation();
	} 
	function sceneAnimation(){
		smokeAnimation();
		smokeSmallAnimation();
		gr.lib._fire_00.gotoAndPlay("fire",0.5,true);
	}
	// resetAll function for reStart and moveToManey
	function resetAll(){
		newGame = false;
		if(noWinDelayInterval){
			gr.getTimer().clearTimeout(noWinDelayInterval);
		}	
        stopAllGladAnim();
		clearHunterInterval();
		// Gem layer covering
		for(var i = 0;i < 30;i++){
			i = addZero(i);
			gr.lib["_slabstone_" + i].stopPlay();
			gr.lib["_slabstone_" + i].off("click",this.clickListner);
			gr.lib["_slabstone_" + i].setImage("slabstone_" + i + "_01");
			gr.lib["_light_" + i].show(false);
			gr.lib["_light_III_" + i].show(false);
			gr.lib["_yellowCard_" + i].show(false);
			gr.lib["_stoneDim_" + i].show(false);
		}
		for(i = 0;i < 6;i++){
			gemstoneRow[i] = [];
			scenarioDataMatrix[i] = [];
			gr.lib["_breakStones_0" + i].stopPlay();
			gr.lib["_winLight_0" + i].stopPlay();
			gr.lib["_clickArea_0" + i].off("click",this.clickListner);
			gr.lib["_breakStones_0" + i].setImage("breakStones_01");
			gr.lib["_breakStones_0" + i].show(true);
			gr.lib["_winNumber_value_0" + i].setText("");
			gr.lib["_winLight_0" + i].show(false);
			gr.lib["_StoneBG_0" + i].show(false);
			gr.lib["_winNumber_value_0" + i].pixiContainer.$text.style.stroke = null;
		}
		winChannel=0;
		symbolChannel = 0;
		eInstantChannel = 0;
		winlineChannel = 0;
		symbolResidue = 30;
		winSymbolResidue = 6;
		totalNumber = 0;
        clickedNum = 0;
		winMap = {};
		winMoneyPlaying = false;
	}
	
	function addZero(par){
		par = par < 10?"0" + par:par;
		return par;
	}
	
	function checkAllRevealed(){
		var isAllRevealed = true;
 		if(symbolResidue === 0){
			msgBus.publish("allFortuneRevealed");
		}else{
			isAllRevealed = false;
		} 
		return isAllRevealed;
	}
	
    function checkAllMoneyRevealed() {
        var isAllMoneyRevealed = true;
        if (winSymbolResidue === 0) {
            if (winValueCheck !== resultData.prizeValue) {
                msgBus.publish('winboxError', {errorCode: '29000'});
                return;
            }
            msgBus.publish("allMoneyRevealed");
        } else {
            isAllMoneyRevealed = false;
        }
        return isAllMoneyRevealed;
    }
	
	function clearHunterInterval(){
		gr.getTimer().clearInterval(quietInterval);
	}
	function monitorTime(){
		startStopInterval = gr.getTimer().setTimeout(function(){
			if(startTime === symbolEndTime){
				hunterQuietAnimation();
			}
		},5000);
		quietInterval = gr.getTimer().setInterval(function(){
			var timeNow = new Date().getTime();
			if(!gr.lib._hunter.pixiContainer.$sprite.playing){
				if(timeNow - symbolEndTime >= 5000){
					hunterQuietAnimation();
				}
			}
		},5000);
	}
	
 	function hunterQuietAnimation(){		
		gr.lib._hunter.gotoAndPlay("hunterAnimation_II",0.3,false);
		gr.lib._hunter.pixiContainer.$sprite.onComplete = function(){
			this.gotoAndStop(14);
			gr.lib._hunter.gotoAndPlay("theirLeftFeet",0.3,true);
		};
	}
	// smoke animation of volcano.
	function smokeAnimation(){
		SMOKE_TIME_INTERVAL = Math.floor(Math.random()*10 + 5);
		gr.lib._smoke.gotoAndPlay("somke",0.5,false);
		smokeInterval = gr.getTimer().setTimeout(smokeAnimation,SMOKE_TIME_INTERVAL * 1000);
	}
	function smokeSmallAnimation(){
		SMALL_SMOKE_TIME_INTERVAL = Math.floor(Math.random()*10 + 5);
		gr.lib._smoke_01.gotoAndPlay("somke",0.5,false);
		smokeSmallInterval = gr.getTimer().setTimeout(smokeSmallAnimation,SMALL_SMOKE_TIME_INTERVAL * 1000);
	}
	function updateWinValue() {
        var result = 0;
        for (var symbol in winMap) {
            result += Number(winMap[symbol]);
        }
        winValueCheck = result;
        if (winValueCheck > resultData.prizeValue) {
            msgBus.publish('winboxError', {errorCode: '29000'});
            return;
        }			
		gr.lib._WinsValue.setText(SKBeInstant.formatCurrency(result).formattedAmount);
        gameUtils.fixMeter(gr);
	}
	function winBehavior(rowNumber){
		updateWinValue();
		gr.lib["_winLight_0" + rowNumber].show(true);
		gr.lib["_StoneBG_0" + rowNumber].show(true);

		gr.lib["_winLight_0" + rowNumber].gotoAndPlay("light_II",0.2,false);
		gr.lib["_winLight_0" + rowNumber].pixiContainer.$sprite.onComplete = function(){
			gr.lib["_winLight_0" + rowNumber].gotoAndPlay("light_II",0.2,false);
			gr.lib["_winLight_0" + rowNumber].pixiContainer.$sprite.onComplete = function(){
				gr.lib["_winLight_0" + rowNumber].show(false);
				gr.animMap["_winNumber_value_d" + rowNumber].play(2);
			};
			
		};
	}
	
	function gemstoneAnimation(nameNum, clickCurrentData){
		var symbolRevealCount = 0;
		var symbolThreeSame = 0;
		var rowNumber = Math.floor(nameNum/5);
		var index = nameNum - 5*rowNumber;
		var rowMoneyHaveRevealed = gr.lib["_clickArea_0" + rowNumber].revealFlag;
		gemstoneRow[rowNumber][index] = clickCurrentData;
		for(var i = 0;i < 5;i++){
			if(gemstoneRow[rowNumber][i] !== undefined){
				symbolRevealCount++;
			}
		}
		if(clickCurrentData === "X"){
			audio.play("WinInstant",'wininstant'+ eInstantChannel%channelNum);
			eInstantChannel++;
			//eInstant win
			nameNum = addZero(nameNum);
			// X animation
			gr.lib["_light_III_" + nameNum].show(true);
			gr.lib["_stoneDim_" + nameNum].show(false);
			gr.lib["_light_III_" + nameNum].gotoAndPlay("light_III",0.3,true);

			//winNumberColor(rowNumber);
		}else{
			// symbol win
			var j;
			// Determine whether won when each line have three revealFlag
			if(symbolRevealCount > 2){
				for(i = 0;i < 5;i++){
					if(gemstoneRow[rowNumber][i] === clickCurrentData){
						symbolThreeSame++;
					}
				}
				// When three same symbol have been revealed.
				if(symbolThreeSame === 3){
					for(i = 0;i < gemstoneRow[rowNumber].length;i++){
						if(gemstoneRow[rowNumber][i] === clickCurrentData){
							j = addZero(i + (rowNumber*5));
							gr.lib["_light_" + j].show(true);
							gr.lib["_yellowCard_" + j].show(true);
							gr.lib["_light_" + j].gotoAndPlay("light",0.3,true);
						}
					}
					//winNumberColor(rowNumber);
					audio.play("WinLine",'winline'+ winlineChannel%channelNum);
					winlineChannel++;
				}
			}
		} 		
		// When symbol of a row have been revealed.
		if(symbolRevealCount === 5){
			var symbolNoWin = true;
			var eInstantNoWin = true;
			var c;
			for(i = 0;i < 5;i++){
				c = i + (rowNumber*5);
				c = addZero(c);
				if(gr.lib["_yellowCard_" + c].pixiContainer.visible){
					symbolNoWin = false;
				}else if(!gr.lib["_stoneDim_" + c].visible){
					gr.lib["_stoneDim_" + c].show(true);
				}
			}
			if(symbolNoWin){
				for(i = 0;i < gemstoneRow[rowNumber].length;i++){
					c = i + (rowNumber*5);
					c = addZero(c);
					if(gemstoneRow[rowNumber][i] === "X"){
						eInstantNoWin = false;
						gr.lib["_stoneDim_" + c].show(false);
					}else{
						gr.lib["_stoneDim_" + c].show(true);
					}
				}
			}
			// Auto reveal money
			if(gr.lib._buttonPlay){
				noWinDelayInterval = gr.getTimer().setTimeout(function(){
					if(!rowMoneyHaveRevealed &&  symbolNoWin && eInstantNoWin && newGame){
						gr.lib["_clickArea_0" + rowNumber].reveal();
					}
				},noWinDelay);
			}
		}  
		//If row money have been revealed,then judge how to animation.
		if(rowMoneyHaveRevealed){
			if(symbolRevealCount >= 3 && symbolThreeSame === 3){
				winMap[rowNumber] = winValue[rowNumber];
				winBehavior(rowNumber);
			}else{
				checkEinstantWin(rowNumber);
			}
		}	
		//gr.getTimer().setTimeout(checkAllRevealed,1000);
		symbolEndTime = new Date().getTime();
		symbolResidue--;
		checkAllRevealed();
	}
	function checkEinstantWin(rowNumber){
		var k;
		for(var i = 0;i < gemstoneRow[rowNumber].length;i++){
			k = i + (rowNumber*5);
			if(resultGemstone[k] === "X"){
				k = addZero(k);
				if(gr.lib["_slabstone_" + k].revealFlag){
					winMap[rowNumber] = winValue[rowNumber];
					winBehavior(rowNumber);
					break;
				}
				
			}
		}
	}
	function moneyRewardsAnimation(nameNum){
		var symbolRevealCount = 0;
		var rowMoneyHaveRevealed = gr.lib["_clickArea_0" + nameNum].revealFlag;
		for(var i = 0;i < 5;i++){
			if(gemstoneRow[nameNum][i] !== undefined){
				symbolRevealCount++;
			}
		}
		if(symbolRevealCount >= 3){
			for(i = 0;i < symbolRevealCount;i++){
				var j = i + (5*nameNum);
				j = addZero(j);
				var rowHaveVisible = gr.lib["_yellowCard_" + j].pixiContainer.visible;
				if(rowHaveVisible){
					winMap[nameNum] = winValue[nameNum];
					winBehavior(nameNum);
					break;
				}
			}
		}
		if(rowMoneyHaveRevealed){
			checkEinstantWin(nameNum);
		}
		symbolEndTime = new Date().getTime();
		winSymbolResidue--;
		checkAllMoneyRevealed();
	}
	function setGemstoneRevealAction(gemstoneSymbol,func,animationName){
		var gemstone = gemstoneSymbol;
		var symbolName = gemstone.getName();
		var nameNum = symbolName.match(/(\d+)/g).join();
		
		// gemstone animation
		var animation;
		var audioReveal;
		var channel;
		var clickCurrentData = null;
		if(animationName.indexOf("breakStones") !== -1){
			animation = animationName;
			audioReveal = "Reveal1";
			channel = "symbolreveal" + symbolChannel%channelNum;
			symbolChannel++;
		}else{
			animation = animationName + nameNum;
			audioReveal = "Reveal2";
			channel = "winreveal" + winChannel%channelNum;
			winChannel++;
		}
		gemstone.reveal = function(){
			if(!gemstone.revealFlag){
				totalNumber++;
				if(totalNumber === 36){
					msgBus.publish('disableUI');
				}
				gemstone.revealFlag = true;
				//quiet = false;
				gemstone.off("click",this.clickListner);
				gemstone.pixiContainer.$sprite.cursor = "default";
				gr.getTimer().clearTimeout(startStopInterval);
				if(gr.lib._hunter.pixiContainer.$sprite.playing){
					gr.lib._hunter.pixiContainer.$sprite.gotoAndStop(0);
					gr.lib._hunter.setImage("hunterAnimation_I_0001");
				}
				audio.play(audioReveal,channel);
				var animationContainer;
				if(symbolName.indexOf("clickArea") !== -1){
					animationContainer = gr.lib["_breakStones_" + nameNum];
				}else{
                    clickCurrentData = scenarioDataMatrix[Math.floor(nameNum/5)].shift();
                    setGemstoneType(clickCurrentData, nameNum);
					animationContainer = gemstone;
				}
				animationContainer.gotoAndPlay(animation,0.5);
				animationContainer.pixiContainer.$sprite.onComplete = function(){
					if(symbolName.indexOf("_slabstone_") !== -1){
						gr.lib["_light_I_" + nameNum].gotoAndPlay("light_I",0.5);
						gr.lib["_light_I_" + nameNum].pixiContainer.$sprite.onComplete = function(){
							nameNum = nameNum < 10?nameNum.substr(1):nameNum;
							func(nameNum, clickCurrentData);
						};
					}else{
						nameNum = nameNum < 10?nameNum.substr(1):nameNum;
						func(nameNum, clickCurrentData);
					}
				};
			}
		};
	}
	
	function handlerRevealAction(gemstoneSymbol,func,animationName){
		var gemstone = gr.lib[gemstoneSymbol];
		gemstone.revealFlag = false;
		setGemstoneRevealAction(gemstone,func,animationName);
        var gladSymbol = new GladButton(gemstone, null, {"avoidMultiTouch":true});
		gemstone.clickListner = gladSymbol.click(function(event){
			event.stopPropagation();
			gemstone.reveal();
		});
		gemstone.mouseEnabled = true;
	}	
	
	function setRevealAction(){
		for(var i = 0;i < 30;i++){
			i = addZero(i);
			handlerRevealAction("_slabstone_" + i,gemstoneAnimation,"slabstone_");
		} 		
		for(i = 0;i < 6;i++){
			handlerRevealAction("_clickArea_0" + i,moneyRewardsAnimation,"breakStones");
		}
	}
	// Set gemstones's type   
	function setGemstoneType(clickCurrentData, index){
		if(clickCurrentData === "X"){
			gr.lib["_gemStone_" + index].setImage(gemstoneTypeList[8]);
			return;
		}
        for (var i = 0; i < gemstoneList.length; i++) {
            if (clickCurrentData === gemstoneList[i]) {
                gr.lib["_gemStone_" + index].setImage(gemstoneTypeList[i]);
            }
        }
	}
	//Set prizeTable
	function setPrizeTable(){
		var prizeTable = resultData.prizeTable;
		for(var i = 0;i < 6;i++){
			for(var j = 0;j < 10;j++){
				if(resultMoney[i] === prizeTable[j].description){
					winValue[i] = prizeTable[j].prize;
					i = addZero(i);
					gr.lib["_winNumber_value_" + i].autoFontFitText = true;
					gr.lib["_winNumber_value_" + i].setText(SKBeInstant.formatCurrency(prizeTable[j].prize).formattedAmount);
					gameUtils.setTextStyle(gr.lib["_winNumber_value_" + i],{stroke:"#f5ffe0", strokeThickness:3, dropShadow:true, dropShadowDistance:1});
				}
			}
		}
	}    
	
	function baseGameResultDataHandler(baseGameResultData){
        baseGameResultData.forEach(function(item, index){
            scenarioDataMatrix[Math.floor(index/5)].push(item);
        });
    }
	
	function onStartUserInteraction(data){
		newGame = true;
		resultData = data;
        winValueCheck = 0;
		if(!data.scenario){
			return;
		}
		resultGemstone = data.scenario.match(/(\w+),/g).join("").match(/(\w+)/g).join("").split("");
		resultMoney = data.scenario.match(/,(\w{1})/g).join("").match(/(\w+)/g);
		if (!resultGemstone) {
			msgBus.publish('error', 'Cannot parse server response');
		}
		baseGameResultDataHandler(resultGemstone);
		startTime = symbolEndTime = new Date().getTime();
		monitorTime();
		setPrizeTable();
		setRevealAction();
	}
	function onReStartUserInteraction(data){
        stopAllGladAnim();
		resetAll();
		onStartUserInteraction(data);
		//hunterQuietAnimation();
	}
	function onReInitialize(){
		symbolEndTime = new Date().getTime();
        stopAllGladAnim();
		resetAll();
		sceneAnimation();
		clearHunterInterval();
	}	
 	function cloneAnimationForStone(){
		var numberName, numberNameList;
        
		for(var i=1;i<6;i++){
			numberName='_winNumber_value_d' + i;
			numberNameList=['_winNumber_value_0' + i];
			gr.animMap._winNumber_value_d0.clone(numberNameList,numberName);
		}
	} 
	function addSpriteSheetAnimation(){
		Sprite.addSpriteSheetAnimation("theirLeftFeet",theirLeftFeetFrameAnimation);
		//Sprite.addSpriteSheetAnimation("theirRightFeet",theirRightFeetFrameAnimation);
	}
	function onGameParametersUpdated(){
		prepareAudio();
		initGame();
		sceneAnimation();
		cloneAnimationForStone();
	}

	function stopAllGladAnim() {
        for (var p in gr.animMap) {
			if(p.substr(0,6) === "_cloud" || p.substr(0,5) === "_tree" || p.substr(0,7) === "_flower"){
				continue;
			}
            gr.animMap[p].stop();
        }
    }    
	function prepareAudio() {
        for (var i = 0; i < channelNum; i++) {
            audio.play('WinInstant', 'wininstant' + i);
            audio.stopChannel('wininstant' + i);
            
            audio.play('WinLine', 'winline' + i);
            audio.stopChannel('winline' + i);
            
            audio.play('Reveal1', 'symbolreveal' + i);
            audio.stopChannel('symbolreveal' + i);
			
            audio.play('Reveal2', 'winreveal' + i);
            audio.stopChannel('winreveal' + i);
        }
    }
	msgBus.subscribe('jLotterySKB.reset', resetAll);
	msgBus.subscribe('resetAll', resetAll);
	msgBus.subscribe('clearHunterInterval', clearHunterInterval);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	
	return {};
});