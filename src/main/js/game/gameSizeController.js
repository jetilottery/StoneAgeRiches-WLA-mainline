define([
		'skbJet/component/gameMsgBus/GameMsgBus',
		'skbJet/component/gladPixiRenderer/gladPixiRenderer',
		'skbJet/component/SKBeInstant/SKBeInstant',
		'skbJet/component/deviceCompatibility/windowSize'
	], function(msgBus, gr, SKBeInstant,windowSize){

	function windowResized(){
        var winW, winH;
        if (SKBeInstant.isSKB()) {
            winW = windowSize.getDeviceWidth();
            winH = windowSize.getDeviceHeight();
            document.documentElement.style.width = winW + 'px';
            document.documentElement.style.height = winH + 'px';
            document.body.style.width = winW + 'px';
            document.body.style.height = winH + 'px';
            SKBeInstant.getGameContainerElem().style.width = winW + 'px';
            SKBeInstant.getGameContainerElem().style.height = winH + 'px';
        }else{
            winW = document.getElementById(SKBeInstant.config.targetDivId).clientWidth;
            winH = document.getElementById(SKBeInstant.config.targetDivId).clientHeight;
        }

		gr.fitSize(winW, winH);
	}

	function onAssetsLoadedAndGameReady(){
		if(SKBeInstant.isSKB() || SKBeInstant.config.screenEnvironment === 'device'){
            if(!SKBeInstant.isSKB()){
                gr.fitSize(document.getElementById(SKBeInstant.config.targetDivId).clientWidth, document.getElementById(SKBeInstant.config.targetDivId).clientHeight);	
            }
            windowResized();
			window.addEventListener('resize',windowResized);
		}else{
            gr.fitSize(Number(SKBeInstant.config.revealWidthToUse), Number(SKBeInstant.config.revealHeightToUse));
        }
        
	}

	msgBus.subscribe('jLotteryGame.assetsLoadedAndGameReady', onAssetsLoadedAndGameReady);
	return {};
});