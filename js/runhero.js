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
    var KEYCODE_M = 77;

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
		onLoadingScreen,
		onGameOverScreen,
		onShowLevelScreen = false,
		ShowLevelScreenDelay = 0,
		lvlShape,
		lvlText,
		lvlSlowDownRate = 1,
		screenState = 0,
		gotPoints,
		pointsTxt,
		highscore = 0,
		bestCombo = 0,
		level = 1,
		levelDifficulty = [0.15,0.11,0.08,0.06,0.04],
		levelPoints = [0,250,1000,3000,5000,9999999999],
		/* Combo vars */
		combo = false,
		comboMul = 1,
		comboTextCont,
		comboText,
		comboTextNum,
		comboTime = 0,
		comboTextList = [],
		comboBestOverGame = 0,
		bestComboTempOver,
		highscoreTempOver,
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
		onLoadingScreen = true;

		musicStart.play();
		self.highscoreCheck();

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
		//left.appendChild(canvas);
		self.canvas = canvas;

		// initializing the stage
		stage = new assMan.getAmStage();
		this.stage = stage;

		self.level = level;
		self.levelDifficulty = levelDifficulty;
		self.onShowLevelScreen = self;
		self.levelPoints = levelPoints;
		self.screenState = screenState;
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
		

		world = new Container();
		

		// creating the Hero, and assign an image
		// also position the hero in the middle of the screen
		hero = new Hero(spriteSheets[HERO_IMAGE], startPos);

		rockManager = new RockManager(this);

		// Start game and game over containers

		// bars, pts
		top = new Container();
		

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
 		blackAlphaShape.alpha = 0.3;
 		startGame.addChild(blackAlphaShape);

		graphics = new createjs.Graphics().beginFill("#000000").drawRect(0, self.height / 2 - 195, self.width, 33+20);
 		shape = new createjs.Shape(graphics);
 		shape.cache(0, self.height / 2 - 195, self.width, 33+20);
 		shape.alpha = 0.8;
 		startGame.addChild(shape);

		txt = new BitmapAnimation(spriteSheets[STRINGS_L]);
		txt.x = (self.width / 2) - (85*4) - 30;
		txt.y = self.height / 2 - 190;
		txt.scaleX = 0.7;
		txt.scaleY = 0.7;
		txt.snapToPixel = true;
		txt.gotoAndStop("samuraiRevenge");
		startGame.addChild(txt);

		pressSpaceTxt = new BitmapAnimation(spriteSheets[STRINGS]);
		pressSpaceTxt.snapToPixel = true;
		pressSpaceTxt.x = self.width - 270;
		pressSpaceTxt.y = self.height - 30;
		pressSpaceTxt.scaleX = .5;
		pressSpaceTxt.scaleY = .5;
		pressSpaceTxt.gotoAndStop("spaceToPlay");
		startGame.addChild(pressSpaceTxt);


		var highscoreTemp = self.getHighscoreText();
		highscoreTemp.y = self.height - 255;
		highscoreTemp.x = self.width / 2 + 50;
		highscoreTemp.snapToPixel = true;
		startGame.addChild(highscoreTemp);

		var bestComboTemp = self.getBestComboText();
		bestComboTemp.y = self.height - 205;
		bestComboTemp.x = self.width / 2 + 50;
		bestComboTemp.snapToPixel = true;
		startGame.addChild(bestComboTemp);

		onStartScreen = true;

		// GAMEOVER Screen
		gameOver = new Container();

		graphics = new createjs.Graphics().beginFill("#000").drawRect(0, 33, self.width, self.height - 33);
 		blackAlphaShape2 = new createjs.Shape(graphics);
 		blackAlphaShape2.cache(0, 33, self.width, self.height - 33);
 		blackAlphaShape2.alpha = 0.5;
		gameOver.addChild(blackAlphaShape2);

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

        bg.visible = false;
    	world.visible = false;
    	top.visible = false;
    	startGame.visible = false;
		stage.addChild(bg);
		stage.addChild(world);
		stage.addChild(top);
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

		// GAME LOADED
		stage.removeChild(assMan.getLoaderBar());
		pressSpaceTxt3 = new BitmapAnimation(spriteSheets[STRINGS]);
		pressSpaceTxt3.snapToPixel = true;
		pressSpaceTxt3.x = self.width - 280;
		pressSpaceTxt3.y = self.height - 43;
		pressSpaceTxt3.scaleX = .5;
		pressSpaceTxt3.scaleY = .5;
		pressSpaceTxt3.gotoAndStop("spaceToPlay");
		stage.addChild(pressSpaceTxt3);
	}


	self.reset = function() {
		collideables = [];
		self.lastPlatform = null;
		world.removeAllChildren();

		world.x = world.y = 0;
		bulletTime = false;
		elapsed = 0; // TIme? needed?

		level = 1;
		self.level = level;
		onShowLevelScreen = true;
		self.onShowLevelScreen = onShowLevelScreen;
		screenState = 0;

		if(top.getChildIndex(lvlText) > -1)
			top.removeChild(lvlText);
		if(top.getChildIndex(lvlShape) > -1)
			top.removeChild(lvlShape);

		comboBestOverGame = 0;

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
			gameOver.removeChild(highscoreTempOver);
			gameOver.removeChild(bestComboTempOver);
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
					if(comboMul > comboBestOverGame)
						comboBestOverGame = comboMul;

					comboTime += e / 1000;
					if(comboTime > 5) {
						comboTime = 0;
						combo = false;
						comboMul = 1;
					}
				}

				points += e / 1000 / SlowDownRate * comboMul;

				if((points | 0)*10 > oldPoints) {
					oldPoints = (points | 0)*10;

					top.removeChild(pointsTxt);
					pointsTxt = self.numToGfx(oldPoints);
					top.addChild(pointsTxt);
				}

				if(!bulletTime && bulletTimeLeft < 100) {
					bulletTimeLeft+= e*0.5 /100;

					bulletTimeTxt.text = '';
					for(i=0, l=bulletTimeLeft/1.6|0; i<=l; i++) {
			 			bulletTimeTxt.text += '|';
			 		}
				}

				if(bulletTime && (bulletTimeLeft > 0) && !onShowLevelScreen) {
					bulletTimeLeft-= e*2 /100;
				}

				if(bulletTime && (bulletTimeLeft <= 0)) {
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


				if(onShowLevelScreen) {
					if(screenState == -1) {
						ShowLevelScreenDelay+= e / 1000;
						if(ShowLevelScreenDelay > 1.5) {
							ShowLevelScreenDelay = 0;
							screenState++;
						}
					}

	                if(screenState == 0) {
	                	// Create objects necessary to show level
	                	var lvlSprite;
	                	switch(level) {
	                		case 1:
	                			lvlSprite = 'easy';
	                			break;
	                		break;
	                		case 2:
	                			lvlSprite = 'medium';
	                			break;
	                		break;
	                		case 3:
	                			lvlSprite = 'hard';
	                			break;
	                		break;
	                		case 4:
	                			lvlSprite = 'insane';
	                			break;
	                		case 5:
	                			lvlSprite = 'ridonkulous';
	                			break;
	                		break;
	                	}

            			var lvlGraphics = new createjs.Graphics().beginFill("#000000").drawRect(0, (self.height/5) | 0, self.width, 15*scale);
						lvlShape = new createjs.Shape(lvlGraphics);
						lvlShape.cache(0, (self.height/5) | 0, self.width, 15*scale);
						lvlShape.alpha = 0.9;
						top.addChild(lvlShape);

						lvlText = new BitmapAnimation(spriteSheets[STRINGS]);
						lvlText.gotoAndStop(lvlSprite);
						lvlText.snapToPixel = true;
						lvlText.y = ((self.height/5) + (15*scale - lvlText.getBounds().height)/2) | 0;
						lvlText.x = self.width;
						top.addChild(lvlText);

	                	screenState = 1;
	                }

	                if(screenState == 1) {
	                	// Move show level objects over screen

	                	lvlText.x -= e/lvlSlowDownRate ;

	                	if(lvlText.x <= (self.width/2) + 80 && lvlText.x >= (self.width/2) - 80) {
	                		lvlSlowDownRate = 4;
	                	} else {
	                		lvlSlowDownRate = 1;
	                	}
	                		
	                	if(lvlText.x < -lvlText.getBounds().width) {
	                		screenState = 2;
	                	}
	                }

	                if(screenState == 2) {
	                	// Remove objects and return to game
	                	top.removeChild(lvlText);
	                	top.removeChild(lvlShape);
	                	onShowLevelScreen = false;
	                	self.onShowLevelScreen = onShowLevelScreen;
	                	screenState = -1;
	                }

				}

				if(!onShowLevelScreen && levelPoints[level] <= oldPoints) {
					bulletTime = false;
	                SlowDownRate = 1;
	                hero._animation.frequency = 4;
	                rockManager.box2d.devideStep(SlowDownRate);

					level++;
					self.level = level;

					onShowLevelScreen = true;
					self.onShowLevelScreen = onShowLevelScreen;
				}

			} else {
				// Highscore and best combo - store in cookies
				if(oldPoints > highscore) {
					highscore = oldPoints;
					self.newHighscore(highscore);
				}
				if(comboBestOverGame > bestCombo) {
					bestCombo = comboBestOverGame;
					self.newBestCombo(bestCombo);
				}

				if(bulletTime) {
					bulletTime = false;
	                SlowDownRate = 1;
	                hero._animation.frequency = 4;
	                rockManager.box2d.devideStep(SlowDownRate);
				}

				musicOver.currentTime = 0;
				musicOver.play();
				onGameOverScreen = true;
				stage.addChild(gameOver);
				gotPoints = self.numToGfx(oldPoints);
				gotPoints.x = (self.width / 2 - (53 * scale * 5 / 2)) + 115| 0;
				gotPoints.y = (self.height / 2 + 20 | 0) - 3;
				gameOver.addChild(gotPoints);

				highscoreTempOver = self.getHighscoreText();
				highscoreTempOver.y = self.height - 255;
				highscoreTempOver.x = self.width / 2 + 50;
				highscoreTempOver.snapToPixel = true;
				gameOver.addChild(highscoreTempOver);

				bestComboTempOver = self.getBestComboText();
				bestComboTempOver.y = self.height - 210;
				bestComboTempOver.x = self.width / 2 + 50;
				bestComboTempOver.snapToPixel = true;
				gameOver.addChild(bestComboTempOver);

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
				pressSpaceTxt3.visible = !pressSpaceTxt3.visible;
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
            	if(hero.IsAlive && !bulletTime && (bulletTimeLeft > 0) /*&& !onShowLevelScreen*/) {
                	bulletTime = true;
                	SlowDownRate = 2;
                	hero.BulletTimeMoveHelper = 1.4;

                	hero._animation.frequency = 8;
               		rockManager.box2d.devideStep(SlowDownRate);
               	}
                break;	
            case KEYCODE_SPACE:
            	if(!onLoadingScreen) {
	                bulletTime = false;
	                SlowDownRate = 1;

	                self.reset();
	            	rockManager.box2d.removeAllBodies();
	            } else {
					stage.removeChild(pressSpaceTxt3);
	            	stage.removeChild(assMan.getLoaderBg());
	            	onLoadingScreen = false;

	            	bg.visible = true;
	            	world.visible = true;
	            	top.visible = true;
	            	startGame.visible = true;
	            	stage.update();
	            }
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
			 case KEYCODE_M:
			 	globalMusic.muted = !globalMusic.muted;
			 	globalMusic_slow.muted = !globalMusic_slow.muted;
			 	musicStart.muted = !musicStart.muted;
			 	musicOver.muted = !musicOver.muted;
			 	sfxHurt.muted = !sfxHurt.muted;
			 	sfxWhip.muted = !sfxWhip.muted;
			 	sfxWhip2.muted = !sfxWhip2.muted;
			 	sfxWhipSlow.muted = !sfxWhipSlow.muted;

			 	if(globalMusic.muted) {
			 		var mute = document.getElementById('muted');
			 		mute.style.display = 'inline';
			 	} else {
			 		var mute = document.getElementById('muted');
			 		mute.style.display = 'none';
			 	}
                break;
        }

	}

    self.numToGfx = function(num, offset) {
    	if(typeof(offset)==='undefined') var offset = 70;

    	var txtNum = num.toString();
    	var tempContainer = new Container;
    	var startX = offset;
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
    		comboTime = comboMul / 4;
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

		/*comboText = new createjs.Text('x'+comboMul, "18px Arial", "#FFF");
		comboText.x = rock.skin.x | 0;
		comboText.y = (rock.skin.y - 1.5*rock.skin.spriteSheet._frameHeight) | 0;
		comboText.startY = comboText.y;
		comboText.textAlign = "left";*/

		comboTextCont = new Container();
		comboTextCont.snapToPixel = true;

		comboText = new BitmapAnimation(spriteSheets[STRINGS]);
		comboText.x = rock.skin.x | 0;
		comboText.y = (rock.skin.y - 1.5*rock.skin.spriteSheet._frameHeight + 6) | 0;
		comboText.scaleX = 0.35; 
		comboText.scaleY = 0.35;
		comboText.gotoAndStop("nx");
		comboText.snapToPixel = true;

		comboTextCont.addChild(comboText);

		comboTextNum = self.numToGfx(comboMul,21);
		comboTextNum.x = rock.skin.x | 0;
		comboTextNum.y = (rock.skin.y - 1.5*rock.skin.spriteSheet._frameHeight) | 0;
		comboTextNum.scaleX = 0.55;
		comboTextNum.scaleY = 0.55;
		comboTextNum.snapToPixel = true;
		comboTextCont.addChild(comboTextNum);

		comboTextCont.startY = comboTextCont.y;
		top.addChild(comboTextCont);
 		comboTextList.push(comboTextCont);
    }

	self.highscoreCheck = function(comboBox, rock) {
		var new_highscore=getCookie("highscore");
		var new_bestCombo=getCookie("bestcombo");

		if (new_highscore != null) {
			highscore = new_highscore;
		} else {
			setCookie("highscore",0,365*6);
		}

		if (new_bestCombo != null) {
			bestCombo = new_bestCombo;
		} else {
			setCookie("bestcombo",0,365*6);
		}
	}

	self.newHighscore = function(newHighscore) {
		var old_highscore=getCookie("highscore");

		if(old_highscore == null)
			old_highscore = 0;

		if (old_highscore != null && old_highscore<newHighscore) {
			setCookie("highscore",newHighscore,365*6);
		}
	}

	self.newBestCombo = function(newBestcombo) {
		var old_bestcombo=getCookie("bestcombo");

		if(old_bestcombo == null)
			old_bestcombo = 0;

		if (old_bestcombo != null && old_bestcombo<newBestcombo) {
			setCookie("bestcombo",newBestcombo,365*6);
		}
	}

	self.getHighscoreText = function() {
		var highscoreCont = new Container();
		highscoreCont.snapToPixel = true;

		var graphics = new createjs.Graphics().beginFill("#000000").moveTo(0,10*scale).lineTo(-15*scale,10*scale).lineTo(0*scale,-5*scale).lineTo(0*scale,0*scale).drawRect(0, -5*scale, self.width - (self.width / 2 + 50), 15*scale);;
 		var shape = new createjs.Shape(graphics);
 		shape.cache(-15*scale,-15*scale, self.width - (self.width / 2 + 50) + (15*scale), 30*scale);
 		shape.alpha = 0.8;
 		highscoreCont.addChild(shape);

		highscoreText = new BitmapAnimation(spriteSheets[STRINGS]);
		highscoreText.gotoAndStop("highScore");
		highscoreText.snapToPixel = true;
		highscoreText.scaleX = .6;
		highscoreText.scaleY = .6;
		highscoreText.y = 3

		highscoreCont.addChild(highscoreText);

		highscoreNum = self.numToGfx(highscore,174);
		highscoreNum.y = -10;
		highscoreNum.snapToPixel = true;

		highscoreCont.addChild(highscoreNum);
		return highscoreCont;
	}

	self.getBestComboText = function() {
		var comboCont = new Container();
		comboCont.snapToPixel = true;

		var graphics = new createjs.Graphics().beginFill("#000000").moveTo(0,10*scale).lineTo(-15*scale,10*scale).lineTo(0*scale,-5*scale).lineTo(0*scale,0*scale).drawRect(0, -5*scale, self.width - (self.width / 2 + 50), 15*scale);;
 		var shape = new createjs.Shape(graphics);
 		shape.cache(-15*scale,-15*scale, self.width - (self.width / 2 + 50) + (15*scale), 30*scale);
 		shape.alpha = 0.8;
 		comboCont.addChild(shape);

		comboText = new BitmapAnimation(spriteSheets[STRINGS]);
		comboText.gotoAndStop("bestCombo");
		comboText.snapToPixel = true;
		comboText.scaleX = .6;
		comboText.scaleY = .6;
		comboText.y = 3

		comboCont.addChild(comboText);

		comboNum = self.numToGfx(bestCombo,184);
		comboNum.y = -10;
		comboNum.snapToPixel = true;

		comboCont.addChild(comboNum);

		//comboCont.cache();

		return comboCont;

	}
    

	//self.preloadResources();
	assMan = new AssetManager(this);

};

new _game();