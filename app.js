const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')

module.exports.run = (flags) => {
	const game = new Game()
	game.init(flags)
}
class Game {
	constructor(){
	}
	init(flags) {
		this.correctWord=[]
		this.userCorrect=[]
		this.userGuesses = []
		this.output=[]
		this.userTrial=[]
		this.userWrong=0
		this.noOfHints=0
		this.difficultyLevel=''
		if (flags.difficulty==='hard') {
			this.difficultyLevel='hard'
			this.fetchWord('hw4_words.js','hard')
		}
		else if(flags.difficulty==='easy'){
			this.difficultyLevel='easy'
			this.fetchWord('hw4_words.js','easy')
		}
	}
	displayGame(rand){
		console.log(rand)
		console.log(chalk.yellow('--- Mystery Game -----------------------------\n'))

		for (let i = 0; i < rand.length; i++) {
			this.output.push('_')
		}
		console.log.apply(console,this.output)
		console.log(chalk.yellow('\n----------------------------------------------'))
		this.displayPrompts(rand)
	}
	displayAgain(rand,userCorrect,userGuesses){
		console.log(rand)
		console.log(this.userCorrect)
		console.log(chalk.yellow('--- Mystery Game -----------------------------\n'))

		for (let i = 0; i < rand.length; i++) {
			for (let j = 0; j < this.userCorrect.length; j++) {
				if (rand[i]===this.userCorrect[j]) {
					this.output[i]=this.userCorrect[j]
				}
			}
		}
		console.log.apply(console,this.output)
		console.log(chalk.yellow('\n----------------------------------------------'))
		this.ifWin(rand)
	}
	displayHint(rand,userInput,userGuesses){
		console.log(rand)
		
		let randletter=rand[Math.floor(Math.random()*rand.length)]
		//console.log(randletter)
		if (!this.userCorrect.includes(randletter)) {
			console.log(chalk.yellow('--- Mystery Game -----------------------------\n'))
			for (let i = 0; i < rand.length; i++) {
				for (let j = 0; j < randletter.length; j++) {
					if (this.output[i]==='_' && rand[i]===randletter) {
						this.output[i]=randletter
						if(!this.userGuesses.includes(chalk.blue(randletter))){
							this.userGuesses.push(chalk.blue(randletter))
						}
						break
					}
				}
			}
			console.log.apply(console,this.output)
			console.log(chalk.yellow('\n----------------------------------------------'))
			this.ifWin(rand)
		}
		else{
			this.displayHint(rand)
		}		
	}
	ifWin(rand){
		if (this.correctWord.toString()===this.output.toString()) {
			console.log(chalk.green('\n------------ C O N G R A T S -----------------'))
			this.playAgain()
		}
		else{
			this.displayPrompts(rand)
		}	
	}
	ifLose(rand){
		if (this.userGuesses.length-this.userTrial.length==4) {
			console.log(chalk.yellow('--- Mystery Game -----------------------------\n'))
			for (let i = 0; i < rand.length; i++) {
				for (let j = 0; j < this.userCorrect.length; j++) {
					if (rand[i]===this.userCorrect[j]) {
						this.output[i]=this.userCorrect[j]
					}
				}
			}
			console.log.apply(console,this.output)
			console.log(chalk.yellow('\n----------------------------------------------'))
			console.log(chalk.red('Answer: '+rand.toUpperCase()))
			console.log(chalk.red('\n------------ G A M E  O V E R ----------------'))
			this.playAgain()
		}
	}
	displayPrompts(rand){
		let guessedLetters=[]
		inquirer.prompt([{
			type: 'list',
			name: 'options',
			message: 'What would you like to do?',
			choices: [
			'Guess a letter.',
			'Get a hint.',
			'View Guessed Letters.'
			]
		}]).then((input) => {
			if(input.options == 'Guess a letter.' ){
				inquirer.prompt([{
					type: 'input',
					name: 'answer',
					message : `Guess a letter.`,
					filter: (input) => {
						if (input.length===1) {
							return input.toUpperCase()
						}
						else {
							this.displayGame(rand)
						}				
					}
				}]).then((input) => {
					this.isInside(input.answer,rand)
				})
			}
			else if (input.options == 'Get a hint.' ) {
				this.noOfHints++
				if (this.noOfHints<=2) {
					this.displayHint(rand)
				}
				else{
					console.log('No More Hints Left')
					this.displayAgain(rand)
				}
			}
			else if (input.options == 'View Guessed Letters.') {
				console.log(chalk.blue('--- Mystery Game -----------------------------\n'))
				console.log.apply(console,this.userGuesses)
				console.log(chalk.blue('\n----------------------------------------------'))
				this.displayPrompts(rand)
			}
		})
	}
	fetchWord(files,difficulty){
		let rand=''
		const splitOn = '\r\n\r\n\r\n'
		this.loopFiles(files, splitOn, (err, result) => {
			if (difficulty==='hard') {
				const listOfHard=result[1].substring(result[1].indexOf("[")+1,result[1].indexOf("]")).replace(/["'']/g,"").split(',')
				rand = listOfHard[Math.floor(Math.random() * listOfHard.length)].replace(/[^\w]/g,'')
			}
			else{
				const listOfEasy=result[0].substring(result[0].indexOf("[")+1,result[0].indexOf("]")).replace(/["'']/g,"").split(',')
				rand = listOfEasy[Math.floor(Math.random() * listOfEasy.length)].replace(/[^\w]/g,'')
			}
			for (let i = 0; i < rand.length; i++) {
				this.correctWord.push(rand[i].toUpperCase())
			}
			this.displayGame(rand.toUpperCase())
		})
	}
	loopFiles(file, splitOn, callback){
		fs.readFile(file, 'utf8', (err, data) => {
			if (err)
				console.log(err)
			const wordlist = data.split(splitOn)
			callback(null, wordlist)
		})
	}
	isInside(answer,rand){
		this.userGuesses.push(chalk.blue(answer))
		for (let i = 0; i < rand.length; i++) {
			if (rand[i]===answer) {
				this.userCorrect.push(answer)
				this.userWrong++
				this.output[i]=answer
			}
		}
		if (this.userWrong!=0) {
			this.userTrial.push(chalk.blue(answer))
			this.userWrong--
		}
		if (this.userGuesses.length-this.userTrial.length<4) {
			console.log(chalk.red(4-(this.userGuesses.length-this.userTrial.length)+' MORE WRONG AND GAME OVER.'))
			this.displayAgain(rand,this.userCorrect,this.userGuesses)
		}
		this.ifLose(rand)
	}
	playAgain(){
		inquirer.prompt([{
			type: 'confirm',
			name: 'again',
			message: 'Play Again?'
		}]).then((confirm) => {
			if (confirm.again) {
				console.log('you have chose to play again')
				console.log(this.difficultyLevel)
				this.correctWord=[]
				this.userCorrect=[]
				this.userGuesses = []
				this.output=[]
				this.userTrial=[]
				this.userWrong=0
				this.noOfHints=0
				this.fetchWord('hw4_words.js',this.difficultyLevel)
			}
			else{
				console.log('you have chose to exit')
				process.exit()
			}	
		})
	}
}
