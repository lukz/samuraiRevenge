var 	BASE_WIDTH = 320,
		BASE_HEIGHT = 240,
		TARGET_WIDTH = 800,
		TARGET_HEIGHT = 600,
		GRID_HORIZONTAL = 8,
		GRID_VERTICAL = 4;


    var KEYCODE_UP = 38;
    var KEYCODE_LEFT = 37;
    var KEYCODE_RIGHT = 39;
    var KEYCODE_W = 87;
    var KEYCODE_A = 65;
    var KEYCODE_D = 68;
    var KEYCODE_CTRL = 17;
    var KEYCODE_SPACE = 32;

function _game() {

	window.Game = this;
	var self = this,
		//w = getWidth(),
		//h = getHeight(),
		w = TARGET_WIDTH,
		h = TARGET_HEIGHT,

		scale = snapValue(Math.min(w/BASE_WIDTH,h/BASE_HEIGHT),.5),
		ticks = 0,
		canvas,ctx,
		stage,
		background,
		background_2,
		world,
		top,
		waterfallLayer,
		hero, fly,
		parallaxMapLayers = [],
		oldPoints = 0,
		points = 0,
		bulletTimeLeft = 100,
		bulletTimeTxt,
		pressSpaceTxt,
		onStartScreen,
		onGameOverScreen,
		gotPoints,
		pointsTxt,
		/* Combo vars */
		combo = false,
		comboMul = 1,
		comboText,
		comboTime = 0,
		comboTextList = [],
		/* Combo vars */
		startPos = {        
			x : w/2,
			y : h/2 + 10 * scale
		};
		SlowDownRate = 1;

	self.width = w;
	self.height = h;
	self.scale = scale;

		// For tick()
		var c,p,l,layersCount,currTime,newScreenPos,l;

	// holds all collideable objects
	var collideables = [];
	self.getCollideables = function() { return collideables; };
	self.getHero = function() {return hero;}

	self.initializeGame = function() {
		musicStart.play();

		// get assets from asset manager
		assets = assMan.getAssets();
		spriteSheets = assMan.getSpriteSheets();

		//DEBUG MODE
		//stats = new Stats();
		//stats.domElement.style.display = 'none';
  		//stats.domElement.style.position = 'absolute';
  		//stats.domElement.style.left = '0px';
  		//stats.domElement.style.bottom = '0px';
  		//document.body.appendChild( stats.domElement );

		assMan.nns();
		assMan.initializeSpriteSheets();

		// creating the canvas-element
		//left = document.getElementById('left');
		//canvas = document.createElement('canvas');
		canvas = document.getElementById('canvas');
		canvas.width = w;
		canvas.height = h;
		canvas.id = "Canvas";
		left.appendChild(canvas);
		self.canvas = canvas;

		// initializing the stage
		stage = new Stage(canvas);
		this.stage = stage;

		/**
		 ** Create paralax bg
		 **/
		bg = new Container();
		layersCount = 3;
		for ( var i = 0; i < layersCount; i++) {
			var tempLayer = new BitmapAnimation(spriteSheets[MAP_PRLX]);
			var layerName = "layer" + (i+1);
			tempLayer.gotoAndStop(layerName);
			tempLayer.snapToPixel = true;

			bg.addChild(tempLayer);
			parallaxMapLayers.push(tempLayer);
		}
		layersCount = parallaxMapLayers.length;

		background = self.createMapBg();
		bg.addChild(background);
		stage.addChild(bg);

		world = new Container();
		stage.addChild(world);

		// creating the Hero, and assign an image
		// also position the hero in the middle of the screen
		hero = new Hero(spriteSheets[HERO_IMAGE], startPos);

		rockManager = new RockManager(this);

		// Start game and game over containers
		info = new Container();
		stage.addChild(info);

		// bars, pts
		top = new Container();
		stage.addChild(top);

		var graphics = new createjs.Graphics().beginFill("#000000").drawRect(0, 0, self.width, 33);
 		var shape = new createjs.Shape(graphics);
 		shape.cache(0, 0, self.width, 33);
 		shape.alpha = 0.7;
 		top.addChild(shape);

 		pointsTxt = self.numToGfx(points);
 		top.addChild(pointsTxt);
		/*pointsTxt = new createjs.Text(points, "27px Arial", "#FFF");
		pointsTxt.x = 65;
		pointsTxt.y = 0;
		pointsTxt.textAlign = "left";*/
		
		pointsTxt2 = new BitmapAnimation(spriteSheets[STRINGS]);
		pointsTxt2.x = 12;
		pointsTxt2.y = 17;
		pointsTxt2.scaleX = .3;
		pointsTxt2.scaleY = .3;
		pointsTxt2.gotoAndStop("points");
		top.addChild(pointsTxt2);

		bulletBar = new Container();
		top.addChild(bulletBar);

		graphics = new createjs.Graphics().beginStroke("#fff").drawRect(self.width - 205 + 3, 5 + 3, 200 - 6, 23 - 6);
 		shape = new createjs.Shape(graphics);
 		shape.cache(self.width - 205, 5, 200, 23);
 		top.addChild(shape);

 		bulletTimeTxt = new createjs.Text("", "12px Arial", "#FFF");
 		bulletTimeTxt.x = self.width - 205 + 6;
		bulletTimeTxt.y = 5 + 3;
		bulletTimeTxt.textAlign = "left";
 		for(i=0, l=bulletTimeLeft/1.6|0; i<=l; i++) {
 			bulletTimeTxt.text += '|';
 		}
 		top.addChild(bulletTimeTxt);

 		var hourglass = new Bitmap(assets[HOURGLASS]);
		hourglass.snapToPixel = true;
		hourglass.x = self.width - 224;
		hourglass.y = 4;
		top.addChild(hourglass);

		// make welcome and gameover screen. Also show welcome screen
		startGame = new Container();

		graphics = new createjs.Graphics().beginFill("#000").drawRect(0, 33, self.width, self.height - 33);
 		blackAlphaShape = new createjs.Shape(graphics);
 		blackAlphaShape.cache(0, 33, self.width, self.height - 33);
 		blackAlphaShape.alpha = 0.5;
 		startGame.addChild(blackAlphaShape);

		var txt = new BitmapAnimation(spriteSheets[STRINGS]);
		txt.x = 45;
		txt.y = self.height - 285;
		txt.gotoAndStop("controls");
		startGame.addChild(txt);
 		var keys = new Bitmap(assets[KEYS]);
		keys.snapToPixel = true;
		keys.x = 20;
		keys.y = self.height - 250;
		startGame.addChild(keys);

		txt = new BitmapAnimation(spriteSheets[STRINGS]);
		txt.x = 290;
		txt.y = self.height - 97;
		txt.scaleX = .5;
		txt.scaleY = .5;
		txt.gotoAndStop("bulletTime");
		startGame.addChild(txt);
		txt = new BitmapAnimation(spriteSheets[STRINGS]);
		txt.x = 290;
		txt.y = self.height - 40;
		txt.scaleX = .5;
		txt.scaleY = .5;
		txt.gotoAndStop("reset");
		startGame.addChild(txt);

		pressSpaceTxt = new BitmapAnimation(spriteSheets[STRINGS]);
		pressSpaceTxt.x = self.width - 270;
		pressSpaceTxt.y = self.height - 30;
		pressSpaceTxt.scaleX = .5;
		pressSpaceTxt.scaleY = .5;
		pressSpaceTxt.gotoAndStop("spaceToPlay");
		startGame.addChild(pressSpaceTxt);

		onStartScreen = true;

		// GAMEOVER Screen
		gameOver = new Container();
		gameOver.addChild(blackAlphaShape);

		txt = new BitmapAnimation(spriteSheets[STRINGS_L]);
		txt.x = self.width / 2 - (53 * scale * 5 / 2)| 0;
		txt.y = (self.height / 2 | 0) - 50;
		txt.gotoAndStop("gameOver");
		gameOver.addChild(txt);

		txt = new BitmapAnimation(spriteSheets[STRINGS]);
		txt.x = self.width / 2 - (53 * scale * 5 / 2)| 0;
		txt.y = (self.height / 2 + 20 | 0);
		txt.gotoAndStop("points");
		gameOver.addChild(txt);

		pressSpaceTxt2 = new BitmapAnimation(spriteSheets[STRINGS]);
		pressSpaceTxt2.x = self.width - 270;
		pressSpaceTxt2.y = self.height - 30;
		pressSpaceTxt2.scaleX = .5;
		pressSpaceTxt2.scaleY = .5;
		pressSpaceTxt2.gotoAndStop("spaceToPlay");
		gameOver.addChild(pressSpaceTxt2);

		onGameOverScreen = false;

 		stage.addChild(startGame);

		/*globalMusic.addEventListener('ended', function() {
   			globalMusic.currentTime = 0;
    		globalMusic.play();
		}, false);*/

		// Setting the listeners
		if ('ontouchstart' in document.documentElement) {
			canvas.addEventListener('touchstart', function(e) {
				self.handleKeyDown();
			}, false);

			canvas.addEventListener('touchend', function(e) {
				self.handleKeyUp();
			}, false);
		} else {
			document.onkeydown = self.handleKeyDown;
			document.onkeyup = self.handleKeyUp;
			//document.onmousedown = self.handleKeyDown;
			//document.onmouseup = self.handleKeyUp;
		}
		Ticker.setFPS(60);
		Ticker.useRAF = true;
		Ticker.addListener(self.tick, self);
	}


	self.reset = function() {
		collideables = [];
		self.lastPlatform = null;
		world.removeAllChildren();

		world.x = world.y = 0;
		bulletTime = false;
		elapsed = 0; // TIme? needed?

		combo = false;
		comboMul = 1;
		comboTime = 999;
		points = 0;
		oldPoints = 0;
		top.removeChild(pointsTxt);
		pointsTxt = self.numToGfx(points);
		top.addChild(pointsTxt);

		bulletTimeLeft = 100;
		bulletTimeTxt.text = '';
		for(i=0, l=bulletTimeLeft/1.6|0; i<=l; i++) {
 			bulletTimeTxt.text += '|';
 		}

		if(onStartScreen) {
			stage.removeChild(startGame);
			musicStart.pause();
		}
		onStartScreen = false;

		if(onGameOverScreen) {
			musicOver.pause();
			gameOver.removeChild(gotPoints);
			stage.removeChild(gameOver);
		}
		onGameOverScreen = false;

		hero.reset(startPos);

		globalMusic.currentTime = 0;
		globalMusic_slow.currentTime = 0;
		globalMusic.play();

		world.addChild(hero);
		rockManager.reset(world);
		// add a platform for the hero to collide with
		self.addFloor(0, h/1.25);
	}

	self.tick = function(e)
	{
		//stats.begin(); // DEBUG
		elapsed = e / 1000 / SlowDownRate;
	

		if(!onStartScreen && !onGameOverScreen) {

			if(hero.IsAlive) {

				// check if it's not time to reset comboMul
				if(combo = true) {
					comboTime += e / 1000;
					if(comboTime > 5) {
						comboTime = 0;
						combo = false;
						comboMul = 1;
					}
				}

				points += e / 1000 / SlowDownRate * comboMul;


			} else {
				musicOver.currentTime = 0;
				musicOver.play();
				onGameOverScreen = true;
				stage.addChild(gameOver);
				gotPoints = self.numToGfx(oldPoints);
				gotPoints.x = (self.width / 2 - (53 * scale * 5 / 2)) + 115| 0;
				gotPoints.y = (self.height / 2 + 20 | 0) - 3;
				gameOver.addChild(gotPoints);
			}

			if((points | 0)*10 > oldPoints) {
				oldPoints = (points | 0)*10;

				top.removeChild(pointsTxt);
				pointsTxt = self.numToGfx(oldPoints);
				top.addChild(pointsTxt);
			}

			if(bulletTime && (bulletTimeLeft > 0) && hero.IsAlive) {
				bulletTimeLeft-= e /100;
			} else if(bulletTime && !hero.IsAlive) {
				//self.handleKeyUp(e.keyCode = KEYCODE_CTRL);
				// do smth when collision when in bullet time?
				// cos wymyslic jak trzyma sie czas a konczy sie bullet timeline
			}

			if(bulletTime && (bulletTimeLeft < 0)) {
				bulletTime = false;
                SlowDownRate = 1;
                hero._animation.frequency = 4;
                rockManager.box2d.devideStep(SlowDownRate);
			}

			// 1.6 FTW!
			if(bulletTime) {
				bulletTimeTxt.text = '';
				for(i=0, l=bulletTimeLeft/1.6|0; i<=l; i++) {
		 			bulletTimeTxt.text += '|';
		 		}
			}

			rockManager.tick(world,e);
			hero.tick();
			
			if(bulletTime && !globalMusic.paused) {
				currTime = globalMusic.currentTime;
				globalMusic_slow.currentTime = currTime * 2;
				globalMusic_slow.play();
				globalMusic.pause();
			}

			if(!bulletTime && !globalMusic_slow.paused) {
				currTime = globalMusic_slow.currentTime;
				globalMusic.currentTime = currTime / 2;
				globalMusic.play();
				globalMusic_slow.pause();
			}

			newScreenPos = -hero.x + w*.5;

			// Handle left edge
			if(newScreenPos < 0) {
				world.x = newScreenPos;
			}
			else if(newScreenPos > 0) {
				world.x = 0;
			} 

			// Bad idea, can be done in ealier IF (do it once!), also hardcoded -200 value!
			if(newScreenPos < -200) {
				world.x = -200;
			}

			// Move and remove combo points
			for(i=0, l=comboTextList.length; i<l; i++) {
				comboTextList[i].y-=0.7;
				if(comboTextList[i].startY - comboTextList[i].y > 20) {
					top.removeChild(comboTextList[i]);
					comboTextList.splice(i,1);
                    i--;
                    l--;
				}

			}

			
			background.x = (world.x);
			background.y = (world.y);

		} else {
			ticks++;
			if(ticks % 30 === 0) {
				ticks = 0;
				pressSpaceTxt.visible = !pressSpaceTxt.visible;
				pressSpaceTxt2.visible = !pressSpaceTxt2.visible;
			}
		}
		
		/**
		 ** Paralax scrolling
		 */
		for (i = 0; i < layersCount; i++ ) {
			p = parallaxMapLayers[i];
			p.x = (world.x * i  * 0.3);
		}

		stage.update();
		//stats.end(); // DEBUG
	}

	self.createMapBg = function() {
		//var map = new Bitmap(assets[MAP]);
		var map = new BitmapAnimation(spriteSheets[MAP_PRLX]);
		map.gotoAndStop("layer4");
		map.snapToPixel = true;

		return map;
	}

	self.addFloor = function(x,y) {

		// Floor
		x = Math.round(x);
		y = Math.round(y);

		var platform = new Bitmap(assets[FLOOR]);
		platform.x = x;
		platform.y = y;
		platform.snapToPixel = true;

		collideables.push(platform);

		// Left side
		var side = new Bitmap(assets[SIDE]);
		side.scaleX = 5;
		side.x = 0 - side.image.width*side.scaleX;
		side.y = 0;
		side.snapToPixel = true;
		collideables.push(side);

		//Right side
		var side2 = new Bitmap(assets[SIDE]);
		side2.scaleX = 5;
		side2.x = w;
		side2.y = 0;
		side2.snapToPixel = true;
		collideables.push(side2);
	}

	self.handleKeyDown = function(e)
	{
		//cross browser issues exist
        if (!e) { var e = window.event; }
        switch (e.keyCode) {		
            case KEYCODE_A: ;
            case KEYCODE_LEFT:
                hero.left();
                break;
            case KEYCODE_D: ;
            case KEYCODE_RIGHT:
                hero.right();
                break;
            case KEYCODE_W: ;
            case KEYCODE_UP:
                hero.jump();
                hero.isJumping = true;
                break;
            case KEYCODE_CTRL:
            	if(hero.IsAlive && !bulletTime && (bulletTimeLeft > 0)) {
                	bulletTime = true;
                	SlowDownRate = 2;
                	hero.BulletTimeMoveHelper = 1.4;

                	hero._animation.frequency = 8;
               		rockManager.box2d.devideStep(SlowDownRate);
               	}
                break;	
            case KEYCODE_SPACE:
                bulletTime = false;
                SlowDownRate = 1;

                self.reset();
            	rockManager.box2d.removeAllBodies();
            	break;
        }
	}

	self.handleKeyUp = function(e)
	{
        //cross browser issues exist
        if (!e) { var e = window.event; }

        switch (e.keyCode) {
            case KEYCODE_A: ;
            case KEYCODE_LEFT: ;
            	//console.log(e);
            	//	hero.direction.left = 0;
            	if(hero.direction == -1)
            		hero.direction = 0;

            	break;
            case KEYCODE_D: ;
            case KEYCODE_RIGHT:
                //	hero.direction.right = 0;
            	if(hero.direction == 1)
            		hero.direction = 0;
                break;
            case KEYCODE_W: ;
            case KEYCODE_UP:
                hero.isJumping = false;
                break;
            case KEYCODE_CTRL:
                bulletTime = false;
                SlowDownRate = 1;
                hero.BulletTimeMoveHelper = 1;
                hero._animation.frequency = 4;
                rockManager.box2d.devideStep(SlowDownRate);
                break;
        }

	}

    self.numToGfx = function(num) {
    	var txtNum = num.toString();
    	var tempContainer = new Container;
    	var startX = 70;
    	var numY = 3;

		for(var i=0; i<txtNum.length; i++) {
			switch(txtNum[i]) {
				case '0':
					var n0 = new BitmapAnimation(spriteSheets[STRINGS]);
					n0.x = startX + i*12*scale;
					n0.y = numY;
					n0.gotoAndStop("n0");
					tempContainer.addChild(n0);
				break;
				case '1':
					var n1 = new BitmapAnimation(spriteSheets[STRINGS]);
					n1.x = startX + i*12*scale;
					n1.y = numY;
					n1.gotoAndStop("n1");
					tempContainer.addChild(n1);
				break;
				case '2':
					var n2 = new BitmapAnimation(spriteSheets[STRINGS]);
					n2.x = startX + i*12*scale;
					n2.y = numY;
					n2.gotoAndStop("n2");
					tempContainer.addChild(n2);
				break;
				case '3':
					var n3 = new BitmapAnimation(spriteSheets[STRINGS]);
					n3.x = startX + i*12*scale;
					n3.y = numY;
					n3.gotoAndStop("n3");
					tempContainer.addChild(n3);
				break;
				case '4':
					var n4 = new BitmapAnimation(spriteSheets[STRINGS]);
					n4.x = startX + i*12*scale;
					n4.y = numY;
					n4.gotoAndStop("n4");
					tempContainer.addChild(n4);
				break;
				case '5':
					var n5 = new BitmapAnimation(spriteSheets[STRINGS]);
					n5.x = startX + i*12*scale;
					n5.y = numY;
					n5.gotoAndStop("n5");
					tempContainer.addChild(n5);
				break;
				case '6':
					var n6 = new BitmapAnimation(spriteSheets[STRINGS]);
					n6.x = startX + i*12*scale;
					n6.y = numY;
					n6.gotoAndStop("n6");
					tempContainer.addChild(n6);
				break;
				case '7':
					var n7 = new BitmapAnimation(spriteSheets[STRINGS]);
					n7.x = startX + i*12*scale;
					n7.y = numY;
					n7.gotoAndStop("n7");
					tempContainer.addChild(n7);
				break;
				case '8':
					var n8 = new BitmapAnimation(spriteSheets[STRINGS]);
					n8.x = startX + i*12*scale;
					n8.y = numY;
					n8.gotoAndStop("n8");
					tempContainer.addChild(n8);
				break;
				case '9':
					var n9 = new BitmapAnimation(spriteSheets[STRINGS]);
					n9.x = startX + i*12*scale;
					n9.y = numY;
					n9.gotoAndStop("n9");
					tempContainer.addChild(n9);
				break;
			}

		}
		return tempContainer;
    }

    self.combo = function(comboBox, rock) {

    	if(combo) {
    		comboMul += 1;
    		comboTime = comboMul / 3;
    	} else {
    		combo = true;
    		comboTime = 0;
    	}
    	if(bulletTime == true) {
    	    sfxWhipSlow.pause();
            sfxWhipSlow.currentTime = 0;
            sfxWhipSlow.play();
    	} else if((Math.floor(Math.random() * 2) + 1) == 1) {
    	    sfxWhip.pause();
            sfxWhip.currentTime = 0;
            sfxWhip.play();
    	} else {
    	    sfxWhip2.pause();
            sfxWhip2.currentTime = 0;
            sfxWhip2.play();
    	}

		comboText = new createjs.Text('x'+comboMul, "18px Arial", "#FFF");
		comboText.x = rock.skin.x | 0;
		comboText.y = (rock.skin.y - 1.5*rock.skin.spriteSheet._frameHeight) | 0;
		comboText.startY = comboText.y;
		comboText.textAlign = "left";

		top.addChild(comboText);

 		comboTextList.push(comboText);
    }

	//self.preloadResources();
	assMan = new AssetManager(this);

};

new _game();