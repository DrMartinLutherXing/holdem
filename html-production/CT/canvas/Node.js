CT.canvas.Node = CT.Class({
	"CLASSNAME": "CT.canvas.Node",
	"_": {
		"mids": function() {
			var _v = this._.vars;
			_v.mids = {};
			_v.mids.x = _v.x + (_v.width / 2);
			_v.mids.y = _v.y + (_v.height / 2);
		},
		"draw_box": function (ctx) {
			var _v = this._.vars, gradient,
				x = _v.x, y = _v.y, r = _v.radius,
				width = _v.width, height = _v.height,
				lineWidth = _v.over ? (2 * _v.border) : _v.border,
				radius = {tl: r, tr: r, br: r, bl: r};
			ctx.strokeStyle = _v.selected ? _v.color_selected : _v.color_unselected;
			ctx.lineWidth = _v.selected ? (2 * lineWidth) : lineWidth;
			ctx.beginPath();
			ctx.moveTo(x + radius.tl, y);
			ctx.lineTo(x + width - radius.tr, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
			ctx.lineTo(x + width, y + height - radius.br);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
			ctx.lineTo(x + radius.bl, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
			ctx.lineTo(x, y + radius.tl);
			ctx.quadraticCurveTo(x, y, x + radius.tl, y);
			ctx.closePath();

			gradient = ctx.createLinearGradient(x, y, x, y + height);
			gradient.addColorStop(0, "white");
			gradient.addColorStop(1, _v.color);
			ctx.fillStyle = gradient;

			ctx.shadowColor = _v.shadowColor;
			ctx.shadowBlur = _v.shadowBlur;
			ctx.shadowOffsetX = _v.shadowOffsetX;
			ctx.shadowOffsetY = _v.shadowOffsetY;

			ctx.fill();
			ctx.stroke();
		}
	},
	"components": {},
	"move": function(x, y) {
		this._.vars.x += x;
		this._.vars.y += y;
		this._.mids();
	},
	"contains": function(e) {
		var x = this._.vars.x,
			y = this._.vars.y,
			w = this._.vars.width,
			h = this._.vars.height;
		return ((e.x >= x) && (e.x <= x + w) &&
			(e.y >= y) && (e.y <= y + h));
	},
	"hover": function(e) {
		this._.vars.over = this.contains(e);
	},
	"up": function(e) {
	},
	"down": function(e) {
		this._.vars.selected = this.contains(e);
		return this._.vars.selected && this;
	},
	"build": function() {}, // override
	"draw": function(ctx) {
		var v = this._.vars, c = this.components;
		this.build();
		v.box && this._.draw_box(ctx);
		v.drawOrder.forEach(function(component) {
			c[component](ctx);
		});
	},
	"init": function(vars) {
		this.id = CT.canvas.Node.id;
		CT.canvas.Node.id += 1;
		this._.vars = CT.merge(vars, {
			"inputPadding": 5,
			"border": 1,
			"radius": 5,
			"box": true,
			"over": false,
			"selected": false,
			"color_selected": "red",
			"color_unselected": "#0023AA",
			"shadowColor": "99AAAA",
			"shadowBlur": 10,
			"shadowOffsetX": 4,
			"shadowOffsetY": 4,
			"drawOrder": Object.keys(this.components)
		});
		this._.mids();
	}
});
CT.canvas.Node.id = 0;