/**
 * @module game/meters
 * @description meters control
 */
define([
	'skbJet/component/gameMsgBus/GameMsgBus',
	'skbJet/component/audioPlayer/AudioPlayerProxy',
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/pixiResourceLoader/pixiResourceLoader',
	'skbJet/component/SKBeInstant/SKBeInstant',
    '../game/gameUtils',
	'skbJet/component/currencyHelper/currencyHelper'
], function (msgBus, audio, gr, loader, SKBeInstant, gameUtils, currencyHelper) {

	var resultData = null;
    var MTMReinitial = false;

	function onStartUserInteraction(data) {
		resultData = data;
	}

	function onEnterResultScreenState() {
		if(resultData.prizeValue >= 0 || SKBeInstant.isWLA()){
			gr.lib._WinsValue.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);
		}
        gameUtils.fixMeter(gr);
	}

	function onReStartUserInteraction(data) {
		onStartUserInteraction(data);
	}

	function onReInitialize() {
        if (MTMReinitial && SKBeInstant.config.balanceDisplayInGame) {
            gr.lib._BalanceText.show(true);
            gr.lib._BalanceValue.show(true);
            gr.lib._meterDivision0.show(true);
        }
		gr.lib._WinsText.setText(loader.i18n.Game.wins);
        gr.lib._WinsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
	}
	
	function onUpdateBalance(data){
        if (SKBeInstant.config.balanceDisplayInGame) {
            if (SKBeInstant.isSKB()) {
                gr.lib._BalanceValue.setText(currencyHelper.formatBalance(data.balance));
            } else {
                gr.lib._BalanceValue.setText(data.formattedBalance);
            }
            gameUtils.fixMeter(gr);
        }
	}
    
    function onPlayerWantsPlayAgain(){
        gr.lib._WinsValue.setText(SKBeInstant.config.defaultWinsValue);
        gameUtils.fixMeter(gr);
    }
	
	function onGameParametersUpdated(){
        if(SKBeInstant.config.balanceDisplayInGame === false || (SKBeInstant.config.wagerType === 'TRY' && (!SKBeInstant.isSKB() || Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1))){
            gr.lib._BalanceValue.show(false);
            gr.lib._BalanceText.show(false);
            gr.lib._meterDivision0.show(false);
        }
        gameUtils.setTextStyle(gr.lib._BalanceText,{padding:2});
		gr.lib._BalanceText.setText(loader.i18n.Game.balance);
        gameUtils.setTextStyle(gr.lib._WinsText,{padding:2});
        gameUtils.setTextStyle(gr.lib._meterDivision0,{padding:2});
        gameUtils.setTextStyle(gr.lib._meterDivision1,{padding:2});
		if (SKBeInstant.config.wagerType === 'BUY') {
			gr.lib._WinsText.setText(loader.i18n.Game.wins);
		} else {
			gr.lib._WinsText.setText(loader.i18n.Game.wins_demo);
		}
		gr.lib._BalanceText.originFontSize = gr.lib._BalanceText.pixiContainer.$text.style.fontSize;
        gameUtils.setTextStyle(gr.lib._WinsValue,{padding:2});	
		gr.lib._meterDivision1.autoFontFitText = true;
        gr.lib._meterDivision0.setText(loader.i18n.Game.meter_division);
        gr.lib._meterDivision1.setText(loader.i18n.Game.meter_division);
		gr.lib._WinsValue.setText(SKBeInstant.config.defaultWinsValue);
		gr.lib._BalanceValue.setText("");
        gameUtils.fixMeter(gr);
	}
	
	function onBeforeShowStage(data){
		gr.lib._BalanceValue.setText(currencyHelper.formatBalance(data.response.Balances["@totalBalance"]));
        gameUtils.fixMeter(gr);
		gr.forceRender();
	}

	msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
	msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
	//msgBus.subscribe('jLottery.initialize', onInitialize);
	msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	msgBus.subscribe('jLottery.updateBalance', onUpdateBalance);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',function(){
        MTMReinitial = true;
    });

	return {};
});