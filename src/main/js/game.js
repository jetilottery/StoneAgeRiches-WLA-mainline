function mainEntry(){
	'use strict';

	window.game = window.game || {};
	window.game.SKBeInstantGame = window.game.SKBeInstantGame || {};
	window.game.SKBeInstantGame.lib = {Main:function(){}};
	window.game.SKBeInstantGame.lib.Main.prototype.init = function(config){
		if(config&&config.urlGameFolder){
			require.config({ baseUrl: config.urlGameFolder });
		}
		var _game = this;
		require([
			'skbJet/component/gameMsgBus/GameMsgBus',
			'skbJet/component/SKBeInstant/SKBeInstant',
			'com/pixijs/pixi',
			'game/gameEntry'
		], function(msgBus, SKBeInstant){
			SKBeInstant.init(config, _game);
		});
	};
	//if there is software id in URL parameters then it should be SKB/RGS env
	if(window.location.pathname.match(/launcher\.html$/)){
		require(['skbJet/component/gameMsgBus/PlatformMsgBusAdapter'], function(){
			var gameInstantce = new window.game.SKBeInstantGame.lib.Main();
			gameInstantce.init();
		});

	}
}
mainEntry();