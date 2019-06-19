class Component{
	constructor(x, y, w, h){
		this.parent = null;
		this.name = "Empty";
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.min_w = 0;
		this.min_h = 0;
		this.childs = [];
		this.dragFlag = false;
		this.clickFlag = false;
		this.dragStartCompX = 0;
		this.dragStartCompY = 0;
	}

	setup(){}
	update(){}
	update_sub(){
		this.w = Math.max(this.min_w, this.w);
		this.h = Math.max(this.min_h, this.h);
		for(let i = 0; i < this.childs.length; i++){
			this.childs[i].update();
			this.childs[i].update_sub();
		}
	}
	draw(){};
	draw_sub(){
		for(let i = this.childs.length - 1; i >= 0; i--){
			push();
			translate(this.childs[i].x, this.childs[i].y);
			this.childs[i].draw();
			this.childs[i].draw_sub();
			pop();
		}
	}
	add(child){
		this.childs.push(child);
		child.parent = this;
		child.setup();
		return child;
	}
	setMinSize(tmp_min_w, tmp_min_h){
		this.min_w = tmp_min_w;
		this.min_h = tmp_min_h;
	}
	mouseEvent(type, tmp_x, tmp_y, start_x, start_y){
		if (this.mouseEventToChild(type, tmp_x, tmp_y, start_x, start_y)) return;
		switch(type){
			case "HIT":
				break;
			case "DOWN":
				this.dragStartCompX = x;
				this.dragStartCompY = y;
				break;
			case "UP":
				break;
			case "CLICK":
				break;
			case "MOVE":
				break;
			case "DRAG":
				this.x = this.dragStartCompX + tmp_x - start_x;
				this.y = this.dragStartCompY + tmp_y - start_y;
				break;
		}
	}
	mouseEventToChild(type, tmp_x, tmp_y, start_x, start_y){
		if (type === "UP" && (this.dragFlag || this.clickFlag)){
			this.childs[0].mouseEvent(type, tmp_x - this.childs[0].x, tmp_y - this.childs[0].y, start_x - this.childs[0].x, start_y - this.childs[0].y);
			this.dragFlag = false;
			this.clickFlag = false;
		}
		if(this.dragFlag) {
			this.childs[0].mouseEvent(type, tmp_x - this.childs[0].x, tmp_y - this.childs[0].y, start_x - this.childs[0].x, start_y - this.childs[0].y);
			return true;
		}
		else{
			for(let c of this.childs){
				if (c.checkHit(tmp_x, tmp_y)){
					switch(type){
						case "DOWN":
							this.activeChilds(c);
							c.mouseEvent(type, tmp_x - c.x, tmp_y - c.y, start_x - c.x, start_y - c.y);
							this.dragFlag = true;
							this.clickFlag = true;
							break;
						case "UP":
						case "DRAG":
							break;
						default:
							c.mouseEvent(type, tmp_x - c.x, tmp_y - c.y, start_x - c.x, start_y - c.y);
							break;
					}
					return true;
				}
			}
		}
		return false;
	}
	checkHit(px, py){
		if (
			this.x < px &&
			this.y < py &&
			px < this.x + this.w &&
			py < this.y + this.h
		) return true;
		for(let c of this.childs){
			if(c.checkHit(px - this.x, py - this.y)) return true;
		}
		return false;
	}
	getHit(px, py){
		for(let c of this.childs){
			if (c.checkHit(px, py)){
				return c.getHit(px - c.x, py - c.y);
			}
		}
		if (0 <= px && 0 <= py && px < this.w && py < this.h) return this;
		return null;
	}
	getRootComponent(){
		return (this.parent != null) ? this.parent.getRootComponent() : this;
	}
	getGrobalPos(px, py){
		if(this.parent == null) return {x: this.x + px, y: this.y + py};
		else return this.parent.getGrobalPos(x + px, y + py);
	}
	activeChilds(c){
		let index = -1;
		for(let i = 0; i < this.childs.length; i++){
			if(c == this.childs[i]) {
				index = i;
				break;
			}
		}
		if(index == -1) return;
		for(let i = 0; i < index; i++){
			this.swapChilds(index - i, index - i - 1);
		}
	}
	swapChilds(index1, index2){
		let tmp = this.childs[index1];
		this.childs[index1] = this.childs[index2];
		this.childs[index2] = tmp;
	}
}

class RootComponent extends Component{
	constructor(){
		super(0, 0, width, height);

		this.pmousePressed = false;
		this.dragStartMouseX = 0;
		this.dragStartMouseY = 0;
		this.original = {x: 0, y: 0};
		this.mouse = {x: 0, y: 0};
		this.pmouse = {x: 0, y: 0};
		this.zoom = 1;
		this.wheel = 0;

		this.name = "Root";

		this.setup();
	}
	update(){
		this.pmouse.x = this.mouse.x;
		this.pmouse.y = this.mouse.y;
		this.mouse.x = (mouseX - this.original.x) / this.zoom;
		this.mouse.y = (mouseY - this.original.y) / this.zoom;
		this.sendMouseEvent();
		super.update_sub();
	}
	draw(){
		push();
		translate(this.original.x, this.original.y);
		scale(this.zoom);
		super.draw_sub();
		pop();
	};
	setZoom(tmp_wheel){
		this.wheel -= tmp_wheel;
		let post_zoom = Math.exp(this.wheel * 0.1);
		this.original.x = mouseX + (this.original.x - mouseX) * (post_zoom / this.zoom);
		this.original.y = mouseY + (this.original.y - mouseY) * (post_zoom / this.zoom);
		this.zoom = post_zoom;
	}
	sendMouseEvent(){
		if ((!mouseIsPressed) && this.dragFlag){
			this.childs[0].mouseEvent("UP", this.mouse.x - this.childs[0].x, this.mouse.y - this.childs[0].y, 0, 0);
			if(this.clickFlag) this.childs[0].mouseEvent("CLICK", this.mouse.x - this.childs[0].x, this.mouse.y - this.childs[0].y, 0, 0);
			this.dragFlag = false;
			this.clickFlag = false;
		}
		if(this.dragFlag){
			this.childs[0].mouseEvent("HIT", this.mouse.x - this.childs[0].x, this.mouse.y - this.childs[0].y, 0, 0);
			if(this.mouse.x != this.pmouse.x || this.mouse.y != this.pmouse.y){
				this.childs[0].mouseEvent("DRAG", this.mouse.x - this.childs[0].x, this.mouse.y - this.childs[0].y, this.dragStartMouseX - this.childs[0].x, this.dragStartMouseY - this.childs[0].y);
				this.clickFlag = false;
			}
		}
		else{
			for(let c of this.childs){
				if (c.checkHit(this.mouse.x, this.mouse.y)){
					c.mouseEvent("HIT", this.mouse.x - c.x, this.mouse.y - c.y, 0, 0);
					if(this.mouse.x != this.pmouse.x || this.mouse.y != this.pmouse.y){
						c.mouseEvent("MOVE", this.mouse.x - c.x, this.mouse.y - c.y, 0, 0);
					}
					if(mouseIsPressed && !this.pmousePressed){
						super.activeChilds(c);
						c.mouseEvent("DOWN", this.mouse.x - c.x, this.mouse.y - c.y, 0, 0);
						this.dragStartMouseX = this.mouse.x; this.dragStartMouseY = this.mouse.y;
						this.dragFlag = true;
						this.clickFlag = true;
					}
					break;
				}
			}
		}
		this.pmousePressed = mouseIsPressed;
	}
}

class DefaultComponent extends Component{
	constructor(tmp_x, tmp_y, tmp_w, tmp_h){
		super(tmp_x, tmp_y, tmp_w, tmp_h);
		this.name = "Empty Node";
	}
	setup(){
		super.add(new ResizeBox());
	}
	update(){
		if(this.parent != null){
			this.x = Math.max(0, this.x);
			this.y = Math.max(0, this.y);
			this.x = Math.min(this.x, this.parent.w - this.w);
			this.y = Math.min(this.y, this.parent.h - this.h);
		}
	}
	draw(){
		strokeWeight(2);
		stroke(30, 30, 30, 255);
		fill(220, 220, 220, 178);
		rect(0, 0, this.w, this.h, 4);
		fill(30, 30, 30, 255);
		textAlign(LEFT, BOTTOM);
		textSize(24);
		text(this.name, 0, -2);
	}
}

class ResizeBox extends Component{
	constructor(){
		super(0, 0, 0, 0);
		this.name = "ResizeBox";
	}
	setup(){
		this.w = this.h = 20;
		this.x = this.parent.w - this.w;
		this.y = this.parent.h - this.h;
	}
	update(){
		this.x = Math.max(0, this.x);
		this.y = Math.max(0, this.y);
		this.x = Math.max(this.parent.min_w - this.w, this.x);
		this.y = Math.max(this.parent.min_h, this.y);
		this.parent.w = this.x + this.w;
		this.parent.h = this.y + this.h;
	}
	draw(){
		noFill();
		strokeWeight(2);
		stroke(30, 30, 30, 255);
		line(this.w, 0, 0, this.h);
	}
	checkHit(px, py){
		return
			super.checkHit(px, py) &&
			(py - this.y > this.w - (px - this.x));
	}
	mouseEvent(type, tmp_x, tmp_y, start_x, start_y){
		if (super.mouseEventToChild(type, tmp_x, tmp_y, start_x, start_y)) return;
		switch(type) {
		case "HIT":
			break;
		case "DOWN":
			this.dragStartCompX = this.x;
			this.dragStartCompY = this.y;
			break;
		case "UP":
			
			break;
		case "CLICK":
			break;
		case "MOVE":
			break;
		case "DRAG":
			this.x = this.dragStartCompX + tmp_x - start_x;
			this.y = this.dragStartCompY + tmp_y - start_y;
			break;
		}
	}
}

class CursorComponent extends Component{
	constructor(tmp_x, tmp_y, tmp_color = {r: 255, g: 0, b: 0}){
		super(tmp_x, tmp_y, 0, 0);
		this.name = "PointComponent";
		this.c = tmp_color;
	}
	pos(){
		return {x: this.x + this.w / 2, y: this.y + this.h / 2};
	}
	set(tmp_x, tmp_y){
		this.x = tmp_x - this.w / 2;
		this.y = tmp_y - this.h / 2;
	}
	setup(){
		this.w = this.h = 20;
		this.x -= this.w / 2;
		this.y -= this.h / 2;
	}
	update(){
		this.x = Math.max(-this.w / 2, this.x);
		this.y = Math.max(-this.h / 2, this.y);
		this.x = Math.min(this.parent.w - this.w / 2, this.x);
		this.y = Math.min(this.parent.h - this.h / 2, this.y);
	}
	draw(){
		noFill();
		strokeWeight(2);
		stroke(this.c.r, this.c.g, this.c.b);
		ellipse(this.w / 2, this.h / 2, this.w, this.h);
	}
	checkHit(px, py){
		return (
			super.checkHit(px, py) &&
			(
				Math.sqrt(
					Math.pow(px - (this.x + this.w / 2), 2) + 
					Math.pow(py - (this.y + this.h / 2), 2)
				) <= this.w / 2
			)
		);
	}
	mouseEvent(type, tmp_x, tmp_y, start_x, start_y){
		if (super.mouseEventToChild(type, tmp_x, tmp_y, start_x, start_y)) return;
		switch(type) {
		case "HIT":
			break;
		case "DOWN":
			this.dragStartCompX = this.x;
			this.dragStartCompY = this.y;
			break;
		case "UP":
			
			break;
		case "CLICK":
			break;
		case "MOVE":
			break;
		case "DRAG":
			this.x = this.dragStartCompX + tmp_x - start_x;
			this.y = this.dragStartCompY + tmp_y - start_y;
			break;
		}
	}
}