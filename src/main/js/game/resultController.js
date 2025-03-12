/**
 * @module game/resultDialog
 * @description result dialog control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/audioPlayer/AudioPlayerProxy',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
	'skbJet/componentCRDC/gladRenderer/gladButton',
    '../game/gameUtils'
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils) {

	var allFortuneRevealed = false;
	var resultData = null;
	var allMoneyRevealed = false;
	var winHunterInterval;
	var messageCloseButton;
	var messagePlaque = false;
    var shouldCallFinishAllSymbolRevealedState = true;
    //var shouldCallPlayAagineState = false;
	function onGameParametersUpdated() {
		gr.lib._buttonMessageClose_text.autoFontFitText = true;
		gr.lib._buttonMessageClose_text.setText(loader.i18n.Game.button_ok);
        gameUtils.setTextStyle(gr.lib._buttonMessageClose_text,{padding:2, dropShadow:true, dropShadowDistance:2.5});
		messageCloseButton = new gladButton(gr.lib._buttonMessageClose,"buttonClose",{'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true});
        gameUtils.setTextStyle(gr.lib._Message01_Text,{padding:4});
        gameUtils.setTextStyle(gr.lib._Message02_Text,{padding:4});
        gameUtils.setTextStyle(gr.lib._MessageTry_Text,{padding:4});
		
		gr.lib._Message01_Value.autoFontFitText = true;
		hideDialog();
		gr.lib._buttonMessageClose.on('click', function () {
			hideDialog();
			audio.play('ButtonGeneric');
            /*if (shouldCallPlayAagineState) {
                msgBus.publish('jLotteryGame.playAgain');
                shouldCallPlayAagineState = false;
            }*/
		});
	}

	function hideDialog() {
		if(!gr.lib._helpPage.pixiContainer.visible){
			gr.lib._BG_dim.show(false);
		}
		gr.lib._MessagePlaque.show(false);
	}

	function showDialog() {
		gr.lib._BG_dim.show(true);
		gr.lib._MessagePlaque.show(true);
		gr.lib._Message01_Text.show(false);
		gr.lib._Message01_Value.show(false);
		gr.lib._Message02_Text.show(false);
		gr.lib._MessageTry_Text.show(false);
		if (resultData.playResult === 'WIN') {
			var msgTextHere;
			if (SKBeInstant.config.wagerType === 'BUY') {
				msgTextHere = loader.i18n.Game.message_buyWin;
				gr.lib._Message01_Text.updateCurrentStyle({_text:{_token:msgTextHere}});
				gr.lib._Message01_Text.show(true);
			}else{
				if(Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1){
					msgTextHere = loader.i18n.Game.message_anonymous_tryWin;
				}else{
					msgTextHere = loader.i18n.Game.message_tryWin;
				}
				gr.lib._MessageTry_Text.updateCurrentStyle({_text:{_token:msgTextHere}});
				gr.lib._MessageTry_Text.show(true);
			}
        	gameUtils.setTextStyle(gr.lib._Message01_Text,{fill:["#fabd5c","#ff5b01","#ffb426"],padding:4, dropShadow:true, dropShadowDistance:2.5});
			gameUtils.setTextStyle(gr.lib._MessageTry_Text,{fill:["#fabd5c","#ff5b01","#ffb426"],padding:4, dropShadow:true, dropShadowDistance:2.5});
			gr.lib._Message01_Value.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
			gameUtils.setTextStyle(gr.lib._Message01_Value,{fill:["#fbee7b","#c97a04","#ffeb8e"], dropShadow:true, dropShadowDistance:3});
			gr.lib._Message01_Value.show(true);
		} else {
			gr.lib._Message02_Text.setText(loader.i18n.Game.message_nonWin);
			gr.lib._Message02_Text.show(true);
			gameUtils.setTextStyle(gr.lib._Message02_Text,{fill:["#ff5b01","#fabd5c","#ff5b01"],padding:4});
		}
	}
	function resetAll(){
		if(gr.lib._hunter.pixiContainer.$sprite.playing){
			gr.lib._hunter.pixiContainer.$sprite.gotoAndStop(0);
		}
		//gr.lib._hunter.pixiContainer.$sprite.gotoAndStop(0);
		gr.lib._hunter.setImage("hunterAnimation_I_0001");
		gr.getTimer().clearInterval(winHunterInterval);
	}
	function onStartUserInteraction(data) {
        shouldCallFinishAllSymbolRevealedState = true;
        //shouldCallPlayAagineState = true;
		resultData = data;
		allMoneyRevealed = false;
		allFortuneRevealed = false;
		hideDialog();
	}
	function hunterAnimation(){
		if(resultData.playResult === 'WIN'){
			gr.lib._hunter.gotoAndPlay("hunterAnimation_III",0.3,false);
			gr.lib._hunter.pixiContainer.$sprite.onFrameChange = function(){
				if(this.currentFrame === 11){
					audio.play('CharacterAnim');
				}
			};
			gr.lib._hunter.pixiContainer.$sprite.onComplete = function(){
				gr.lib._hunter.pixiContainer.$sprite.onFrameChange = null;
				winHunterInterval = gr.getTimer().setInterval(function(){
					gr.lib._hunter.gotoAndPlay("hunterAnimation_III",0.3,false);
				},5000);
			};
		}else{
			gr.lib._hunter.gotoAndPlay("hunterAnimation_I",0.3,false);
		}
	}
	function checkAllRevealed() {
		if (allMoneyRevealed && allFortuneRevealed && shouldCallFinishAllSymbolRevealedState) {
			msgBus.publish('disableUI');
			msgBus.publish('clearHunterInterval');
			gr.getTimer().setTimeout(function(){
				hunterAnimation();
			},500);
			//msgBus.publish('jLotteryGame.finishAllSymbolRevealed');
			if (shouldCallFinishAllSymbolRevealedState) {
				msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
					tierPrizeShown: resultData.prizeDivision,
					formattedAmountWonShown: resultData.prizeValue
				});
			}
			msgBus.publish('allRevealed');
		}
	}

	function onEnterResultScreenState() {
		showDialog();
	}

	function onReStartUserInteraction(data) {
		resetAll();
		onStartUserInteraction(data);
	}

	function onReInitialize() {
		resetAll();
		hideDialog();
	}	
	function onPlayerWantsPlayAgain(){
        /*if (shouldCallPlayAagineState) {
            msgBus.publish('jLotteryGame.playAgain');
            shouldCallPlayAagineState = false;
        }*/
	}
	function onDisableMessagePlaque(){
		messagePlaque = false;
		if(gr.lib._MessagePlaque.pixiContainer.visible){
			messagePlaque = true;
		}
		gr.lib._MessagePlaque.show(false);
	}
	function onEnableMessagePlaque(){
		if(messagePlaque){
			gr.lib._BG_dim.show(true);
			gr.lib._MessagePlaque.show(true);
		}
	}   
	function onPlayerWantsToMoveToMoneyGame(){
        shouldCallFinishAllSymbolRevealedState = false;
    }
	msgBus.subscribe('disableMessagePlaque', onDisableMessagePlaque);
	msgBus.subscribe('enableMessagePlaque', onEnableMessagePlaque);
	msgBus.subscribe('resetAll', resetAll);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('allMoneyRevealed', function () {
		allMoneyRevealed = true;
		checkAllRevealed();
	});
	msgBus.subscribe('allFortuneRevealed', function () {
		allFortuneRevealed = true;
		checkAllRevealed();
	});
	msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);

	return {};
});