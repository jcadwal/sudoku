

//////////////SOLVER
var board = Array(9)
                .fill(0)
                .map(function() {
                    return Array(9)
                            .fill(0)
                            .map(function() {                            
                                    return {assign:"-",
                                            idx:0,
                                            occupied:Array(9).fill([false,false,false])}
                            })
                });





var [x,y] = [0,0];

function checkSolved(board){
    console.log(board)
    //All cells were assigned
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            // console.log(board[i][j])
            if(board[i][j].assign=="-"){
                return false
            }
            
        }        

    }
    return true
}

function checkGood(board){
    //All unassigned cells have available possible assignments
    board.forEach(
        function(row){
            row.forEach(
                function(cell){                    
                    if(cell.assign=="-"){
                        if(!cell.occupied.some((e)=>!(e[0] || e[1] || e[2]))){
                            return false
                        }
                    }
                }
            )
        }
    )
    return true

}


function nextCell(x,y,dir){
    if(dir){
        if(x<9){
            return [x+1,y]
        }
        if(y<9){
            return [0, y+1]
        }
        else{
            return null
        }
    }
    else{
        if(x>0){
            return [x-1,y]
        }
        if(y>0){
            return [8, y-1]
        }
        else{
            return null
        }
    }
}


function nextAvailableAssignment(x,y){
    // console.log(x,y,board[x][y].idx)
    // console.log(board[x][y].occupied[board[x][y].idx])
    while(!board[x][y].occupied[board[x][y].idx].some(e=>e)){
        board[x][y].idx += 1
        if(board[x][y].idx>8){
            board[x][y].idx=0
            return null
        }
    }

    return board[x][y].idx
    

}


function makeAssignment(x,y,assignment){ //include neighbors
    if(assignment === null) return

    board[x][y].assign=assignment
    board[x][y].occupied[assignment]=[false,false,false]

    //same row
    board[x].forEach(
        function(el){
            el.occupied[assignment][0]=false
        }
    )

    //same col
    for (let row = 0; row < 9; row++) {
        board[row][y].occupied[assignment][1]=false        
    }

    //same square
    let [sx, sy] = [x%3, y%3]
    for (let row = sx*3; row < sx*3 + 3; row++){
        for (let col = sy*3; col < sy*3 + 3; col++){
            board[row][col].occupied[assignment][2]=false 
        } 
    }

}


function makeUnAssignment(x,y,assignment){
    board[x][y].assign="-"
    board[x][y].occupied[assignment]=[true,true,true]

    //same row
    board[x].forEach(
        function(el){
            el.occupied[assignment][0]=true 
        }
    )

    //same col
    for (let row = 0; row < 9; row++) {
        board[row][y].occupied[assignment][1]=true
    }

    //same square
    let [sx, sy] = [x%3, y%3]
    for (let row = sx*3; row < sx*3 + 3; row++){
        for (let col = sy*3; col < sy*3 + 3; col++){
            board[row][col].occupied[assignment][2]=true
        } 
    }

}

var solved = false
var backtracking = false
function step(){
    // console.log("in solver while loop",solved)
    
    if(!backtracking){
        console.log("forward begin")
        //NOT BACKTRACKING
        //1. Look for next unassigned cell
        //2. Assign next available to that cell
        //3. Notify all neighbors of assignment
        //4. If a unassigned neighbor has no available, backtrack
        let nextCellValue = [x,y]
        while(nextCellValue!='null' && board[x][y].assign!="-"){
            nextCellValue = nextCell(x,y,true)
            if(nextCellValue==null){
                backtracking=true
                return false
            }
        }
        
        let next = nextAvailableAssignment(x,y)
        if(next===null){
            backtracking=true;
        }
        else{
            makeAssignment(x,y,next)
            postMessage([x,y,next])

        }
        

        if(!checkGood(board)){
            backtracking=true
        }
        else{
            solved = checkSolved(board)
        }    
        console.log("forward end",solved)    
    }
    else{ //are backtracking
        //exhaust possible assignment for current cell
        // console.log("backtracking")
        var good = false
        while(!good && board[x][y].idx < 9 && board[x][y].idx != null){
            makeUnAssignment(x,y,board[x][y].idx)
            board[x][y].idx = nextAvailableAssignment(x,y)
            makeAssignment(x,y,board[x][y].idx)
            good = checkGood(board)
        }
        if(good){
            backtracking=false
        }
        else{ //no more assignments for current cell
            board[x][y] = { assign:"-",
                            idx:0,
                            occupied:Array(9).fill([true,true,true])}
            [x,y] = nextCell(x,y,false)
        }

    }
}


function stepper(){
    if(!solved){
        step()
        setTimeout(stepper,1000)
    }
}
                

stepper()

