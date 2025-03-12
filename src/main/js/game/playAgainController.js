/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * @module game/exitButton
 * @description exit button control
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

    var playAgain, playAgainMTM;
	var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true};
	function playAgainButton() {
		//msgBus.publish('jLotteryGame.playAgain');
		audio.play('ButtonGeneric');
        playAgain.show(false);
        playAgainMTM.show(false);
		msgBus.publish('playerWantsPlayAgain');
        gameUtils.fixMeter(gr);
	}
	
	function onGameParametersUpdated(){
        gameUtils.setTextStyle(gr.lib._textRestart,{padding:2, dropShadow:true, dropShadowDistance:2.5});       
		
		gr.lib._textRestart.autoFontFitText = true;
		gr.lib._textResMTM.autoFontFitText = true;
		if(SKBeInstant.config.wagerType === 'BUY'){
            gr.lib._textRestart.setText(loader.i18n.Game.button_restart);
        }else{
            gr.lib._textRestart.setText(loader.i18n.Game.button_tryRestart);
        }

        playAgain = new gladButton(gr.lib._buttonRestart, "buttonBuy",scaleType);
		playAgain.click(playAgainButton);
		playAgain.show(false);
        
		gameUtils.setTextStyle(gr.lib._textResMTM,{padding:2, dropShadow:true, dropShadowDistance:2.5});
		gr.lib._textResMTM.setText(loader.i18n.Game.button_tryRestart);
        playAgainMTM = new gladButton(gr.lib._buttonResMTM, "buttonBuy",scaleType);
		playAgainMTM.click(playAgainButton);
		playAgainMTM.show(false);
	}
    
    function onReInitialize(){
		gr.lib._textRestart.setText(loader.i18n.Game.button_restart);
        playAgain.show(false);
        playAgainMTM.show(false);
    }

	function onEnterResultScreenState() {
		if (SKBeInstant.config.jLotteryPhase === 2) {
            setTimeout(function(){
                playAgain.show(true);
                playAgainMTM.show(true);
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
		}
	}

	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

	return {};
});