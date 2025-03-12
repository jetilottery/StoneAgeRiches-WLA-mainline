/**
 * @module errorWarningController
 * @memberof game
 * @description
 * @author Alex Wang
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/audioPlayer/AudioPlayerProxy',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
	'../game/gameUtils',
	'skbJet/componentCRDC/gladRenderer/gladButton'
], function(msgBus, audio, gr, loader, SKBeInstant, gameUtils, gladButton){

	var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true};
	var showWarn = false;
	var warnMessage = null;
	var inGame = false;
	var showError = false;
	
	function getHelpBGUrl(){
		return SKBeInstant.config.urlGameFolder+'assetPacks/'+SKBeInstant.config.assetPack+'/images/'+SKBeInstant.getGameOrientation()+'HelpBG.jpg' + window._cacheFlag.queryStr;
	}
	
	function getGameBGUrl(){
		return SKBeInstant.config.urlGameFolder+'assetPacks/'+SKBeInstant.config.assetPack+'/images/'+SKBeInstant.getGameOrientation()+'BG.jpg';
	}
	function onGameParametersUpdated(){
		if(gr.lib._winBoxError){
			gr.lib._winBoxError.show(false);
		}
	}
	function format(/* string, placeholder values... */) {
		var args = Array.prototype.slice.call(arguments),
				s = arguments[0],
				i = args.length - 1;

		while (i--) {
			s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), args[i + 1]);
		}
		return s;
	}
	
	function onWinBoxError(error) {
		//gr.lib._GameScene.show(true);
		//gr.lib._ErrorScene.show(false);
		var winBoxErrorButton = new gladButton(gr.lib._winBoxErrorExitButton, "buttonBuy", scaleType);
		gr.lib._winBoxErrorExitText.autoFontFitText = true;
		gameUtils.setTextStyle(gr.lib._winBoxErrorExitText,{padding:2});
		gr.lib._winBoxErrorExitText.setText(loader.i18n.Game.warning_button_exitGame);
		gr.lib._winBoxErrorExitText.setText(loader.i18n.Game.error_button_exit);  
		winBoxErrorButton.click(function() {
			msgBus.publish('jLotteryGame.playerWantsToExit');
			audio.play('ButtonGeneric', 0);
        });
		
		
		audio.stopAllChannel();
		gr.lib._BG_dim.show(true);
		msgBus.publish('tutorialIsShown');
		if(error.errorCode === '29000'){
            if (gr.lib._winBoxError) {
                gr.lib._winBoxError.show(true);
            }
			if(SKBeInstant.isSKB() && !SKBeInstant.isWLA()){
                winBoxErrorButton.show(false);
            }else{
                winBoxErrorButton.show(true);
            }
			gameUtils.setTextStyle(gr.lib._winBoxErrorText, {padding:2});
			gr.lib._winBoxErrorText.setText(error.errorCode);
		}
	}
	
	function onWarn(warning){
		gr.lib._GameScene.show(false);
		gr.lib._ErrorScene.show(true);
		
		SKBeInstant.getGameContainerElem().style.backgroundImage = format('url({0})', getHelpBGUrl());
		SKBeInstant.getGameContainerElem().style.backgroundRepeat = 'no-repeat';
		SKBeInstant.getGameContainerElem().style.backgroundSize = 'cover';	
		SKBeInstant.getGameContainerElem().style.backgroundPosition = 'center';
		
		var continueButton = new gladButton(gr.lib._warningContinueButton, "buttonBuy", scaleType);
		var warningExitButton = new gladButton(gr.lib._warningExitButton, "buttonBuy", scaleType);
		
		gr.lib._warningExitButton.show(true);
		gr.lib._warningContinueButton.show(true);
		gr.lib._errorExitButton.show(false);
		
		gr.lib._errorTitle.show(false);
		gr.lib._errorText.show(false);
		gr.lib._warningText.show(true);
		
		gr.lib._warningExitText.autoFontFitText = true;
		gr.lib._warningContinueText.autoFontFitText = true;
		gameUtils.setTextStyle(gr.lib._warningExitText,{padding:2});
		gr.lib._warningExitText.setText(loader.i18n.Game.warning_button_exitGame);
		gameUtils.setTextStyle(gr.lib._warningContinueText,{padding:2});
		gr.lib._warningContinueText.setText(loader.i18n.Game.warning_button_continue);
		gameUtils.setTextStyle(gr.lib._warningText,{padding:4});
		gr.lib._warningText.updateCurrentStyle({_text:{_lineHeight:40, _token:warning.warningMessage}});
		continueButton.click(closeErrorWarn);
		warningExitButton.click(function(){
			msgBus.publish('jLotteryGame.playerWantsToExit');
			audio.play('ButtonGeneric', 0);
		});
	}

	function closeErrorWarn(){
		showError = false;
		gr.lib._GameScene.show(true);
		gr.lib._ErrorScene.show(false);
		SKBeInstant.getGameContainerElem().style.backgroundImage = format('url({0})', getGameBGUrl());
		SKBeInstant.getGameContainerElem().style.backgroundRepeat = 'no-repeat';
		SKBeInstant.getGameContainerElem().style.backgroundSize = 'cover';	
		SKBeInstant.getGameContainerElem().style.backgroundPosition = 'center';
		audio.play('ButtonGeneric');
	}
	function onError(error){
		showError = true;
		gr.lib._GameScene.show(false);
		gr.lib._ErrorScene.show(true);			
		
		SKBeInstant.getGameContainerElem().style.backgroundImage = format('url({0})', getHelpBGUrl());
		SKBeInstant.getGameContainerElem().style.backgroundRepeat = 'no-repeat';
		SKBeInstant.getGameContainerElem().style.backgroundSize = 'cover';	
		SKBeInstant.getGameContainerElem().style.backgroundPosition = 'center';
		
		//When error happend, Sound must be silenced.
		audio.muteAll(true);
		
		var errorExitButton = new gladButton(gr.lib._errorExitButton, "buttonBuy", scaleType);
		gr.lib._warningExitButton.show(false);
		gr.lib._warningContinueButton.show(false);
		gr.lib._errorExitButton.show(true);
		
		gr.lib._errorTitle.show(true);
		gr.lib._errorText.show(true);
		gr.lib._warningText.show(false);
		
		gr.lib._errorTitle.setText(loader.i18n.Game.error_title);
		gameUtils.setTextStyle(gr.lib._errorExitText,{padding:2});
		gr.lib._errorExitText.setText(loader.i18n.Game.error_button_exit);
		
		gameUtils.setTextStyle(gr.lib._errorText,{padding:4});
		gr.lib._errorText.updateCurrentStyle({_text:{_lineHeight:40, _token:error.errorCode+":"+ error.errorDescriptionSpecific+"\n"+ error.errorDescriptionGeneric}});
		//gr.lib._errorText.setText(error.errorCode+":"+ error.errorDescriptionSpecific+"\n"+ error.errorDescriptionGeneric);
		//gr.lib._errorText.$text.height = 40;
		errorExitButton.click(function(){
			msgBus.publish('jLotteryGame.playerWantsToExit');
			audio.play('ButtonGeneric',0);
		});
		
		//destroy if error code is 00000
        //this is a carry-over from jLottery1 where if the game is closed via the confirm prompt
        //rather than the exit button
        if (error.errorCode === '00000' || error.errorCode === '66605') {
            if (document.getElementById(SKBeInstant.config.targetDivId)) {
                document.getElementById(SKBeInstant.config.targetDivId).innerHTML = "";
                document.getElementById(SKBeInstant.config.targetDivId).style.background = '';
                document.getElementById(SKBeInstant.config.targetDivId).style.backgroundSize = '';
                document.getElementById(SKBeInstant.config.targetDivId).style.webkitUserSelect = '';
                document.getElementById(SKBeInstant.config.targetDivId).style.webkitTapHighlightColor = '';
            }
            //clear require cache
            if (window.loadedRequireArray) {
                for (var i = window.loadedRequireArray.length - 1; i >= 0; i--) {
                    requirejs.undef(window.loadedRequireArray[i]);
                }
            }            
        }	
	}

	function onEnterResultScreenState(){
		inGame = false;
		if (showWarn) {
			showWarn = false;
			gr.getTimer().setTimeout(function () {
				onWarn(warnMessage);
			}, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
		}
	}
	
	msgBus.subscribe('jLottery.reInitialize', function(){
		inGame = false;
	});
	
	msgBus.subscribe('jLottery.error', onError);
	msgBus.subscribe('jLottery.playingSessionTimeoutWarning', function(warning){
		if(SKBeInstant.config.jLotteryPhase === 1 || showError){
			return;
		}
		if(inGame){
			warnMessage = warning;
			showWarn = true;
		}else{
			onWarn(warning);                
		}
	});
	function onStartUserInteraction(){
		inGame = true;
	}

	msgBus.subscribe('playerBuyOrTry', function(){
		inGame = true;
	});
	
	msgBus.subscribe('playerWantsPlayAgain', function(){
        inGame = true;
    });
	
	function onReStartUserInteraction(){
		onStartUserInteraction();
	}

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('winboxError', onWinBoxError);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
return {};
});