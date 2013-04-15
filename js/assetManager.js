// CLEAR ASSETS!
var     HERO_IMAGE = 'assets/other/samurai.png',
        //MAP= 'assets/maps/map1.png',
        MAP_PRLX= 'assets/maps/map1_paralax.png',
        FLOOR = 'assets/other/floor.png',
        SIDE = 'assets/other/side.png',
        HOURGLASS = 'assets/other/hourglass.png',
        KEYS = 'assets/other/keys.png',
        ROCK_S = 'assets/other/rock_s.png',
        ROCK_M = 'assets/other/rock_m.png',
        ROCK_L = 'assets/other/rock_l.png',
        STRINGS = 'assets/other/strings.png',
        STRINGS_L = 'assets/other/stringsl.png',

        GAME_MUSIC = 'assets/music/game',
        GAME_MUSIC_SLOW = 'assets/music/game_slow',
        MUSIC_START = 'assets/music/honor',
        MUSIC_OVER = 'assets/music/liyan',

        SFX_HURT = 'assets/sfx/hurt',
        SFX_WHIP = 'assets/sfx/tailwhip',
        SFX_WHIP2 = 'assets/sfx/tailwhip2';
        SFX_WHIP_S = 'assets/sfx/tailwhip_slow';

        ASSET_COUNT = 18;

(function (window) {

    var assets = [], 
        spriteSheets = [],
        theGame,
        self = this,
        scale;

    AssetManager.prototype.getAssets = function() { return assets; };
    AssetManager.prototype.getSpriteSheets = function() { return spriteSheets; };

    function AssetManager(game) {
        scale = game.scale;

        this.initialize(game);
    }

    AssetManager.prototype.initialize = function (game) {
        theGame = game;

        var canPlayMp3;
        var canPlayOgg;

        // For drawing load progress
        var canvas = document.getElementById('canvas');
        stage = new createjs.Stage(canvas);

        var downloadProgress;
        var loaderBar = new createjs.Container();
        var barHeight = 20;
        var loaderColor = createjs.Graphics.getRGB(247,247,247);
        bar = new createjs.Shape();
        bar.graphics.beginFill(loaderColor).drawRect(0, 0, 1, barHeight).endFill();

        loaderWidth = 300;
        var bgBar = new createjs.Shape();
        var padding = 3;
        bgBar.graphics.setStrokeStyle(1).beginStroke(loaderColor).drawRect(-padding/2, -padding/2, loaderWidth+padding, barHeight+padding);

        loaderBar.x = canvas.width - loaderWidth>>1;
        loaderBar.y = canvas.height - barHeight>>1; 
        loaderBar.addChild(bar, bgBar);    

        stage.addChild(loaderBar);
        stage.update();


        // Need to check the canPlayType first or an exception
        // will be thrown for those browsers that don't support it      
        var myAudio = document.createElement('audio');

        if (myAudio.canPlayType) {
            // Currently canPlayType(type) returns: "", "maybe" or "probably" 
            canPlayMp3 = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/mpeg');
            canPlayOgg = !!myAudio.canPlayType && "" != myAudio.canPlayType('audio/ogg; codecs="vorbis"');
        }

        var audioExtension = ".none";

        if (canPlayMp3)
            audioExtension = ".mp3";
        else if (canPlayOgg) {
            audioExtension = ".ogg";
        }


        self.loadImage(HERO_IMAGE);
        //self.loadImage(MAP);
        self.loadImage(MAP_PRLX);
        self.loadImage(FLOOR);
        self.loadImage(SIDE);
        self.loadImage(HOURGLASS);
        self.loadImage(KEYS);
        self.loadImage(STRINGS);
        self.loadImage(STRINGS_L); // SORRY, I could not solve that :(

        self.loadImage(ROCK_S);
        self.loadImage(ROCK_M);
        self.loadImage(ROCK_L);

        globalMusic = new Audio();
        globalMusic_slow = new Audio();
        globalMusic.loop = true;
        globalMusic_slow.loop = true;

        musicStart = new Audio();
        musicStart.loop = true;
        musicOver = new Audio();
        musicOver.loop = true;

        sfxHurt = new Audio();
        sfxWhip = new Audio();
        sfxWhip2 = new Audio();
        sfxWhipSlow = new Audio();
        self.loadSound(globalMusic, GAME_MUSIC + audioExtension);
        self.loadSound(globalMusic_slow, GAME_MUSIC_SLOW + audioExtension);
        self.loadSound(sfxHurt, SFX_HURT + audioExtension);
        self.loadSound(sfxWhip, SFX_WHIP + audioExtension);
        self.loadSound(sfxWhip2, SFX_WHIP2 + audioExtension);
        self.loadSound(sfxWhipSlow, SFX_WHIP_S + audioExtension);
        self.loadSound(musicStart, MUSIC_START + audioExtension);
        self.loadSound(musicOver, MUSIC_OVER + audioExtension);
    }

    var requestedAssets = 0,
        loadedAssets = 0;
    // loads the assets and keeps track 
    // of how many assets where there to
    // be loaded
    self.loadImage = function(e) {
        var img = new Image();
        img.onload = self.onLoadedAsset;
        img.src = e;

        assets[e] = img;

        ++requestedAssets;
    }

    self.loadSound = function(assetElement, url) {
        assetElement.src = url;
        assetElement.addEventListener('canplaythrough', self.onLoadedAsset, false);
        assetElement.load();

        ++requestedAssets;
    };

    // each time an asset is loaded
    // check if all assets are complete
    // and initialize the game, if so
    self.onLoadedAsset = function(e) {
        ++loadedAssets;
        
        bar.scaleX = (loaderWidth/ASSET_COUNT)*loadedAssets | 0;
        stage.update();

        if ( loadedAssets == requestedAssets ) {
            stage.removeAllChildren();
            stage.update();
            theGame.initializeGame();
        }
        
    }


    AssetManager.prototype.nns = function() {
        assets[HERO_IMAGE] = nearestNeighborScale(assets[HERO_IMAGE], scale);
        //assets[MAP] = nearestNeighborScale(assets[MAP], scale);
        assets[MAP_PRLX] = nearestNeighborScale(assets[MAP_PRLX], scale);
        assets[FLOOR] = nearestNeighborScale(assets[FLOOR], scale);
        assets[SIDE] = nearestNeighborScale(assets[SIDE], scale);
        assets[HOURGLASS] = nearestNeighborScale(assets[HOURGLASS], scale / 1.4);
        assets[KEYS] = nearestNeighborScale(assets[KEYS], scale * 2);
        assets[ROCK_S] = nearestNeighborScale(assets[ROCK_S], scale);
        assets[ROCK_M] = nearestNeighborScale(assets[ROCK_M], scale);
        assets[ROCK_L] = nearestNeighborScale(assets[ROCK_L], scale);

        assets[STRINGS] = nearestNeighborScale(assets[STRINGS], scale * 2);
        assets[STRINGS_L] = nearestNeighborScale(assets[STRINGS_L], scale * 5);
    }

    AssetManager.prototype.initializeSpriteSheets = function() {
        var heroData = {
            images: [assets[HERO_IMAGE]],
            frames: {
                height: 17 * scale,
                width: 14 * scale,
                regX: 7 * scale,
                regY: 8 * scale,
                count: 5
            },
            animations: {
                walk: {
                    frames:[0, 2, 3, 4],
                    next: "idle",
                    frequency: 4
                },
                idle: {
                    frames:[0,1],
                    next: "idle",
                    frequency: 45
                },
                jump: {
                    frames:[4],
                    next: "jump"
                }
            }
        }
        spriteSheets[HERO_IMAGE] = new SpriteSheet(heroData);
        SpriteSheetUtils.addFlippedFrames(spriteSheets[HERO_IMAGE], true, false, false);


        var rockSData = {
            images: [assets[ROCK_S]],
            frames: {
                height: 12 * scale,
                width: 12 * scale,
                regX: 6 * scale,
                regY: 6 * scale,
                count: 4
            },
            animations: {
                fall: {
                    frames:[0, 1, 2, 3],
                    next: "fall",
                    frequency: 8
                }
            }
        }
        spriteSheets[ROCK_S] = new SpriteSheet(rockSData);

        var rockMData = {
            images: [assets[ROCK_M]],
            frames: {
                height: 16 * scale,
                width: 16 * scale,
                regX: 8 * scale,
                regY: 8 * scale,
                count: 4
            },
            animations: {
                fall: {
                    frames:[0, 1, 2, 3],
                    next: "fall",
                    frequency: 8
                }
            }
        }
        spriteSheets[ROCK_M] = new SpriteSheet(rockMData);

        var rockLData = {
            images: [assets[ROCK_L]],
            frames: {
                height: 20 * scale,
                width: 20 * scale,
                regX: 10 * scale,
                regY: 10 * scale,
                count: 4
            },
            animations: {
                fall: {
                    frames:[0, 1, 2, 3],
                    next: "fall",
                    frequency: 8
                }
            }
        }
        spriteSheets[ROCK_L] = new SpriteSheet(rockLData);

        var map_prlx = {
            images: [assets[MAP_PRLX]],
            frames: [
                [0,0,400*scale,/*240*/117*scale],
                [0,240*scale,400*scale,133*scale],
                [0,480*scale,400*scale,157*scale],
                [0,720*scale,400*scale,240*scale]
            ],
            animations: {
                layer1:[0],
                layer2:[1],
                layer3:[2],
                layer4:[3],
            }
        }
        spriteSheets[MAP_PRLX] = new SpriteSheet(map_prlx);
        
        var scale_temp = scale;

        scale = scale * 2;
        var stringsData = {
            images: [assets[STRINGS]],
            frames: [
                [0,0,107*scale,10*scale],
                [0,11*scale,139*scale,5*scale],
                [0,17*scale,53*scale,5*scale],
                [0,23*scale,35*scale,5*scale],
                [0,29*scale,47*scale,5*scale],
                [0,35*scale,77*scale,5*scale],
                [0,41*scale,41*scale,5*scale],
                [0,47*scale,55*scale,5*scale],
                //Numbers
                [0*scale,53*scale,5*scale,5*scale],
                [6*scale,53*scale,5*scale,5*scale],
                [12*scale,53*scale,5*scale,5*scale],
                [18*scale,53*scale,5*scale,5*scale],
                [24*scale,53*scale,5*scale,5*scale],
                [30*scale,53*scale,5*scale,5*scale],
                [36*scale,53*scale,5*scale,5*scale],
                [42*scale,53*scale,5*scale,5*scale],
                [48*scale,53*scale,5*scale,5*scale],
                [54*scale,53*scale,5*scale,5*scale]
            ],
            animations: {
                spaceToPlay:[0],
                paused:[1],
                gameOver:[2],
                points:[3],
                controls:[4],
                bulletTime:[5],
                reset:[6],
                highScore:[7],
                n0:[8],
                n1:[9],
                n2:[10],
                n3:[11],
                n4:[12],
                n5:[13],
                n6:[14],
                n7:[15],
                n8:[16],
                n9:[17],
                glitchNumber: {
                    frames:[13, 11, 8, 16, 17, 9, 12, 15, 10, 12, 14],
                    next: "glitchNumber",
                    frequency: 2
                },
                glitchNumber_mid: {
                    frames:[13, 10, 12, 15, 10, 12, 14, 11, 8, 16, 17, 9, 12, 14],
                    next: "glitchNumber_mid",
                    frequency: 4
                },
                glitchNumber_fast: {
                    frames:[17, 9, 12, 13, 11, 15, 10, 12, 8, 16, 14],
                    next: "glitchNumber_fast",
                    frequency: 8
                }
            }
        }
        scale = scale_temp;
        spriteSheets[STRINGS] = new SpriteSheet(stringsData);

        scale_temp = scale;
        scale = scale * 5;
        var stringsLData = {
            images: [assets[STRINGS_L]],
            frames: [
                [0,0,107*scale,10*scale],
                [0,11*scale,139*scale,5*scale],
                [0,17*scale,53*scale,5*scale],
                [0,23*scale,35*scale,5*scale],
                [0,29*scale,47*scale,5*scale],
                [0,35*scale,77*scale,5*scale],
                [0,41*scale,41*scale,5*scale],
                [0,47*scale,55*scale,5*scale],
                //Numbers
                [0*scale,53*scale,5*scale,5*scale],
                [6*scale,53*scale,5*scale,5*scale],
                [12*scale,53*scale,5*scale,5*scale],
                [18*scale,53*scale,5*scale,5*scale],
                [24*scale,53*scale,5*scale,5*scale],
                [30*scale,53*scale,5*scale,5*scale],
                [36*scale,53*scale,5*scale,5*scale],
                [42*scale,53*scale,5*scale,5*scale],
                [48*scale,53*scale,5*scale,5*scale],
                [54*scale,53*scale,5*scale,5*scale]
            ],
            animations: {
                spaceToPlay:[0],
                paused:[1],
                gameOver:[2],
                points:[3],
                controls:[4],
                bulletTime:[5],
                reset:[6],
                highScore:[7],
                n0:[8],
                n1:[9],
                n2:[10],
                n3:[11],
                n4:[12],
                n5:[13],
                n6:[14],
                n7:[15],
                n8:[16],
                n9:[17],
                glitchNumber: {
                    frames:[13, 11, 8, 16, 17, 9, 12, 15, 10, 12, 14],
                    next: "glitchNumber",
                    frequency: 2
                },
                glitchNumber_mid: {
                    frames:[13, 10, 12, 15, 10, 12, 14, 11, 8, 16, 17, 9, 12, 14],
                    next: "glitchNumber_mid",
                    frequency: 4
                },
                glitchNumber_fast: {
                    frames:[17, 9, 12, 13, 11, 15, 10, 12, 8, 16, 14],
                    next: "glitchNumber_fast",
                    frequency: 8
                }
            }
        }
        scale = scale_temp;

        spriteSheets[STRINGS_L] = new SpriteSheet(stringsLData);



    }

    window.AssetManager = AssetManager;
} (window));