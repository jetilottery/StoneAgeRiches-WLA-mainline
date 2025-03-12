define(function(){
    
    function setTextStyle(Sprite, style){
        for(var key in style){
            Sprite.pixiContainer.$text.style[key] = style[key];
        }
    }
    
    //ramdom sort Array
    function randomSort(Array){
        var len = Array.length;
        var i, j, k;
        var temp;
        
        for(i=0; i < Math.floor(len/2);i++){
            j = Math.floor((Math.random()*len));
            k = Math.floor((Math.random()*len));
            while(k === j){
                k = Math.floor((Math.random()*len));
            }
            temp = Array[j];
            Array[j] = Array[k];
            Array[k] = temp;            
        }
    }

    function fixMeter(gr) {
		var balanceText = gr.lib._BalanceText;
        var balanceValue = gr.lib._BalanceValue;
        var meterDivision0 = gr.lib._meterDivision0;
        var ticketCostMeterText = gr.lib._TicketCostText01;
        var ticketCostMeterValue = gr.lib._TicketCostValue01;
        var meterDivision1 = gr.lib._meterDivision1;
        var winsText = gr.lib._WinsText;
        var winsValue = gr.lib._WinsValue;
        var metersBG = gr.lib._dim;

        var len = metersBG._currentStyle._width;
		var temp, balanceLeft;
        var top4OneLine = metersBG._currentStyle._top + (metersBG._currentStyle._height - balanceText._currentStyle._text._lineHeight)/2 - 4;
        var top4TwoLine0 = metersBG._currentStyle._top + (metersBG._currentStyle._height - balanceText._currentStyle._text._lineHeight*2)/2;
        var top4TwoLine1 = top4TwoLine0 + balanceText._currentStyle._text._lineHeight;
        
        if (balanceText.pixiContainer.visible) {
			temp = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision0.pixiContainer.$text.width + balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width + meterDivision1.pixiContainer.$text.width + winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width)) / 2;
            balanceLeft = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width)) / 2;
            balanceLeft = balanceLeft - meterDivision0.pixiContainer.$text.width - balanceValue.pixiContainer.$text.width - balanceText.pixiContainer.$text.width;
            if(temp >= 6){
                meterDivision1.show(true);
                if(balanceLeft >= 6){ //ticket cost in center
                    ticketCostMeterText.updateCurrentStyle({'_left': (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width)) / 2, '_top':top4OneLine});
                    ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width), '_top':top4OneLine});
                    meterDivision0.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left - meterDivision0.pixiContainer.$text.width), '_top':(top4OneLine-4)});
                    balanceValue.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left - balanceValue.pixiContainer.$text.width), '_top':top4OneLine});
                    balanceText.updateCurrentStyle({'_left': (balanceValue._currentStyle._left - balanceText.pixiContainer.$text.width), '_top':top4OneLine});
                    meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width), '_top':(top4OneLine-4)});
                    winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width), '_top':top4OneLine});
                    winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width), '_top':top4OneLine});
                }else{ //content in center
                    balanceText.updateCurrentStyle({'_left': temp, '_top':top4OneLine});
                    balanceValue.updateCurrentStyle({'_left': (balanceText._currentStyle._left + balanceText.pixiContainer.$text.width), '_top':top4OneLine});
                    meterDivision0.updateCurrentStyle({'_left': (balanceValue._currentStyle._left + balanceValue.pixiContainer.$text.width), '_top':(top4OneLine-4)});
                    ticketCostMeterText.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left + meterDivision0.pixiContainer.$text.width), '_top':top4OneLine});
                    ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width), '_top':top4OneLine});
                    meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width), '_top':(top4OneLine-4)});
                    winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width), '_top':top4OneLine});
                    winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width), '_top':top4OneLine});
                }
            }else{//content is too long, use two lines to show the content.
                var left0 = (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision0.pixiContainer.$text.width + balanceText.pixiContainer.$text.width + balanceValue.pixiContainer.$text.width)) / 2;
                balanceText.updateCurrentStyle({'_left': left0, '_top':top4TwoLine0});
                balanceValue.updateCurrentStyle({'_left': (balanceText._currentStyle._left + balanceText.pixiContainer.$text.width), '_top':top4TwoLine0});
                meterDivision0.updateCurrentStyle({'_left': (balanceValue._currentStyle._left + balanceValue.pixiContainer.$text.width), '_top':(top4TwoLine0-4)});
                ticketCostMeterText.updateCurrentStyle({'_left': (meterDivision0._currentStyle._left + meterDivision0.pixiContainer.$text.width), '_top':top4TwoLine0});
                ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width), '_top':top4TwoLine0});
                
                var left1= (len - (winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width))/2;
                meterDivision1.show(false);
                winsText.updateCurrentStyle({'_left': left1, '_top':top4TwoLine1});
                winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width), '_top':top4TwoLine1});    
            }
        } else {//balanceDisplayInGame is false
            meterDivision1.show(true);
            ticketCostMeterText.updateCurrentStyle({'_left': (len - (ticketCostMeterText.pixiContainer.$text.width + ticketCostMeterValue.pixiContainer.$text.width + meterDivision1.pixiContainer.$text.width + winsText.pixiContainer.$text.width + winsValue.pixiContainer.$text.width)) / 2, '_top':top4OneLine});
            ticketCostMeterValue.updateCurrentStyle({'_left': (ticketCostMeterText._currentStyle._left + ticketCostMeterText.pixiContainer.$text.width), '_top':top4OneLine});
            meterDivision1.updateCurrentStyle({'_left': (ticketCostMeterValue._currentStyle._left + ticketCostMeterValue.pixiContainer.$text.width), '_top':(top4OneLine-4)});
            winsText.updateCurrentStyle({'_left': (meterDivision1._currentStyle._left + meterDivision1.pixiContainer.$text.width), '_top':top4OneLine});
            winsValue.updateCurrentStyle({'_left': (winsText._currentStyle._left + winsText.pixiContainer.$text.width), '_top':top4OneLine});
        }
    }
    
    
    function fixTicketSelect(gr , prizePointList , normalNumber) {
        var ticketSelect = gr.lib._select_00.parent;
        var ticketSelectLength = prizePointList.length;
        var originLeft = gr.lib._select_00._currentStyle._left;
        if(ticketSelectLength === normalNumber){
            return;
        }else{
            var ticketSelectLast = gr.lib["_select_0" + (ticketSelectLength - 1)];
            var len = ticketSelectLast._currentStyle._left + ticketSelectLast._currentStyle._width - gr.lib._select_00._currentStyle._left;
            var currentLeft = (ticketSelect._currentStyle._width - len)/2;
            var diffValue = currentLeft - originLeft;
            for(var i = 0; i < ticketSelectLength;i++){ 
                gr.lib["_select_0" + i].updateCurrentStyle({"_left":gr.lib["_select_0" + i]._currentStyle._left + diffValue});
            }
        }
    }
    return{
        setTextStyle: setTextStyle,
        randomSort: randomSort,
        fixMeter: fixMeter,
        fixTicketSelect : fixTicketSelect
    };
});

