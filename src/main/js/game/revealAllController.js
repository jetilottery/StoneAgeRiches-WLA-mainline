/**
 * @module game/revealAllButton
 * @description reveal all button control
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

	//var revListener = [];
	var allNeedToTeveal = [];
	var moneyRewards = [];
	var playButton;
	var prizeRevealDelay;
	var symbolRevealDelay;
    var revealArrayTimer = [];
	
	function onGameParametersUpdated() {
        if(SKBeInstant.config.customBehaviorParams){
            prizeRevealDelay = SKBeInstant.config.customBehaviorParams.prizeRevealInterval || 1000;
            symbolRevealDelay = SKBeInstant.config.customBehaviorParams.symbolInterval || 500;
        } else {
            prizeRevealDelay = 1000;
            symbolRevealDelay = 500;
        }
		playButton = new gladButton(gr.lib._buttonPlay,"buttonBuy",{'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true});
		playButton.show(false);
		gr.lib._textPlay.autoFontFitText = true;
		gr.lib._textPlay.setText(loader.i18n.Game.button_reveal);
        gameUtils.setTextStyle(gr.lib._textPlay,{padding:2, dropShadow:true, dropShadowDistance:2.5});
		for (var i = 0;i < 30;i++) {
			i = i < 10?"0" + i:i;
			allNeedToTeveal.push(gr.lib['_slabstone_' + i]);
		}
		for(var j = 0;j < 6;j++){
			allNeedToTeveal.splice(j+(5*(j+1)),0,gr.lib["_clickArea_0" + j]);
			moneyRewards.push(gr.lib["_clickArea_0" + j]);
		}
	}

	function resetAll() {
		for (var i = 0; i < allNeedToTeveal.length; i++) {
			allNeedToTeveal[i].off("click",this.clickListner);
		}
		playButton.click(null);
	}
	function revealAll() {
		var symbolRevealInterval = 0;
        audio.play('ButtonGeneric');
		msgBus.publish('disableUI');
        revealArrayTimer = [];
		for (var i = 0; i < allNeedToTeveal.length; i++) {
			if (!allNeedToTeveal[i].revealFlag) {
				allNeedToTeveal[i].off("click",this.clickListner);
                var timer = gr.getTimer().setTimeout(allNeedToTeveal[i].reveal, symbolRevealInterval);
                revealArrayTimer.push(timer);
				if(i !== 0 && (i+1)%6 === 0){
					symbolRevealInterval += prizeRevealDelay;
				}else{
					symbolRevealInterval += symbolRevealDelay;
				}
			}
		}
		var fortune = null;
		for (i = 0; i < 30; i++) {
			i = i < 10?"0" + i:i;
			fortune = gr.lib['_slabstone_' + i];
			if (!fortune.revealFlag) {
				fortune.mouseEnabled = false;
			}
		}

		for (i = 0; i < moneyRewards.length; i++) {
			if (!moneyRewards[i].revealFlag) {
				moneyRewards[i].mouseEnabled = false;
			}
		}
		
		playButton.show(false);
	}
	function onStartUserInteraction(data) {
		//fix FORTUNEGOD-30 UI display abnormally if click “Play with Money” button quickly in try mode.
		//2016.08.30 Amelia
        var enable = SKBeInstant.config.autoRevealEnabled === false? false: true;
        if(enable){
            if(data.scenario){
                playButton.show(true);
            }
			addEventlistener();
        }else{
            playButton.show(false);
        }
		if(SKBeInstant.config.gameType !== "ticketReady"){
			msgBus.publish("enableUI");
		}
	}
	function addEventlistener(){
		playButton.click(function(){
			msgBus.publish("startReveallAll");
			audio.play('ButtonGeneric');
			revealAll();
		});
		/*revListener.push(gr.lib._buttonPlay.on('click', revealAll, null, true));
		revListener.push(gr.lib._buttonPlay.on('click', function () {
			audio.play('ButtonGeneric');
		}));*/
	}
	function onReStartUserInteraction(data) {
		onStartUserInteraction(data);
	}

	function onReInitialize() {
		resetAll();
		playButton.show(false);
	}
	
    function onError(){
        for(var i = 0; i<revealArrayTimer.length; i++){
            if(revealArrayTimer[i] !== null){
                gr.getTimer().clearTimeout(revealArrayTimer[i]);
                revealArrayTimer[i] = null;
            }
        }
    }
	
	msgBus.subscribe('playerWantsToMoveToMoneyGame', resetAll);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('allRevealed', function () {
		playButton.show(false);
	});
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('winboxError', onError);
	
	return {};
});