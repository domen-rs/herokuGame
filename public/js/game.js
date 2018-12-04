var config = {
    type: Phaser.AUTO,
    parent: 'phaser-example',
    width: 800,
    height: 600,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
        gravity: { y: 0 }
      }
    },
    scene: {
      preload: preload,
      create: create,
      update: update
    } 
  };
   
  var game = new Phaser.Game(config);
   
  function preload() {
      this.load.atlas("megaset","assets/megaset-0.png","assets/megaset-0.json");

  }
   
  function create() {
    this.socket = io();
    var self=this;
    this.otherPlayers=this.add.group();
    this.socket.on("currentPlayers",function(players){
      Object.keys(players).forEach(function(id){
        if(players[id].playerId==self.socket.id){
          
          addPlayer(self,players[id]);
        }
        else{
          addOtherPlayers(self,players[id]);
        }
      })
      
    })
    this.socket.on("newPlayer",function(playerInfo){
      addOtherPlayers(self,playerInfo);
    })
    this.socket.on("playerMoved",function(playerInfo){
      console.log("game move")
      self.otherPlayers.getChildren().forEach(function(otherPlayer){
        if(playerInfo.playerId===otherPlayer.playerId){
          otherPlayer.x=playerInfo.x;
          otherPlayer.y=playerInfo.y;
        }
      })
    })
    this.socket.on("disconnect",function(playerId){
      self.otherPlayers.getChildren().forEach(function(otherPlayer){
        if(playerId===otherPlayer.playerId){
          otherPlayer.destroy();
        }
      })
    })
    this.cursors=this.input.keyboard.createCursorKeys();
  }
  function addPlayer(self,playerInfo)
  {
    self.ship=self.add.image(playerInfo.x,playerInfo.y,"megaset","aqua_ball");
    self.ship.oldPosition={
      x:playerInfo.x,
      y:playerInfo.y
    }
  }
  function addOtherPlayers(self,playerInfo){
    const otherPlayer=self.add.image(playerInfo.x,playerInfo.y,"megaset","aqua_ball");
    otherPlayer.playerId=playerInfo.playerId;
    self.otherPlayers.add(otherPlayer);
  }
   
  function update() {
    //
    if(this.ship){
      //console.log("up")
      if(this.cursors.up.isDown){
        this.ship.y-=5;
        
      }
      if(this.cursors.down.isDown){
        this.ship.y+=5;
      }
      if(this.cursors.left.isDown){
        this.ship.x-=5;
        
      }
      if(this.cursors.right.isDown){
        this.ship.x+=5;
      }
      if(this.ship.oldPosition){
        if(this.ship.oldPosition.x!=this.ship.x||this.ship.oldPosition.y!=this.ship.y)
        {
            this.socket.emit("playerMovement",{x:this.ship.x,y:this.ship.y});
            
        }
      }
      this.ship.oldPosition={
        x:this.ship.x,
        y:this.ship.y
      }
      
    }
  }