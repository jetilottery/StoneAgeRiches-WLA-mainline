/**
 * @module audioController
 * @memberof game
 * @description
 * @author Alex Wang
 */
define([
	    'skbJet/componentCRDC/gladRenderer/gladButton',
		'skbJet/component/gameMsgBus/GameMsgBus',
		'skbJet/component/audioPlayer/AudioPlayerProxy',
		'skbJet/component/gladPixiRenderer/gladPixiRenderer',
		'skbJet/component/SKBeInstant/SKBeInstant'
	], function(GladButton, msgBus, audio, gr, SKBeInstant){
		var audioDisabled = false;
		var audioOn;
		var audioOff;
		var MTMReinitial = false;
		var popUpDialog = false;
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true};
		function audioSwitch(){
			if(audioDisabled){
				audioOn.show(true);
				audioOff.show(false);
				audioDisabled = false;
			}else{
			    audioOn.show(false);
				audioOff.show(true);
				audioDisabled = true;
			}
			audio.muteAll(audioDisabled);
			audio.gameAudioControlChanged(audioDisabled);
		}
        
		function onConsoleControlChanged(data) {
			if (data.option === 'sound') {
                var isMuted = audio.consoleAudioControlChanged(data);
                if(isMuted) {
                    audioOn.show(false);
                    audioOff.show(true);
                    audioDisabled = true;
                } else{
                    audioOn.show(true);
                    audioOff.show(false);
                    audioDisabled = false;                  
                }  
                audio.muteAll(audioDisabled);
		 	} 
        }

		function onGameParametersUpdated() {
			if (SKBeInstant.config.customBehavior && (SKBeInstant.config.customBehavior.enableAudioDialog === true || SKBeInstant.config.customBehavior.enableAudioDialog === "true" || SKBeInstant.config.customBehavior.enableAudioDialog === 1)){
				popUpDialog = true;
			}
			audioOn = new GladButton(gr.lib._buttonAudio_00, 'buttonAudioOn',scaleType);
			audioOff = new GladButton(gr.lib._buttonAudioOff_00, 'buttonAudioOff',scaleType);
			audioDisabled = SKBeInstant.config.soundStartDisabled;
			if( SKBeInstant.config.assetPack !== 'desktop'  && popUpDialog){
				audioDisabled = true;
			}
			if (audioDisabled) {
				audioOn.show(false);
				audioOff.show(true);
			} else {
				audioOn.show(true);
				audioOff.show(false);
			}
			audio.muteAll(audioDisabled);
			audioOn.click(audioSwitch);
			audioOff.click(audioSwitch);
		}
		/*function onInitialize(){
			if (SKBeInstant.config.screenEnvironment === 'device'){
				return;
			}else{
				audio.play('GameInit','base');
			}
		}*/
		function onStartUserInteraction(){
			if(SKBeInstant.config.gameType === 'ticketReady' && SKBeInstant.config.assetPack !== 'desktop'){
				return;
			}else{
				audio.play('BaseMusicLoop', 'base' , true);
			}
		}
		
		function onEnterResultScreenState(){
			audio.play('BaseMusicLoopTerm','base');
		}
		
		function onReStartUserInteraction(){
			audio.play('BaseMusicLoop', 'base' , true);
		}
		
		function reset() {
			audio.stopAllChannel();
		}
		function onReInitialize(){
			audio.stopAllChannel();
			if(MTMReinitial){
				audio.play('GameInit','base');
			}
		}

		function touchAudioForSafrai(){        
			var downMouse, downTouch;
			var gameContainer = SKBeInstant.getGameContainerElem();
       
			var supportsPointerEvents = !!window.PointerEvent;
			var supportsTouchEvents = 'ontouchstart' in window;
	
			if (supportsPointerEvents) {
				downMouse = 'pointerdown';
			} else {
				downMouse = 'mousedown';
			}
	
			if (supportsTouchEvents) {
				downTouch = 'touchstart';
			}

			function handleEvent(){
				gameContainer.removeEventListener(downMouse, handleEvent,true);
				gameContainer.removeEventListener(downTouch, handleEvent,true);
				if (SKBeInstant.config.gameType === 'ticketReady') {
					audio.play('BaseMusicLoop', 'base' , true);
				}else{
					audio.play('GameInit','base');
				}
			}

			gameContainer.addEventListener(downMouse,handleEvent,true); //add two events to support touch laptop.
			gameContainer.addEventListener(downTouch,handleEvent,true);

		}
		
		function onPlayerSelectedAudioWhenGameLaunch(data){
			// retreve the rgs sound config parameter for desktop.
			/*if (SKBeInstant.config.screenEnvironment === 'desktop'){
				audio.muteAll(audioDisabled);
				audio.gameAudioControlChanged(audioDisabled);
				return;
			}else{
				audioDisabled = data;
				audioSwitch();
			}*/            
			var isMobile = /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi/i.test(navigator && navigator.userAgent);
			
			if(popUpDialog){
			    audioDisabled = data;
				audioSwitch();
			}else{
				audio.muteAll(audioDisabled);
			}

			if(SKBeInstant.config.screenEnvironment === 'desktop' && isMobile){
				touchAudioForSafrai();
			}else{
				if (SKBeInstant.config.gameType === 'ticketReady') {
					audio.play('BaseMusicLoop', 'base' , true);
				}else{
					audio.play('GameInit','base');
				}
			}
		}
		
		function onPlayerWantsToMoveToMoneyGame(){
			MTMReinitial = true;
		}
        
		msgBus.subscribe('jLotterySKB.reset', reset);
		//msgBus.subscribe('jLottery.initialize', onInitialize);
		msgBus.subscribe('jLottery.reInitialize', onReInitialize);
		msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
		msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
		msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
		msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
		msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
		msgBus.subscribe('audioPlayer.playerSelectedWhenGameLaunch',onPlayerSelectedAudioWhenGameLaunch);
		msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
		msgBus.subscribe('resourceLoaded', function () {
			if (popUpDialog) {
				audio.enableAudioDialog(true);  //set enable the dialog
			}
		});
	return {};
});