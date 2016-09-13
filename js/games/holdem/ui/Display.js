CT.require("games.holdem.ui.Bot");
CT.require("games.holdem.ui.Mobile");

games.holdem.ui.Display = CT.Class({
	CLASSNAME: "games.holdem.ui.Display",
	consts: games.holdem.constants,
	_responses: {
		summary: function(u) {
			this.log("_responses.summary", u);
			var s = u.message.data;
			this._vars.table_bid = s.ante;
			this._vars.hand_number = s.hand_number;
			this._vars.pot_total = 0;
			this._vars.round_total = s.starting_pot;
			this._resetCards();
		},
		move: function(u) {
			this.log("_responses.move", u);
			var m = u.message.data, data = m.move.split(" ").reverse(),
				cash = data.length > 1 ? parseInt(data[1].substr(1)) : 0;
			//incorporate case for player cash less than table_bid
			//needs to use minimum of the players cash and the table_bid
			switch (data[0]) {
				case "RAISE":
					this._vars.table_bid += cash;
					this._vars.round_total +=
						(this._vars.table_bid - m.invested);
					break;
				case "CALL":
					this._vars.round_total += cash;
					break;
				case "ALL":
					this._vars.round_total += cash;
					if (this._vars.table_bid < cash)
						this._vars.table_bid += cash - this._vars.table_bid;
				default:
					break;
			}
		},
		turn: function(u) {
			this.log("_responses.turn", u);
		},
		flip: function(u) {
			this.log("_responses.flip", u);
			var f = u.message.data, index = 0;
			for (;index < 5; ++index) {
				if (!this.cards[index]._card) {
					this.cards[index]._card = new mgc.lib.Card(f.suit, f.value);
					break;
				}
			}
		},
		deal: function(u) {
			this.log("_responses.deal", u);
		},
		stage: function(u) {
			this.log("_responses.stage", u);
			var s = u.message.data;
			if (s.game_stage != "preflop") {
				this._vars.pot_total += this._vars.round_total;
				this._vars.round_total = 0;
			}
			this._vars.game_stage = s.game_stage;
		}
	},
	_players: {},
	_buildVars: function() {
		this._vars = {
			"game_stage": "",
			"pot_total": 0,
			"round_total": 0,
			"table_bid": 0,
			"hand_number": 0
		};
	},
	_buildCards: function() {
		var cards = [];
		while (cards.length < 5)
			cards.push(CT.dom.node("", "div", "d-holdem_card"));
		this.cards = cards;
	},
	_buildText: function(d) {
		var text = Object.keys(d)[0];
		return CT.dom.wrapped([
				CT.dom.node(text, "span", "d-holdem_text fix_text"),
				this[d[text]]
			], "div", "d-holdem_textwrap");
	},
	_build: function() {
		this._buildVars();
		this._buildCards();
		this.view.appendChild(CT.dom.div([
			this.players,
			CT.dom.div([
				CT.dom.div("POT", "d-holdem_text fix_title"),
				CT.dom.node([
						{"TOTAL:&nbsp;&nbsp;": "pot_total"},
						{"BETS:&nbsp;&nbsp;": "round_total"},
						{"HAND:&nbsp;&nbsp;": "hand_number"}
					].map(this._buildText)),
				this.start_button
			], "d-holdem_left"),
			CT.dom.div([
				this.game_stage,
				CT.dom.div(this.cards, "d-holdem_cards")
			], "d-holdem_right")
		]));
	},
	_update: function() {
		this.game_stage.innerHTML = this._vars.game_stage;
		this.pot_total.innerHTML = this._vars.pot_total;
		this.round_total.innerHTML = this._vars.round_total;
		this.hand_number.innerHTML = this._vars.hand_number;
		this.cards.forEach(function(c) {
			if (c._card)
				mgc.lib.card.setCardImage(c, c._card.val());
			else
				mgc.lib.card.setCardImage(c, "");
		});
	},
	_updatePlayers: function(u) {
		for (var p in this._players)
			this._players[p].update(u);
	},
	_resetCards: function() {
		this.cards.forEach(function(c) {
			c._card = null;
		});
	},
	update: function(u) {
		this.log("update", u);
		var msg = u.message;
		if (msg.action in this._responses)
			this._responses[msg.action](u);
		this._update();
		this._updatePlayers(u);
	},
	_start: function() {
		this.start_button.parentNode.removeChild(this.start_button);
		mgc.core.actor.start(this.name);
	},
	join: function(user) {
		this.log("join", user);
		var pnode = CT.dom.node();
		pnode.isPlayerNode = true;
		this.players.appendChild(pnode);
		for (var p in this._players)
			this._players[p].join(user);
		this._players[user] = new games.holdem.ui[
			user.slice(0, 5) == "host_" ? "Bot"
			: "Mobile"](pnode, user);
	},
	leave: function(user) {
		this.log("leave", user);
		this.players.removeChild(this._players[user].view);
		delete this._players[user];
		for (var p in this._players)
			this._players[p].leave(user);
	},
	init: function(obj) {
		this.view.classList.add("display-background");
		this.game_stage = CT.dom.div("", "d-holdem_text vary_title");
		this.pot_total = CT.dom.span("", "d-holdem_text vary_text cash");
		this.round_total = CT.dom.span("", "d-holdem_text vary_text cash");
		this.hand_number = CT.dom.span("", "d-holdem_text vary_text");
		this.start_button = CT.dom.button("START", this._start);
		this.players = CT.dom.div("", "right downshift bordered padded");
		this._build();
		obj.presence.forEach(this.join);
	}
}, mgc.core.UI);
