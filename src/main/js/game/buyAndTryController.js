/**
 * @module game/buyAndTryController
 * @description buy and try button control
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

    var currentTicketCost = null;
    var replay = false;
    var buttonBuy;
    var buttonTry;
    var MTMReinitial = false;
    var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true};
    
    function onGameParametersUpdated() {
        buttonBuy = new gladButton(gr.lib._buttonBuy, "buttonBuy",scaleType);
        buttonTry = new gladButton(gr.lib._buttonTry, "buttonBuy",scaleType);
        buttonBuy.show(false);
        buttonTry.show(false);
        if (SKBeInstant.config.wagerType === 'BUY') {
            gr.lib._textBuy.setText(loader.i18n.Game.button_buy);
        } else {
            gr.lib._textBuy.setText(loader.i18n.Game.button_try);
        }
        gr.lib._textTry.setText(loader.i18n.Game.button_try);
		gr.lib._textBuy.autoFontFitText = true;
		gr.lib._textTry.autoFontFitText = true;
        gameUtils.setTextStyle(gr.lib._textBuy, { padding: 2, dropShadow: true, dropShadowDistance: 2.5 });
        gameUtils.setTextStyle(gr.lib._textTry, { padding: 2, dropShadow: true, dropShadowDistance: 2.5 });
        buttonBuy.click(play);
        buttonTry.click(play);
        gr.lib._refresh.show(false);
    }

    function play() {
        gr.animMap._refreshing._onComplete = function() {
            this.play();
        };
        gr.lib._refresh.show(true);
        gr.animMap._refreshing.play();
        buttonBuy.show(false);
        buttonTry.show(false);
        gr.lib._buttonMTM.show(false);
        if (replay) {
            msgBus.publish('jLotteryGame.playerWantsToRePlay', { price: currentTicketCost });
        } else {
            msgBus.publish('jLotteryGame.playerWantsToPlay', { price: currentTicketCost });
        }
        audio.play('ButtonGeneric');
        msgBus.publish("disableUI");
        msgBus.publish("playerBuyOrTry");
    }

    function onStartUserInteraction(data) {
        gr.lib._refresh.show(false);
        gr.animMap._refreshing.stop();
        buttonBuy.show(false);
        buttonTry.show(false);
        gr.lib._buttonMTM.show(false);
        replay = true;
        currentTicketCost = data.price;
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function showBuyOrTryButton() {
        if (SKBeInstant.config.jLotteryPhase !== 2) {
            return;
        }
        buttonBuy.show(true);
        buttonTry.show(true);
    }


    function onTicketCostChanged(data) {
        currentTicketCost = data;
        gameUtils.fixMeter(gr);
    }

    function onReInitialize() {
        gr.lib._refresh.show(false);
        gr.animMap._refreshing.stop();
        if (MTMReinitial) {
            gr.lib._textBuy.setText(loader.i18n.Game.button_buy);
            replay = false;
            MTMReinitial = false;
        }
        showBuyOrTryButton();
    }

    function onPlayerWantsToMoveToMoneyGame() {
        MTMReinitial = true;
    }
    msgBus.subscribe('jLotterySKB.reset', function() {
        gr.lib._refresh.show(false);
        showBuyOrTryButton();
    });
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('showBuyOrTryButton', showBuyOrTryButton);
    msgBus.subscribe('playerWantsPlayAgain', showBuyOrTryButton);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);

    return {};
});