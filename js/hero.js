(function (window) {
	var imagesJumping = false;

    // Constants for controling horizontal movement
    var MoveAcceleration = 13000.0;
    var MaxMoveSpeed = 1000.0;
    var GroundDragFactor = 0.48;
    var AirDragFactor = 0.58;

    // Constants for controlling vertical movement (not all implemented)
    var MaxJumpTime = 0.35;
    var JumpLaunchVelocity = -5000.0;
    var GravityAcceleration = 1800.0;
    var MaxFallSpeed = 550.0;
    var JumpControlPower = 0.14;

    var IsOnGround = true;

    // Let the Hero move a littile faster while on bullet time
    var BulletTimeMoveHelper = 1;

    // for tick()
    var previousPosition, moveBy;

    function Hero(image, position) {
        this.initialize(image, position);
    }

    Hero.prototype = new BitmapAnimation();

    Hero.prototype.Bitmap_initialize = Hero.prototype.initialize;
   
    Hero.prototype.initialize = function (image, position) {
    	var x,y = 0;
    	var rightButtonPressed = false;
    	var leftButtonPressed = false;

        this.Bitmap_initialize(image);
        this.name = 'Hero';
        this.snapToPixel = true;
		this.gotoAndPlay('idle');
        this.x = position.x;
        this.y = position.y;
        this.BulletTimeMoveHelper = 1;

        this.velocity = new Point(0, 0);


        this.isJumping = false;
        this.direction = 0;

    };
    Hero.prototype.reset = function(position) {

    	this.x = position.x;
    	this.y = position.y;

    	this.velocity = new Point(0, 0);
		this.IsAlive = true;

       	this.onGround = false;
		this.doubleJump = false;
    };

	Hero.prototype.tick = function () {

 
		this.ApplyPhysics();
        
        if (this.IsAlive && !this.isJumping) {
            if (Math.abs(this.velocity.x) - 0.5 > 0) {

                // Checking if we're not already playing the animation
                if (this.currentAnimation.indexOf("walk_h") === -1 && this.direction === -1) {
                    this.gotoAndPlay("walk_h");
                }
                if (this.currentAnimation.indexOf("walk") === -1 && this.direction === 1) {
                    this.gotoAndPlay("walk");
                }
            } /*else {
                if (this.currentAnimation.indexOf("idle") === -1 && this.direction === 0) {
                    this.gotoAndPlay("idle");
                }
            }*/
            if(!bulletTime) {
                if((this._animation.name == 'idle' || this._animation.name == 'idle_h') && this._animation.name != 45)
                    this._animation.frequency = 45;
            }
        } else if (this.IsAlive && this.isJumping) {
            if (this.currentAnimation.indexOf("jump_h") === -1 && this.direction === -1) {
                this.gotoAndPlay("jump_h");
            }
            if (this.currentAnimation.indexOf("jump") === -1 && this.direction === 1) {
                this.gotoAndPlay("jump");
            }
        }

        //this.isJumping = false;

	};

	Hero.prototype.ApplyPhysics = function () {
		if (this.IsAlive) {

			previousPosition = new Point(this.x, this.y);

            if(elapsed > 0.1)
                elapsed = 0.1;

            this.velocity.x += this.direction * MoveAcceleration * elapsed * this.BulletTimeMoveHelper * Game.scale;
            this.velocity.y = Math.clamp(this.velocity.y + GravityAcceleration * elapsed, -MaxFallSpeed, MaxFallSpeed);

            // Apply pseudo-drag horizontally.
            if (!this.isJumping) {
                this.velocity.x *= GroundDragFactor;
            }
            else {
                this.velocity.x *= AirDragFactor;
            }

            // Prevent the player from running faster than his top speed.
            this.velocity.x = Math.clamp(this.velocity.x, -MaxMoveSpeed, MaxMoveSpeed);

            // vertical move && collision
            moveBy = {x:0, y:this.velocity.y * elapsed},
			collision = null,
			collideables = Game.getCollideables();

			collision = calculateCollision(this, 'y', collideables, moveBy);

			this.y += moveBy.y;

			if ( !collision ) {
				if ( this.onGround ) {
					this.onGround = false;
					this.doubleJump = true;
				}
			} else {
				// the hero can only be 'onGround'
				// when he's hitting floor and not
				// some ceiling
				if ( moveBy.y >= 0 ) {
					this.onGround = true;
					this.doubleJump = false;
				}
				this.velocity.y = 0;
			}

			// horizontal move && collision
			moveBy = {x:this.velocity.x * elapsed, y:0};
			collision = calculateCollision(this, 'x', collideables, moveBy);
			this.x += moveBy.x;
		}
	}

    Hero.prototype.jump = function() {
    	// if the hero is "on the ground"
    	// let him jump, physically correct!
		if ( this.onGround ) {
			this.velocity.y = JumpLaunchVelocity;
			this.onGround = false;
			this.doubleJump = true;
		// we want the hero to be able to
		// jump once more when he is in the
		// air - after that, he has to wait
		// to lang somewhere on the ground
		} else if ( this.doubleJump ) {
			this.velocity.y = JumpLaunchVelocity;
			this.doubleJump = false;
		}
	};

    Hero.prototype.onTouch = function (otherBody, point, impulse) {
        if(!otherBody.GetUserData()) return false;

        var physOwner = otherBody.GetUserData().ent;
        
        if(physOwner !== null && this.IsAlive) {
            //if(physOwner._killed) return false;
            sfxHurt.pause();
            sfxHurt.currentTime = 0;
            sfxHurt.play();
            globalMusic.pause();
            globalMusic_slow.pause();
            
            this.IsAlive = false;

        }

        return true;
    }

    Hero.prototype.left = function() {
    		//this.direction.left = -1;
    		this.direction = -1;
    		leftButtonPressed = true;
	};

	Hero.prototype.right = function() {
    		//this.direction.right = 1;
    		this.direction = 1;
    		rightButtonPressed = true;
	};

    window.Hero = Hero;
} (window));