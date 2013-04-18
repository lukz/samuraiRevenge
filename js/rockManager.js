/**
 ** GREAT article http://www.luxanimals.com/blog/article/combining_easel_box2d
 **/

(function (window) {
    var b2Vec2 = Box2D.Common.Math.b2Vec2;
    var b2BodyDef = Box2D.Dynamics.b2BodyDef;
    var b2Body = Box2D.Dynamics.b2Body;
    var b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    var b2Fixture = Box2D.Dynamics.b2Fixture;
    var b2World = Box2D.Dynamics.b2World;
    var b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    var b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    var b2DebugDraw = Box2D.Dynamics.b2DebugDraw;


    var theGame,
        rockDelayCounter = 0,
        rock,
        b2vec2O,
        bodiesToRecycle = [],
        lastSpawnedX = 0;

    SlowDownRate = 1;

    RockManager.prototype.getRocks = function() { return rocks; };

    function RockManager(game) {
        this.initialize(game);
    }

    RockManager.prototype.initialize = function (game) {

        b2vec2O = new b2Vec2(0,0);

        theGame = game;
        this.box2d.setup();
        this.box2d.addContactListener({

            PostSolve: function (bodyA, bodyB, impulse) {
                var uA = bodyA ? bodyA.GetUserData() : null;
                var uB = bodyB ? bodyB.GetUserData() : null;
                //if(!uA.skin || !uB.skin)
                //console.log(uA, uB);

                if (uA !== null) {
                    if (uA.onTouch) {
                        uA.onTouch(bodyB, null, impulse);
                    }
                }

                if (uB !== null) {
                    if (uB.onTouch) {
                        uB.onTouch(bodyA, null, impulse);
                    }
                }
            },

            EndContact: function (bodyA, bodyB) {
                var uA = bodyA ? bodyA.GetUserData() : null;
                var uB = bodyB ? bodyB.GetUserData() : null;
                //if(!uA.skin || !uB.skin)

                if (uA !== null && uB !== null && uA.onTouch) {
                    if(uA.name == 'heroComboBox' && uB.skin.comboMaker == false) {
                        Game.combo(uA,uB);
                        uB.skin.comboMaker = true;
                    }
                }
                if (uB !== null && uA !== null && uB.onTouch) {
                    if(uB.name == 'heroComboBox' && uA.skin.comboMaker == false) {
                        Game.combo(uB,uA);
                        uA.skin.comboMaker = true;
                    }
                }

            }


        });
    };
    RockManager.prototype.reset = function(sworld) {
        bodiesToRecycle = [];
        this.box2d.removeAllBodies();
    };

	RockManager.prototype.tick = function (sworld,e) {

        this.box2d.update();

        rockDelayCounter += e / 1000;
        if(!Game.onShowLevelScreen && (rockDelayCounter / (Game.levelDifficulty[Game.level]*SlowDownRate) > 1)) {  
            rockDelayCounter = 0;


            if(bodiesToRecycle.length == 0) {
                // No objects in pool
                rock = this.spawnRock();
                sworld.addChild(rock);
                this.box2d.createRock(rock);
            } else {
                // Recycle object
                bodiesToRecycle[0].GetUserData().skin.comboMaker = false;
                bodiesToRecycle[0].SetActive(true);

                b2vec2O.x = (Math.random()*960+20)/30;
                if(Math.abs(lastSpawnedX - b2vec2O.x) < 3) {
                    b2vec2O.x = (Math.random()*960+20)/30;}
                lastSpawnedX = b2vec2O.x;

                b2vec2O.y =  ((40 + Math.random()*80 | 0) - 100)/30;
                bodiesToRecycle[0].SetPosition(b2vec2O);

                b2vec2O.x = (8 - Math.random()*16 | 0);
                b2vec2O.y = (Math.random()*10 | 0);
                bodiesToRecycle[0].SetLinearVelocity(b2vec2O);

                bodiesToRecycle[0].SetActive(true);
                this.box2d.pushBody(bodiesToRecycle[0]);
                bodiesToRecycle.splice(0,1);
            }

        }

	};

    RockManager.prototype.spawnRock = function() {
        var ROCK_SIZE;

        switch(Math.random()*3 | 0) {
            case 0:
            ROCK_SIZE = ROCK_S;
            break;
            case 1:
            ROCK_SIZE = ROCK_M;
            break;
            case 2:
            ROCK_SIZE = ROCK_L;
            break;
        }  

        rockS = new BitmapAnimation(spriteSheets[ROCK_SIZE]);

        rockS.name = 'rockS';

        // One combo for one rock!
        rockS.comboMaker = false;

        rockS.x = Math.random()*960+20;

        if(Math.abs(lastSpawnedX - rockS.x) < 3*30)
            rockS.x = Math.random()*960+20;

        lastSpawnedX = rockS.x;

        rockS.y = (40 + Math.random()*80 | 0) - 100;
        rockS.snapToPixel = true;
        rockS.gotoAndPlay('fall');

        return rockS;
    }

    RockManager.prototype.box2d = (function() {

        var SCALE = 30;
        STEP = 30;
        TIMESTEP = 1/STEP;
        var physHero;
        var physHeroComboBox;
        var world;
        var lastTimestamp = Date.now();
        var fixedTimestepAccumulator = 0;
        var bodiesToRemove = [];
        var actors = [];
        var bodies = [];
        var reset = false;

        var canvas, debugCanvas, context, debugContext, stage;

        // for update()
        var now, dt, i; 

        // box2d world setup
        var setup = function() {

            //canvas = Game.canvas;
            //var left = document.getElementById('left');
            //debugCanvas = document.createElement('canvas');
            //debugCanvas.width = Game.width;
            //debugCanvas.height = Game.height;
            //debugCanvas.id = "debugCanvas";
            //left.appendChild(debugCanvas);

            //context = canvas.getContext('2d');
            //debugContext = debugCanvas.getContext('2d');

            world = new b2World(new b2Vec2(0,15), true);
            //addDebug();

            // I need a Hero! .. He's gotta be strong. And he's gotta be fast.
            physHero = addHero(Game.getHero());
            physHeroComboBox = addHeroComboBox(Game.getHero());
            
            // boundaries - floor
            /*var floorFixture = new b2FixtureDef;
            floorFixture.density = 0.5;
            floorFixture.friction = 10;
            floorFixture.restitution = 0.1;
            floorFixture.shape = new b2PolygonShape;
            floorFixture.shape.SetAsBox(1020 / SCALE/2, 10 / SCALE);

            var floorBodyDef = new b2BodyDef;
            floorBodyDef.type = b2Body.b2_staticBody;
            floorBodyDef.position.x = 1020 / SCALE/2 -10 ;
            floorBodyDef.position.y = 509 / SCALE;

            var floor = world.CreateBody(floorBodyDef);
            floor.CreateFixture(floorFixture);*/
        }

        // box2d debugger
        var addDebug = function() {
            var debugDraw = new b2DebugDraw();
            debugDraw.SetSprite(debugContext);
            debugDraw.SetDrawScale(SCALE);
            debugDraw.SetFillAlpha(0.7);
            debugDraw.SetLineThickness(1.0);
            debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
            world.SetDebugDraw(debugDraw);
        }

        // actor object - this is responsible for taking the body's position and translating it to your easel display object
        var actorObject = function(body, skin) {
            this.body = body;
            this.skin = skin;
            this.update = function() {  
                // translate box2d positions to pixels
                this.skin.rotation = this.body.GetAngle() * (180 / Math.PI);
                this.skin.x = this.body.GetWorldCenter().x * SCALE;
                this.skin.y = this.body.GetWorldCenter().y * SCALE;
            }
            actors.push(this);
        }

        // create rock body shape and assign actor object
        var createRock = function(skin) {
            var rockFixture = new b2FixtureDef;
            rockFixture.density = 0.5;
            rockFixture.friction = 5;
            rockFixture.restitution = 0.5;
            rockFixture.shape = new b2CircleShape((skin.spriteSheet._regX | 0) / SCALE);
            var rockBodyDef = new b2BodyDef;
            rockBodyDef.type = b2Body.b2_dynamicBody;
            rockBodyDef.position.x = skin.x / SCALE;
            rockBodyDef.position.y = skin.y / SCALE;

            b2vec2O.x = (8 - Math.random()*16 | 0);
            b2vec2O.y = (Math.random()*10 | 0);

            rockBodyDef.linearVelocity = b2vec2O;

            var rock = world.CreateBody(rockBodyDef);
            rock.CreateFixture(rockFixture);

            // assign actor
            var actor = new actorObject(rock, skin);
            // set the actor as user data of the body so we can use it later: body.GetUserData()
            rock.SetUserData(actor);  
            bodies.push(rock);
        }

        var addHero = function(skin) {
            var heroFixture = new b2FixtureDef;
            heroFixture.density = 1;
            heroFixture.friction = 1;
            heroFixture.restitution = 1;
            heroFixture.shape = new b2PolygonShape;

            heroFixture.shape.SetAsBox(skin.spriteSheet._frameWidth / SCALE / 2 *0.8, skin.spriteSheet._frameHeight / SCALE / 2 * 0.9);

            var heroBodyDef = new b2BodyDef;
            heroBodyDef.type = b2Body.b2_dynamicBody;
            heroBodyDef.position.x = skin.x / SCALE;
            heroBodyDef.position.y = skin.y / SCALE;
            heroBodyDef.fixedRotation =true;

            var heroIsHere = world.CreateBody(heroBodyDef);
            heroIsHere.CreateFixture(heroFixture);
            heroIsHere.SetUserData(skin);

            return heroIsHere;
        }

        var addHeroComboBox = function(skin) {
            var heroComboBoxFixture = new b2FixtureDef;
            heroComboBoxFixture.density = 0.5;
            heroComboBoxFixture.friction = 10;
            heroComboBoxFixture.restitution = 0.1;
            heroComboBoxFixture.isSensor = true;
            heroComboBoxFixture.shape = new b2PolygonShape;

            //heroComboBoxFixture.shape.SetAsBox(skin.spriteSheet._frameWidth / SCALE / 2 * 3, skin.spriteSheet._frameHeight / SCALE / 2 / 8);
            heroComboBoxFixture.shape.SetAsBox(skin.spriteSheet._frameWidth / SCALE / 2 * 2.5, skin.spriteSheet._frameHeight / SCALE);

            var heroComboBoxBodyDef = new b2BodyDef;
            heroComboBoxBodyDef.type = b2Body.b2_staticBody;
            heroComboBoxBodyDef.position.x = skin.x / SCALE - skin.spriteSheet._frameWidth / SCALE / 2;
            heroComboBoxBodyDef.position.y = skin.y / SCALE;

            var heroComboBoxIsHere = world.CreateBody(heroComboBoxBodyDef);
            heroComboBoxIsHere.CreateFixture(heroComboBoxFixture);

            function heroComboBoxUserData() {
                this.name = 'heroComboBox';
            };
            heroComboBoxUserData.prototype.onTouch = function (otherBody, point, impulse) {
                return true;
            } 

            heroComboBoxIsHere.SetUserData(new heroComboBoxUserData());
            return heroComboBoxIsHere;
        }

        // remove actor and it's skin object
        var removeActor = function(actor) {
            Game.stage.children[1].removeChild(actor.skin);
            actors.splice(actors.indexOf(actor),1);
        }

        var removeAllBodies = function() {
            reset = true;
        }

        // box2d update function. delta time is used to avoid differences in simulation if frame rate drops
        var update = function() {

            now = Date.now();
            dt = now - lastTimestamp;
            fixedTimestepAccumulator += dt;
            lastTimestamp = now;
            while(fixedTimestepAccumulator >= STEP) {
                // remove bodies before world timestep
                if(bodiesToRemove.length != 0) {
                    for(i=0, l=bodiesToRemove.length; i<l; i++) {
                        removeActor(bodiesToRemove[i].GetUserData());
                        bodiesToRemove[i].SetUserData(null);
                        world.DestroyBody(bodiesToRemove[i]);
                    }
                    bodiesToRemove = [];
                }

                // Update hero position (movement should be calculated here)
                b2vec2O.x = 0; b2vec2O.y = 0;
                physHero.SetLinearVelocity(b2vec2O);

                b2vec2O.x = Game.getHero().x / SCALE;
                b2vec2O.y = Game.getHero().y / SCALE;
                physHero.SetPositionAndAngle(b2vec2O, 0);


                b2vec2O.x = Game.getHero().x / SCALE;
                b2vec2O.y = (Game.getHero().y / SCALE );
                physHeroComboBox.SetPosition(b2vec2O);

                // update active actors
                for(i=0, l=actors.length; i<l; i++) {
                    actors[i].update();
                }

                // DEBUG
                //world.m_debugDraw.m_sprite.graphics.clear();
                //world.DrawDebugData();
                // DEBUG

                world.Step(TIMESTEP, 10, 10);
                fixedTimestepAccumulator -= STEP;
                world.ClearForces();



                if(reset == true) {
                    for(i=0, l=bodies.length; i<l; i++) {
                        bodiesToRemove.push(bodies[i]);
                        //bodies.splice(0,1);
                    }
                    bodies = [];
                    reset = false;
                }

                // Remove rocks falled from screen
                for(i=0, l=bodies.length; i<l; i++) {
                    if(bodies[i].GetUserData().skin.y > Game.height) {
                        bodies[i].SetActive(false);
                        bodiesToRecycle.push(bodies[i]);
                        bodies.splice(i,1);
                        i--;
                        l--;
                    }
                }

            }
        }

        /*var pauseResume = function(p) {
            if(p) { 
                TIMESTEP = 0;
            } else { 
                TIMESTEP = 1/STEP; 
            }
            lastTimestamp = Date.now();
        }*/

        var devideStep = function(stepDevider) {
            SlowDownRate = stepDevider;
            TIMESTEP = 1/STEP/stepDevider;
        }

        var pushBody = function(body) {
            bodies.push(body);
        }

        var addContactListener = function(callbacks) {
            var listener = new Box2D.Dynamics.b2ContactListener();


            if(callbacks.EndContact) listener.EndContact = function (contact) {
                callbacks.EndContact(contact.GetFixtureA().GetBody(),
                                    contact.GetFixtureB().GetBody());
            };

            if(callbacks.PostSolve) listener.PostSolve = function (contact, impulse) {
                callbacks.PostSolve(contact.GetFixtureA().GetBody(),
                                    contact.GetFixtureB().GetBody(),
                                    impulse.normalImpulses[0]);
            };

            world.SetContactListener(listener);
        }

        return {
            setup: setup,
            update: update,
            createRock: createRock,
            addContactListener: addContactListener,
            removeAllBodies: removeAllBodies,
            //pauseResume: pauseResume,
            devideStep: devideStep,
            pushBody: pushBody
        }
    })();

    window.RockManager = RockManager;
} (window));