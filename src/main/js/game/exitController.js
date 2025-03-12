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
], function(msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils) {
    var buttonHome, buttonExit;
    var whilePlaying = false;
    var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true};
	var isSKB = false;
	var isWLA = false;
    function exitButton() {
        audio.play('ButtonGeneric');
        msgBus.publish('jLotteryGame.playerWantsToExit');
    }

    function onGameParametersUpdated() {    
		isWLA = SKBeInstant.isWLA() ? true : false;
		isSKB = SKBeInstant.isSKB() ? true : false;
        buttonHome = new gladButton(gr.lib._buttonExit, "buttonHome", scaleType);
        buttonExit = new gladButton(gr.lib._buttonExitII, "buttonBuy", scaleType);
        //buttonHome.show(false);
        buttonExit.show(false);
        gr.lib._textExit.setText(loader.i18n.Game.button_exit);
        gr.lib._textExit.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._textExit, { padding: 2 });
        buttonHome.click(exitButton);
        buttonExit.click(exitButton);    
		if (!isSKB) {
			buttonHome = new gladButton(gr.lib._buttonExit, "buttonHome", scaleType);
			buttonHome.click(exitButton);
			buttonHome.show(false);
		} else {
			gr.lib._buttonExit.show(false);
		}
    }
	
	function onInitialize() {
		if (isSKB) { return; }
		if (isWLA) {
		  if (Number(SKBeInstant.config.jLotteryPhase) === 1) {
			buttonHome.show(false);
		  } else {
			if (SKBeInstant.config.customBehavior) {
			  if (SKBeInstant.config.customBehavior.showTutorialAtBeginning === false) {
				buttonHome.show(true);
			  }
			} else if (loader.i18n.gameConfig) {
			  if (loader.i18n.gameConfig.showTutorialAtBeginning === false) {
				buttonHome.show(true);
			  }
			}
		  }
		}
	}
	
	function onBeginNewGame() {
		if (Number(SKBeInstant.config.jLotteryPhase) === 1) {
		  //gr.lib._buttonExit.show(true);
		} else {
		  whilePlaying = false;
		  if (isSKB) { return; }
		  if (isWLA) {
			if (gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible) {
			  buttonHome.show(true);
			}
		  }
		}
	}
    function onStartUserInteraction() {
        whilePlaying = true;
        buttonHome.show(false);
    }

    function onReStartUserInteraction() {
        onStartUserInteraction();
    }

    function onEnterResultScreenState() {
        if (SKBeInstant.config.jLotteryPhase === 1) {
            buttonExit.show(true);
        } else {
            gr.getTimer().setTimeout(function(){
                whilePlaying = false;
				if (isSKB) { return; }
                buttonHome.show(true);
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
        }
    }

    function onDisableUI() {
        buttonHome.show(false);
    }

    function onEnableUI() {
		if (isSKB) { return; }
        if (SKBeInstant.config.jLotteryPhase === 2 && !whilePlaying) {
            buttonHome.show(true);
        }
    }

    function onReInitialize() {
		whilePlaying = false;
		if (isSKB) { return; }
		if (isWLA && !gr.lib._tutorial.pixiContainer.visible) {
		  buttonHome.show(true);
		}
    }
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotterySKB.reset', onEnableUI);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('enableUI', onEnableUI);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('jLottery.beginNewGame', onBeginNewGame);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLottery.initialize', onInitialize);

    return {};
});