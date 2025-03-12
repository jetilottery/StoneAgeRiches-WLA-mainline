/**
 * @module game/ticketCost
 * @description ticket cost meter control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/audioPlayer/AudioPlayerProxy',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    '../game/gameUtils',
    'skbJet/component/gladPixiRenderer/Sprite'
], function(msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, Sprite) {
    var _currentPrizePoint = null;
    var prizePointList;
    var ticketIcon, ticketIconObj = null;
    var prizeTopList = [];
    var arrowPlus, arrowMinus;
    var type;
    var merterDimVisible = false;
    var channelNum = 3;
    var ButtonBetUpChannel = 0;
    var ButtonBetDownChannel = 0;
    var MTMReinitial = false;

    function registerControl() {
        var formattedPrizeList = [];
        var strPrizeList = [];
        for (var i = 0; i < prizePointList.length; i++) {
            formattedPrizeList.push(SKBeInstant.formatCurrency(prizePointList[i]).formattedAmount);
            strPrizeList.push(prizePointList[i] + '');
        }
        var priceText, stakeText;
        if (SKBeInstant.isWLA()) {
            priceText = loader.i18n.MenuCommand.WLA.price;
            stakeText = loader.i18n.MenuCommand.WLA.stake;
        } else {
            priceText = loader.i18n.MenuCommand.Commercial.price;
            stakeText = loader.i18n.MenuCommand.Commercial.stake;
        }
        msgBus.publish("jLotteryGame.registerControl", [{
            name: 'price',
            text: priceText,
            type: 'list',
            enabled: 1,
            valueText: formattedPrizeList,
            values: strPrizeList,
            value: SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault
        }]);
        msgBus.publish("jLotteryGame.registerControl", [{
            name: 'stake',
            text: stakeText,
            type: 'stake',
            enabled: 0,
            valueText: '0',
            value: 0
        }]);
    }

    function gameControlChanged(value) {
        msgBus.publish("jLotteryGame.onGameControlChanged", {
            name: 'stake',
            event: 'change',
            params: [(SKBeInstant.formatCurrency(value).amount) / 100, SKBeInstant.formatCurrency(value).formattedAmount]
        });
        msgBus.publish("jLotteryGame.onGameControlChanged", {
            name: 'price',
            event: 'change',
            params: [value, SKBeInstant.formatCurrency(value).formattedAmount]
        });
    }

    function onConsoleControlChanged(data) {
        if (data.option === 'price') {
            setTicketCostValue(Number(data.value));
			msgBus.publish("jLotteryGame.onGameControlChanged", {
				name: 'stake',
				event: 'change',
				params: [(SKBeInstant.formatCurrency(data.value).amount) / 100, SKBeInstant.formatCurrency(data.value).formattedAmount]
			});
        }
    }

    function onGameParametersUpdated() {
        prepareAudio();
        type = SKBeInstant.config.wagerType === 'BUY' ? true : false;
        arrowPlus = new gladButton(gr.lib._arrowPlus, "arrowPlus",{'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true});
        arrowMinus = new gladButton(gr.lib._arrowMinus, "arrowMinus",{'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, "avoidMultiTouch": true});

        gr.lib._TicketCostValue.autoFontFitText = true;
        gr.lib._TicketCostText.autoFontFitText = true;
        gr.lib._WoodBrand_text.autoFontFitText = true;
        gr.lib._WoodBrand_value.autoFontFitText = true;
        gr.lib._TicketCostText.setText(loader.i18n.Game.wagerDim);
        gr.lib._TicketCostText01.setText(loader.i18n.Game.wager);
        gameUtils.setTextStyle(gr.lib._TicketCostText, { padding: 2 });
        gameUtils.setTextStyle(gr.lib._TicketCostText01, { padding: 2 });
        gameUtils.setTextStyle(gr.lib._TicketCostValue, { padding: 2 });
        gameUtils.setTextStyle(gr.lib._TicketCostValue01, { padding: 2 });
        //Top win fontColor
        gameUtils.setTextStyle(gr.lib._WoodBrand_text, { padding: 2, stroke: "#eeb345", strokeThickness: 2 });
        gr.lib._WoodBrand_text.setText(loader.i18n.Game.ui_winUpToAmount);

        gameUtils.setTextStyle(gr.lib._WoodBrand_value, { padding: 2, stroke: "#eeb345", strokeThickness: 2 });
        //Init avaliable prize point list
        prizePointList = [];
        ticketIcon = {};
        var style = {
            "_id": "_dfgbka",
            "_name": "_ticketCostLevelIcon_",
            "_SPRITES": [],
            "_style": {
                "_width": "20",
                "_height": "3",
                "_left": "196",
                "_background": {
                    "_imagePlate": "_select_03"
                },
                "_top": "74",
                "_transform": {
                    "_scale": {
                        "_x": "1",
                        "_y": "1.5"
                    }
                }
            }
        };
        var length = SKBeInstant.config.gameConfigurationDetails.revealConfigurations.length;
        var width = Number(style._style._width) * Number(style._style._transform._scale._x);
        var space = 4;
        var left = (gr.lib._MerterDim._currentStyle._width - (length * width + (length - 1) * space)) / 2;
        for (var i = 0; i < length; i++) {
            var spData = JSON.parse(JSON.stringify(style));
            spData._id = style._id + i;
            spData._name = spData._name + i;
            spData._style._left = left + (width + space) * i;
            var sprite = new Sprite(spData);
            gr.lib._MerterDim.pixiContainer.addChild(sprite.pixiContainer);

            var price = SKBeInstant.config.gameConfigurationDetails.revealConfigurations[i].price;
            prizeTopList.push(SKBeInstant.config.gameConfigurationDetails.revealConfigurations[i].prizeStructure[0].prize);
            prizePointList.push(price);
            ticketIcon[price] = "_ticketCostLevelIcon_" + i;
        }
        registerControl();
        if (prizePointList.length <= 1) {
            arrowPlus.show(false);
            arrowMinus.show(false);
        } else {
            arrowPlus.show(true);
            arrowMinus.show(true);
            arrowPlus.click(increaseTicketCost);
            arrowMinus.click(decreaseTicketCost);
        }
        setDefaultPricePoint();
        gameUtils.fixMeter(gr);
    }

    function setTicketCostValue(prizePoint) {
        var index = prizePointList.indexOf(prizePoint);
        if (index < 0) {
            msgBus.publish('error', 'Invalide prize point ' + prizePoint);
            return;
        }
        if (index === 0) {
            arrowMinus.enable(false);
        } else {
            arrowMinus.enable(true);
        }
        if (index === (prizePointList.length - 1)) {
            arrowPlus.enable(false);
        } else {
            arrowPlus.enable(true);
        }
        var valueString = SKBeInstant.formatCurrency(prizePoint).formattedAmount;
        if (!type) {
            valueString = loader.i18n.Game.button_try + valueString;
        }
        gr.lib._TicketCostValue.setText(valueString);
        gr.lib._TicketCostValue01.setText(valueString);
        gr.lib._WoodBrand_value.setText(SKBeInstant.formatCurrency(prizeTopList[index]).formattedAmount + loader.i18n.Game.exclamation_point);
        if (ticketIconObj) {
            ticketIconObj.setImage('select_03');
        }
        ticketIconObj = gr.lib[ticketIcon[prizePoint]];
        ticketIconObj.setImage('select_02');
        _currentPrizePoint = prizePoint;
        msgBus.publish('ticketCostChanged', prizePoint);
    }

    function setTicketCostValueWithNotify(prizePoint) {
        setTicketCostValue(prizePoint);
        gameControlChanged(prizePoint);
    }

    function increaseTicketCost() {
        var index = prizePointList.indexOf(_currentPrizePoint);
        index++;
        setTicketCostValue(prizePointList[index]);
        gameControlChanged(prizePointList[index]);
        if (index === prizePointList.length - 1) {
            audio.play('ButtonBetMax', 'ButtonBetMax');
        } else {
            audio.play('ButtonBetUp', 'ButtonBetUp' + (ButtonBetUpChannel % channelNum));
            ButtonBetUpChannel++;
        }
    }

    function decreaseTicketCost() {
        var index = prizePointList.indexOf(_currentPrizePoint);
        index--;
        setTicketCostValue(prizePointList[index]);
        gameControlChanged(prizePointList[index]);
        audio.play('ButtonBetDown', 'ButtonBetDown' + (ButtonBetDownChannel % channelNum));
        ButtonBetDownChannel++;
    }

    function onErrorReset() {
        if (_currentPrizePoint) {
            resetAll(_currentPrizePoint);
        } else {
            setDefaultPricePoint();
        }
        gr.lib._MerterDim.show(true);
        enableConsole();
    }

    function resetAll(value) {
        setTicketCostValueWithNotify(value);
    }

    function setDefaultPricePoint() {
        setTicketCostValueWithNotify(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault);
    }

    function onInitialize() {
        enableConsole();
    }

    function onReInitialize() {
        if (MTMReinitial) {
            type = true;
            setDefaultPricePoint();
            onInitialize();
            MTMReinitial = false;
        } else {
            onErrorReset();
        }
    }

    function onStartUserInteraction(data) {
        ButtonBetUpChannel = 0;
        ButtonBetDownChannel = 0;
        disableConsole();
        gr.lib._MerterDim.show(false);
        if (data.price) {
            _currentPrizePoint = data.price;
            var valueString = SKBeInstant.formatCurrency(_currentPrizePoint).formattedAmount;
            if (!type) {
                valueString = loader.i18n.Game.button_try + valueString;
            }
            gr.lib._TicketCostValue.setText(valueString);
            gr.lib._TicketCostValue01.setText(valueString);
        }
        setTicketCostValue(_currentPrizePoint);
        gameControlChanged(_currentPrizePoint);
        msgBus.publish('ticketCostChanged', _currentPrizePoint);
    }

    function onEnterResultScreenState() {
        if (SKBeInstant.config.jLotteryPhase === 2) {
            setTimeout(function() {
                setTicketCostValue(_currentPrizePoint);
                gameControlChanged(_currentPrizePoint);
            }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);
        }
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onPlayerBuyOrTry() {
        arrowMinus.enable(false);
        arrowPlus.enable(false);
    }

    function playerWantsPlayAgain() {
        gr.lib._MessagePlaque.show(false);
        gr.lib._BG_dim.show(false);
        gr.lib._MerterDim.show(true);
        enableConsole();
        msgBus.publish("resetAll");
    }

    function enableConsole() {
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "price", "event": "enable", "params": [1] }
        });
    }

    function disableConsole() {
        msgBus.publish('toPlatform', {
            channel: "Game",
            topic: "Game.Control",
            data: { "name": "price", "event": "enable", "params": [0] }
        });
    }

    function prepareAudio() {
        for (var i = 0; i < channelNum; i++) {
            audio.play('ButtonBetUp', 'ButtonBetUp' + i);
            audio.stopChannel('ButtonBetUp' + i);

            audio.play('ButtonBetDown', 'ButtonBetDown' + i);
            audio.stopChannel('ButtonBetDown' + i);
        }
    }

    function onDisableMerterDim() {
        merterDimVisible = false;
        if (gr.lib._MerterDim.pixiContainer.visible) {
            merterDimVisible = true;
        }
        gr.lib._MerterDim.show(false);
    }

    function onEnableMerterDim() {
        if (merterDimVisible) {
            gr.lib._MerterDim.show(true);
        }
    }

    function meterVisible() {
        merterDimVisible = true;
    }

    function onPlayerWantsToMoveToMoneyGame() {
        MTMReinitial = true;
    }
    //msgBus.subscribe('onEnableStakeConsole', enableConsole);
    msgBus.subscribe('onMeterVisible', meterVisible);
    msgBus.subscribe('onDisableMerterDim', onDisableMerterDim);
    msgBus.subscribe('onEnableMerterDim', onEnableMerterDim);
    msgBus.subscribe('playerWantsPlayAgain', playerWantsPlayAgain);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotterySKB.reset', onErrorReset);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('playerBuyOrTry', onPlayerBuyOrTry);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', onPlayerWantsToMoveToMoneyGame);
    return {};
});