/**
 * @module game/playWithMoney
 * @description play with money button control
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

//	function (gr, config, jLottery) {

	var count = 0;
	var buttonMTM;
    var inGame = false;

	function enableButton() {
		if ((SKBeInstant.config.wagerType === 'BUY') || (SKBeInstant.config.jLotteryPhase === 1) || (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1/*-1: never. Move-To-Money-Button will never appear.*/)) {
			gr.lib._Money.show(true);
			gr.lib._Try.show(false);
		} else {
			//0: Move-To-Money-Button shown from the beginning, before placing any demo wager.
			//1..N: number of demo wagers before showing Move-To-Money-Button.
			//(Example: If value is 1, then the first time the RESULT_SCREEN state is reached, 
			//the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))
			if (count >= Number(SKBeInstant.config.demosB4Move2MoneyButton)){
				gr.lib._Money.show(false);
				gr.lib._Try.show(true);
                gr.lib._buttonMTM.show(true);
			}else{
				gr.lib._Money.show(true);
				gr.lib._Try.show(false);
			}
		}
	}

	function onInitialize() {
		enableButton();
	}
	function onReInitialize() {
        inGame = false;
		enableButton();
	}

	function onStartUserInteraction() {
        inGame = true;
        if(SKBeInstant.config.gameType === 'normal'){
            gr.lib._Money.show(true);
            gr.lib._Try.show(false);
        }
	}

	function onReStartUserInteraction() {
        inGame = true;
        gr.lib._Money.show(true);
        gr.lib._Try.show(false);
	}

	function onDisableUI() {
        gr.lib._Money.show(false);
        gr.lib._Try.show(false);
	}
	
	function onEnableUI() {
        if (inGame) {
			gr.lib._Money.show(true);
			gr.lib._Try.show(false);
        } else {
            enableButton();
        }
	}

	//When the RESULT_SCREEN state is reached,plus count,
	//the Move-To-Money-Button will appear (conditioned by compulsionDelayInSeconds))                
	function onEnterResultScreenState() {
		inGame = false;
		count++;
		gr.getTimer().setTimeout(function(){
			msgBus.publish('enableUI');
			if(gr.lib._helpPage.pixiContainer.visible){
				return;
			}else{
				enableButton();
			}
		}, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
	}
	
	function onGameParametersUpdated(){
		buttonMTM = new gladButton(gr.lib._buttonMTM,"buttonBuy",{'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true});
        gr.lib._textMTM.autoFontFitText = true;
		gr.lib._textMTM.setText(loader.i18n.Game.button_move2moneyGame);
        gameUtils.setTextStyle(gr.lib._textMTM,{padding:2, dropShadow:true, dropShadowDistance:2.5});
		enableButton();
		function clickMTM(){
			msgBus.publish('disableUI');
			SKBeInstant.config.wagerType = 'BUY';
            msgBus.publish('playerWantsToMoveToMoneyGame');
            msgBus.publish("playerBuyOrTry");
			msgBus.publish('jLotteryGame.playerWantsToMoveToMoneyGame');
			audio.play('ButtonGeneric');
		}		
		buttonMTM.click(clickMTM);
	}
	
	
    //msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	//msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLotterySKB.reset', function(){
        inGame = false;
		onInitialize();
	});
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('disableUI', onDisableUI);
	msgBus.subscribe('enableUI', onEnableUI);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);

	return {};
});