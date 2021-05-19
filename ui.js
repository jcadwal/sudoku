var puzzle
var boardEl
var board
var mode = "edit"

var controlPanel = document.getElementById("control-panel")
var controlEditPanel = document.getElementById("edit-mode")
var controlSolvePanel = document.getElementById("solve-mode")
var btnSolve = document.getElementById("btn-solve")
var btnEdit = document.getElementById("btn-edit")
var btnClear = document.getElementById("btn-clear")
var btnSave = document.getElementById("btn-save")
var btnLoad = document.getElementById("btn-load")
var availables = document.getElementById("availables")
var availablesSpan = document.getElementById("availables-span")
var modal = document.getElementById("modal")
var modalSaveButton = document.getElementById("modal-save-button")
var modalLoadButton = document.getElementById("modal-load-button")
var modalTitleBox = document.getElementById("modal-title-box")
var modalDropdown = document.getElementById("modal-dropdown")
var solverWorker = new Worker('backtracker2.js')
controlSolvePanel.remove()
availables.style.visibility = "hidden"



modalLoadButton.addEventListener('click',
    function(){
        const title = modalDropdown.value
        puzzle = JSON.parse(localStorage.getItem(title))


        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                
                if(puzzle[r][c]!=-1){
                    boardEl[r][c].children[0].innerText = puzzle[r][c]
                    boardEl[r][c].style.background="rgb(155, 160, 197)"
                }
                else{
                    boardEl[r][c].children[0].innerText = ""
                    boardEl[r][c].style.background="rgb(205, 210, 247)"
                }
                
                var availss = availablesFrom(r,c,-1)
                if(r==0 && c==8){
                    console.log(availss)
                }
                var availDiv = boardEl[r][c].querySelector(".available")
                
                availDiv.innerHTML=[0, 1, 2, 3, 4, 5, 6, 7, 8].reduce(
                    (acc,e) => availss.includes(e) ? acc+e.toString()+" " : acc+"<span style=\"background-color:red\">"+e.toString()+" </span>",
                    "")
                
            }                    
        }     

        modal.style.display = "none";
    })





modalSaveButton.addEventListener('click',
    function(){
        const title = modalTitleBox.value
        console.log("title: ",title)
        localStorage.setItem(title,JSON.stringify(puzzle))
        modal.style.display = "none";
    })





window.addEventListener('click',
    function(e){
        if (e.target == modal) {
            modal.style.display = "none";
        }
    })




btnSave.addEventListener('click',
    function(){
        modal.style.display = "block";        
    })


btnLoad.addEventListener('click',
    function(){
        modalDropdown.innerHTML=""
        //Populate puzzle load list for modal
        for (let index = 0; index < localStorage.length; index++) {
            var title = localStorage.key(index)
            var option = document.createElement("option")    
            option.setAttribute("value",title)
            option.textContent=title
            modalDropdown.appendChild(option)

        }
        modal.style.display = "block";         
    })    




btnSolve.addEventListener('click',
    function(){        
        controlEditPanel.remove()
        controlPanel.appendChild(controlSolvePanel) 
        enterSolveMode();       
    })

btnEdit.addEventListener('click',
    function(){
        controlSolvePanel.remove()
        controlPanel.appendChild(controlEditPanel)   
        enterEditMode()     
    })

btnClear.addEventListener('click',
    function(){
        puzzle = Array(9)
              .fill(null)
              .map((row)=>
                Array(9)
                  .fill(null)
                  .map(e=>-1))

        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                boardEl[row][col].style.background = ""
                boardEl[row][col].children[0].innerText=puzzle[row][col]==-1 ? " " : puzzle[row][col];
            }            
        }

        selectedCell=null
        availables.style.visibility = "hidden"

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if(puzzle[r][c]==-1){
                    let availss = availablesFrom(r,c,-1)
                    var availDiv = boardEl[r][c].querySelector(".available")
                    
                    availDiv.innerHTML=[0, 1, 2, 3, 4, 5, 6, 7, 8].reduce(
                        (acc,e) => availss.includes(e) ? acc+e.toString()+" " : acc+"<span style=\"color:red\">"+e.toString()+" </span>",
                        "")
                }
                else{
                    var availDiv = boardEl[r][c].querySelector(".available")                            
                    availDiv.innerText=""
                }                                                
            }                    
        }         


    })    


function enterEditMode(){
    mode="edit"
    selectedCell=null
    solverWorker.postMessage({  'pause':true,
                                'reset':false})


    console.log(boardEl[0][0].children)
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            boardEl[row][col].children[0].textContent = puzzle[row][col]==-1 ? " " : puzzle[row][col];
        }            
    }
    console.log(boardEl[0][0].children)
    availables.style.visibility = "hidden"


    board = Array(9)
        .fill(null)
        .map((row)=>
        Array(9)
            .fill(null)
            .map(e=>-1))

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if(board[r][c]==-1 || puzzle[r][c]==-1){
                let availss = availablesFrom(r,c,-1)
                var availDiv = boardEl[r][c].querySelector(".available")
                
                availDiv.innerHTML=[0, 1, 2, 3, 4, 5, 6, 7, 8].reduce(
                    (acc,e) => availss.includes(e) ? acc+e.toString()+" " : acc+"<span style=\"background-color:red\">"+e.toString()+" </span>",
                    "")
            }
            else{
                var availDiv = boardEl[r][c].querySelector(".available")                            
                availDiv.innerText=""
            }                                                
        }                    
    }     
}

function enterSolveMode(){
    mode="solve"
    if(selectedCell!=null){
        var [r,c] = [   parseInt(selectedCell.getAttribute("x")), 
                        parseInt(selectedCell.getAttribute("y"))]
        if(puzzle[r][c]==-1)
            selectedCell.style.background = ""    
    }
    solverWorker.postMessage({'pause':false,
                              'reset':false,
                              'puzzle':puzzle})                                    
}





var selectedCell


document.addEventListener('keydown', keydownHandler)


function keydownHandler(e){
    console.log(e)
    if(e.key=="Enter"){
        if(mode=="edit"){
            controlEditPanel.remove()
            controlPanel.appendChild(controlSolvePanel) 
            enterSolveMode(); 
        }
        else{
            controlSolvePanel.remove()
            controlPanel.appendChild(controlEditPanel)   
            enterEditMode() 
        }
    }
    if(selectedCell!=null){                
        var [r,c] = [   parseInt(selectedCell.getAttribute("x")), 
                        parseInt(selectedCell.getAttribute("y"))]        
        
        if(e.key=="ArrowUp" && r>0){
            if(puzzle[r][c]==-1)
                selectedCell.style.background = ""
            selectedCell = boardEl[--r][c]
            selectedCell.style.background = "rgb(155, 160, 197)"
        }
        else if(e.key=="ArrowDown" && r<8){
            if(puzzle[r][c]==-1)
                selectedCell.style.background = ""
            selectedCell = boardEl[++r][c]
            selectedCell.style.background = "rgb(155, 160, 197)"
        }
        else if(e.key=="ArrowLeft" && c>0){
            if(puzzle[r][c]==-1)
                selectedCell.style.background = ""
            selectedCell = boardEl[r][--c]
            selectedCell.style.background = "rgb(155, 160, 197)"
        }
        else if(e.key=="ArrowRight" && c<8){
            if(puzzle[r][c]==-1)
                selectedCell.style.background = ""
            selectedCell = boardEl[r][++c]
            selectedCell.style.background = "rgb(155, 160, 197)"
        }
        else{ //clicked backspace or a number
            if(e.key=="Backspace" || e.key=="Delete"){
                console.log("backspace",r,c)
                puzzle[r][c] = -1
                selectedCell.children[0].innerText=""
            }       

            //assign if available
            const availableAssignments = availablesFrom(r,c,-1)
            if(availableAssignments.includes(parseInt(e.key))){
                puzzle[r][c] = parseInt(e.key)
                selectedCell.children[0].innerText=e.key
            }


            for (let r = 0; r < 9; r++) {
                for (let c = 0; c < 9; c++) {
                    
                    var availss = availablesFrom(r,c,-1)
                    if(r==0 && c==8){
                        console.log(availss)
                    }
                    var availDiv = boardEl[r][c].querySelector(".available")
                    
                    availDiv.innerHTML=[0, 1, 2, 3, 4, 5, 6, 7, 8].reduce(
                        (acc,e) => availss.includes(e) ? acc+e.toString()+" " : acc+"<span style=\"background-color:red\">"+e.toString()+" </span>",
                        "")
                    
                }                    
            }                
                        
        }
        const availablesAssignments = availablesFrom(r,c,-1)
        availablesSpan.innerText = availablesAssignments.toString()
        availables.style.visibility = "visible"
    }
}


function availablesFrom(xx,yy,f){
    var collide = Array(9).fill(false)
    
    

    //row, col, square(?)
    for (let idx = 0; idx < 9; idx++) {

        if(puzzle[idx][yy] != -1){
            collide[puzzle[idx][yy]]=true
        }
        if(puzzle[xx][idx] != -1){
            collide[puzzle[xx][idx]]=true      
        }
        if( puzzle[3*Math.floor(xx/3)+Math.floor(idx/3)][3*Math.floor(yy/3)+idx%3] != -1){
            collide[puzzle[3*Math.floor(xx/3)+Math.floor(idx/3)][3*Math.floor(yy/3)+idx%3]]=true
        }

        if(board[idx][yy] != -1){
            collide[board[idx][yy]]=true
        }
        if(board[xx][idx] != -1){
            collide[board[xx][idx]]=true      
        }
        if(board[3*Math.floor(xx/3)+Math.floor(idx/3)][3*Math.floor(yy/3)+idx%3] != -1){
            collide[board[3*Math.floor(xx/3)+Math.floor(idx/3)][3*Math.floor(yy/3)+idx%3]]=true
        }
    }
    
    //
    var avail = []
    for (let i = 0; i < 9; i++) {
        if(i>f && !collide[i]) avail.push(i)
    }
    
    return avail
    // return shuffle(avail)
}


function onClickCell(e){
    console.log(e)
    if(selectedCell!=null){
        var [r,c] = [   parseInt(selectedCell.getAttribute("x")), 
                        parseInt(selectedCell.getAttribute("y"))]
        if(puzzle[r][c]==-1)
            selectedCell.style.background = ""    
    }
    selectedCell = e.target
    selectedCell.style.background = "rgb(155, 160, 197)"
    var [r,c] = [   parseInt(selectedCell.getAttribute("x")), 
                    parseInt(selectedCell.getAttribute("y"))]

    console.log("selected: ",r,c)

    const availablesAssignments = availablesFrom(r,c,-1)
    availablesSpan.innerText = availablesAssignments.toString()
    availables.style.visibility = "visible"

    

}



function initBoard(){
    boardEl = Array
                .from(document.getElementById("board").children)
                .map((r)=>Array.from(r.children))

    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            
            boardEl[row][col].setAttribute("x",row)
            boardEl[row][col].setAttribute("y",col)
            boardEl[row][col].addEventListener('click', onClickCell)

            boardEl[row][col].innerHTML = 
                "<div class=\"main\"></div> \
                 <div class=\"available\">0 1 2 3 4 5 6 7 8</div>"
                
            

                        
            // var numberDiv = document.createElement("div")            
            // var availDiv = document.createElement("div")            
            // availDiv.className = "availDisplay"
            // numberDiv.className = "numberDisplay"
            // boardEl[row][col].appendChild(availDiv)
            // boardEl[row][col].appendChild(numberDiv)
            

            if(col==2)
                boardEl[row][col].style.borderRight = "3px solid black"                    
            if(col==3)
                boardEl[row][col].style.borderLeft = "3px solid black"
            if(col==5)
                boardEl[row][col].style.borderRight = "3px solid black"                    
            if(col==6)
                boardEl[row][col].style.borderLeft = "3px solid black"            
            if(row==2)
                boardEl[row][col].style.borderBottom = "3px solid black"                    
            if(row==3)
                boardEl[row][col].style.borderTop = "3px solid black"
            if(row==5)
                boardEl[row][col].style.borderBottom = "3px solid black"                    
            if(row==6)
                boardEl[row][col].style.borderTop = "3px solid black"         
        }
    }

    

    puzzle = Array(9)
              .fill(null)
              .map((row)=>
                Array(9)
                  .fill(null)
                  .map(e=>-1))

    board = Array(9)
                .fill(null)
                .map((row)=>
                Array(9)
                    .fill(null)
                    .map(e=>-1))

    // puzzle[0][0]=4
    // puzzle[3][7]=2
    // puzzle[4][4]=1

    solverWorker.onmessage = function (ev){
        let [x,y,a]=ev.data
        boardEl[x][y].children[0].innerText= a==-1 ? " " : a
        board[x][y]=parseInt(a)
        
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 9; c++) {
                if(true || board[r][c]==-1 || puzzle[r][c]==-1){
                    let availss = availablesFrom(r,c,-1)
                    var availDiv = boardEl[r][c].querySelector(".available")
                    
                    availDiv.innerHTML=[0, 1, 2, 3, 4, 5, 6, 7, 8].reduce(
                        (acc,e) => availss.includes(e) ? acc+e.toString()+" " : acc+"<span style=\"background-color:red\">"+e.toString()+" </span>",
                        "")
                }
                else{
                    var availDiv = boardEl[r][c].querySelector(".available")                            
                    availDiv.innerText=""
                }                                                
            }                    
        }     
    }  
}

// setInterval(()=>{
//     let a = Math.floor(9*Math.random())
//     let b = Math.floor(9*Math.random())
//     let c = Math.floor(9*Math.random())    
//     boardEl[a][b].innerText=`${c}`
// },500)








initBoard()
enterEditMode()







