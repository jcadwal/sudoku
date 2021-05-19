const frameRate = 20

var board = Array(9)
              .fill(null)
              .map((row)=>
                Array(9)
                  .fill(null)
                  .map(e=>-1))

var puzzle = Array(9)
              .fill(null)
              .map((row)=>
                Array(9)
                  .fill(null)
                  .map(e=>-1))

var [x,y] = [0,0]   
var done = false
var backtracking = false               


function printBoard(msg){
  console.log(msg)
  for (let row = 0; row < 9; row++) {
    console.log(board[row])
    // for (let col = 0; col < 9; col++) {
    //   board[row][col] = puzzle1[row][col]      
    // }
  }
}




function nextCell(dir){
  if(dir){
    if(x<8){
      x+=1
    }
    else if(y<8){      
      x=0
      y+=1
    }
    else{
      x=null
    }
  }
  else{
    if(x>0){
      x-=1
    }
    else if(y>0){
      x=8
      y-=1      
    }
    else{
      x=null
    }
  }
}




function availablesFrom(x,y,f){
  var collide = Array(9).fill(false)

  //row, col, square(?)
  for (let i = 0; i < 9; i++) {
    if(board[i][y] != -1)
      collide[board[i][y]]=true
    if(board[x][i] != -1)
      collide[board[x][i]]=true      
    if(board[3*Math.floor(x/3)+Math.floor(i/3)][3*Math.floor(y/3)+i%3] != -1)
      collide[board[3*Math.floor(x/3)+Math.floor(i/3)][3*Math.floor(y/3)+i%3]]=true
  }

  //
  var avail = []
  for (let i = 0; i < 9; i++) {
    if(i>f && !collide[i]) avail.push(i)
  }

  return avail
  // return shuffle(avail)
}      


function step(){
  if(done) return

  if(backtracking){
    //1. go back one cell        
    while(x!=null && puzzle[x][y]!=-1){          
      nextCell(false)
    }
    //2. compute avails choose next after current assignment
    let avails = availablesFrom(x,y,board[x][y])
    //3. if such exists 
    if(avails.length>0){
      //1. make assignment, backtracking is false
      board[x][y] = avails[0]
      // printBoard("backtracking, found assigment")
      postMessage([x,y,board[x][y]])
      nextCell(true)
      done = x==null
      backtracking = false
    }
    else{
      //2. ELSE unassign current cell, backtrack still true
      board[x][y]=-1
      // printBoard("backtracking, no assignment")
      postMessage([x,y,board[x][y]])
      backtracking=true
      nextCell(false)
    }
  }
  else{  //forward search 
    while(puzzle[x][y]!=-1){
      nextCell(true)
      done = x==null
    }    
    //2. compute availables
    const avails = availablesFrom(x,y,-1)     
    //3. if availables is empty
    if(avails.length==0){
      backtracking=true
    }
    else{
      //2. ELSE assign first available
      board[x][y]=avails[0]
      // printBoard("forward assignment")
      postMessage([x,y,board[x][y]])  
      nextCell(true)                          
      done = x==null
    }
    
  }
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


var id = setInterval(step,frameRate)


this.onmessage = function(e){
  console.log(e.data)

  if(e.data['reset']){
    clearInterval(id)
    board = Array(9)
            .fill(null)
            .map((row)=>
              Array(9)
                .fill(null)
                .map(e=>-1))
    x = 0
    y = 0   
    done = false
    backtracking = false
    console.log(board.toString())
    id = setInterval(step,frameRate)
  }
  else{
    if(e.data['pause'])
      clearInterval(id)
    else
      id = setInterval(step,frameRate)
  }

  if(e.data['puzzle']){
    x = 0
    y = 0   
    done = false
    backtracking = false
    let puzzle1 = e.data['puzzle']
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        board[row][col] = puzzle1[row][col]
        puzzle[row][col] = puzzle1[row][col]
      }
    }
    // printBoard("after init")
    // console.log(puzzle.toString())

  }  
}