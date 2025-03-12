define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/audioPlayer/AudioPlayerProxy',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/SKBeInstant/SKBeInstant',
	'skbJet/componentCRDC/gladRenderer/gladButton',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    '../game/gameUtils'
],function(msgBus, audio, gr, SKBeInstant, gladButton, loader, gameUtils){
	var tutorialClose;
	var currentPageNumber;
	var helpTuStack;
	var nextButton;
	var rightHelpButton,leftHelpButton,helpButton,helpCloseButton;
	var channelNum = 3;
    var ButtonBetDownChannel = 0, ButtonBetUpChannel = 0;
	var shouldShowTutorialWhenReinitial = false;
	var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true};
    var showTutorialAtBeginning = true;
	
	function initTutorialPage(){
		currentPageNumber = 0;
		nextButton = true;
		helpTuStack = [];
		for(var i = 0;i < 3;i++){
			helpTuStack.push("_helpTu_0" + i);
			gr.lib["_helpTu_0" + i].show(true);
		}
	}
	function tutorialAction(){
		audio.play("ButtonGeneric");
		if(tutorialClose){
			if(gr.animMap._helpPage_d_00.isPlaying()){
				return;
			}
			checkCurrentNumber();
			gr.lib._helpPage.show(true);
			gr.lib._BG_dim.show(true);
			gr.animMap._helpPage_d.play();
			msgBus.publish("disableUI");
			msgBus.publish("onDisableMerterDim");
			msgBus.publish("disableMessagePlaque");
		}else{
			if(gr.animMap._helpPage_d.isPlaying()){
				return;
			}
			gr.animMap._helpPage_d_00.play();
		}
	}
	function checkCurrentNumber(){
		for(var i = 0;i < 3;i++){
			if(currentPageNumber === i){
				gr.lib["_helpPage_select_01_0" + currentPageNumber].show(true);
				gr.lib["_helpTu_0" + currentPageNumber].show(true);
				gr.lib._helpPage_text.setText(loader.i18n.Game["help_text0" + i]);
				gameUtils.setTextStyle(gr.lib._helpPage_text,{padding:2});
			}else{
				gr.lib["_helpPage_select_01_0" + i].show(false);
				gr.lib["_helpTu_0" + i].show(false);
			}
		}
		if(currentPageNumber === 0){
			leftHelpButton.enable(false);
		}else{
			leftHelpButton.enable(true);
		}
		if(currentPageNumber === 2){
			rightHelpButton.enable(false);
		}else{
			rightHelpButton.enable(true);
		}
	}

	function changePage(){
		if(nextButton){
			nextButton = false;
			currentPageNumber++;
			var currentPage = helpTuStack.pop();
			gr.lib[currentPage].show(false);
		}else{
			nextButton = true;
			currentPageNumber--;
			var index = helpTuStack.length;
			helpTuStack.push("_helpTu_0" + index);
			gr.lib["_helpTu_0" + index].show(true);
		}
	}	
	
	function onGameParametersUpdated(){
        gr.lib._versionText.autoFontFitText = true;
		gr.lib._versionText.setText(window._cacheFlag.gameVersion+".CL"+window._cacheFlag.changeList+"_"+window._cacheFlag.buildNumber);
		
		prepareAudio();
		initTutorialPage();
		tutorialClose = false;
		msgBus.publish("showBuyOrTryButton");
        gr.lib._MerterDim.show(true);
		gr.lib._helpPage_closeButton_text.autoFontFitText = true;
		gr.lib._helpPage_closeButton_text.setText(loader.i18n.Game.button_close);
        gameUtils.setTextStyle(gr.lib._helpPage_closeButton_text,{padding:2, dropShadow:true, dropShadowDistance:2.5, "avoidMultiTouch": true});
		leftHelpButton = new gladButton(gr.lib._helpButton_01,"button6",scaleType);
		rightHelpButton = new gladButton(gr. lib._helpButton_00,"button6",{'scaleXWhenClick': -0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true});
		helpButton = new gladButton(gr.lib._buttonHelp,"buttonInfo",scaleType);
		helpCloseButton = new gladButton(gr.lib._helpPage_closeButton,"buttonClose_00",scaleType);      
		if(SKBeInstant.config.customBehaviorParams){
            if(SKBeInstant.config.customBehaviorParams.showTutorialAtBeginning === false){
                showTutorialAtBeginning = false;
                helpButton.show(true);
                gr.lib._BG_dim.show(false);
                gr.lib._tutorial.show(false);
            }
        }
		rightHelpButton.click(function(){
			if(currentPageNumber >= 2){
				return;
			}
			audio.play('ButtonBetUp', 'ButtonBetUp'+ ButtonBetUpChannel%channelNum);
            ButtonBetUpChannel++;
			nextButton = true;
			changePage();
			checkCurrentNumber();
		});
		leftHelpButton.click(function(){
			if(currentPageNumber <= 0){
				return;
			}
			audio.play('ButtonBetDown', 'ButtonBetDown'+ ButtonBetDownChannel%channelNum);
            ButtonBetDownChannel++;  
			nextButton = false;
			changePage();
			checkCurrentNumber();
		});
		helpButton.click(tutorialAction);
		helpCloseButton.click(tutorialAction);
		gr.lib._helpPage.on("click",function(event){
			event.stopPropagation();
		});
		gr.lib._BG_dim.on("click",function(event){
			event.stopPropagation();
		});
		gr.animMap._helpPage_d._onComplete = function(){
			tutorialClose = false;
		};
		gr.animMap._helpPage_d_00._onComplete = function(){
			tutorialClose = true;
			initTutorialPage();
			gr.lib._helpPage.show(false);
			gr.lib._BG_dim.show(false);
			msgBus.publish("enableUI");
			msgBus.publish("onEnableMerterDim");
			msgBus.publish("enableMessagePlaque");
		};
		checkCurrentNumber();
        if(showTutorialAtBeginning){
			showFirstTutorial();
        }
	}
	function onDisableUI(){
		helpButton.show(false);
	}
	function onEnableUI(){
		helpButton.show(true);
	}	
	function showFirstTutorial(){
		gr.lib._helpPage.show(true);
		gr.lib._BG_dim.show(true);
		msgBus.publish("disableUI");
		msgBus.publish("onDisableMerterDim");
	}	
	function onInitialize() {
        if(showTutorialAtBeginning){
			msgBus.publish("disableUI");
        }
    }
	function onStartUserInteraction(){        
		ButtonBetDownChannel = 0;
        ButtonBetUpChannel = 0;
		tutorialClose = true;
		gr.lib._helpPage.show(false);
		gr.lib._BG_dim.show(false);
		if(SKBeInstant.config.gameType === "ticketReady"){
            if (showTutorialAtBeginning) {
				tutorialClose = false;
				gr.lib._MerterDim.show(false);
				showFirstTutorial();
            }
		}
	}
	function onReInitialize() {
		if(shouldShowTutorialWhenReinitial){
			shouldShowTutorialWhenReinitial  = false;
            if (showTutorialAtBeginning) {
				initTutorialPage();
				showFirstTutorial();
				tutorialAction();
				msgBus.publish("onMeterVisible");
            }
		}else{
			gr.lib._helpPage.show(false);
			helpButton.show(true);
		}
	}
	function prepareAudio() {
        for (var i = 0; i < channelNum; i++) {
            audio.play('ButtonBetDown', 'ButtonBetDown' + i);
            audio.stopChannel('ButtonBetDown' + i);
            
            audio.play('ButtonBetUp', 'ButtonBetUp' + i);
            audio.stopChannel('ButtonBetUp' + i);
        }
    }
	function onPlayerWantsToMoveToMoneyGame(){
		shouldShowTutorialWhenReinitial = true;
	}
	
    function onReStartUserInteraction() {
        helpButton.show(true);
    }
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLotterySKB.reset', onEnableUI);
	msgBus.subscribe('disableUI', onDisableUI);
	msgBus.subscribe('enableUI', onEnableUI);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
});