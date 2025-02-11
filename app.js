const sample = (array, size = 1) => {
  const { floor, random } = Math
  let sampleSet = new Set()
  for (let i = 0; i < size; i++) {
    let index
    do {
      index = floor(random() * array.length)
    } while (sampleSet.has(index))
    sampleSet.add(index)
  }
  return [...sampleSet].map((i) => array[i])
}

class Game {
  constructor(howManyTeams) {
    this.currentRound = 0
    this.teams = ["A", "B", "C", "D", "E", "F"].splice(0, howManyTeams)
    this.amountWords = 30
    this.words = sample(PALAVRAS, this.amountWords)

    this.currentTeamIndex = 0
    this.currentWordIndex = 0

    this.endOfRound = false
    this.endOfGame = false

    this.score = [
      new Array(30).fill(null), // each position contains "A", or "B" in the position of the word
      new Array(30).fill(null),
      new Array(30).fill(null),
    ]

    this.winnerPerRound = [null, null, null]
  }

  currentTeam() {
    return this.teams[this.currentTeamIndex]
  }
  currentWord() {
    return this.words[this.currentWordIndex]
  }
  currentRoundWinner() {
    return this.winnerPerRound[this.currentRound]
  }

  calcNextWordIndex() {
    // Return the index for the next unused word.
    // If last word in the round, return the same current index
    // If no more words, return -1
    let nextIndex = this.score[this.currentRound].findIndex(
      (x, i) => i > this.currentWordIndex && x === null,
    )
    if (nextIndex >= 0) {
      return nextIndex
    }
    return this.score[this.currentRound].findIndex((x) => x === null)
  }

  updateWinners() {
    // count points for each team
    const pointsPerTeam = this.teams.map(
      (t) => this.score[this.currentRound].filter((x) => x == t).length,
    )
    // identify the winner
    let winnerIndex = 0
    pointsPerTeam.forEach((p, i) => {
      if (p > pointsPerTeam[winnerIndex]) winnerIndex = i
    })
    this.winnerPerRound[this.currentRound] = this.teams[winnerIndex]
  }
  handleEndOfRound() {
    this.playSound();
    console.log("end of round")
    this.endOfRound = true
    this.updateWinners()
    if (this.currentRound == 2) {
      console.log("end of game")
      this.endOfGame = true
    }
  }

  startNextRound() {
    if (this.endOfGame) {
      console.log("game is finished, gotta start a new one")
    } else {
      this.endOfRound = false
      this.currentRound += 1
    }
  }

  switchTeams() {
    this.currentTeamIndex =
      this.currentTeamIndex === this.teams.length - 1 ? 0 : this.currentTeamIndex + 1
  }

  skipWord() {
    let nextIndex = this.calcNextWordIndex()
    if (nextIndex === this.currentWordIndex) {
      return // last word of the round, don't do anything
    } else if (nextIndex === -1) {
      this.handleEndOfRound()
    } else {
      this.currentWordIndex = nextIndex
    }
  }

  gotItRight() {
    this.score[this.currentRound][this.currentWordIndex] = this.currentTeam()
    let nextIndex = this.calcNextWordIndex()
    if (nextIndex === -1) {
      this.handleEndOfRound()
    } else {
      this.currentWordIndex = nextIndex
    }
  }
}

const startGameDialog = document.getElementById("start-game-dialog")
const getReadyDialog = document.getElementById("get-ready")
const timesUpDialog = document.getElementById("times-up")
const playingBox = document.getElementById("playing")
const gameBox = document.getElementById("game-box")

let game = new Game()
let timer = 0
let timerId = null

const resetTimer = () => {
  clearInterval(timerId)
  timer = 40
  timer = 5
}

resetTimer()

const hide = (el) => (el.style.display = "none")

const show = (el, display = "block") => (el.style.display = display)

const updateNotif = (text) => (document.getElementById("notif").innerHTML = text)

const updateGameUI = () => {
  document.getElementById("timer-seconds").innerHTML = timer
  // TODO: make more visible the changement of round
  document.getElementById("round").innerHTML = game.currentRound + 1
  // TODO: make more visible the changement of team
  document.getElementById("team").innerHTML = game.currentTeam()
  const wordBox = document.getElementById("word-box")
  if (game.endOfRound) {
    resetTimer()
    if (game.endOfGame) {
      updateNotif(
        "Fim da fase " +
          (game.currentRound + 1) +
          "<br>Equipe " +
          game.currentRoundWinner() +
          " venceu!" +
          "<br>Fim do jogo!",
      )
      show(timesUpDialog)
      hide(playingBox)
    } else {
      updateNotif(
        "Fim da fase " +
          (game.currentRound + 1) +
          "<br>Equipe " +
          game.currentRoundWinner() +
          " venceu!",
      )
      show(timesUpDialog)
      hide(playingBox)
    }
  } else {
    wordBox.innerHTML = game.currentWord()
  }
}

const timerFinished = () => {
  resetTimer()
  playSound();
  console.log("timer finished")
  show(timesUpDialog)
  hide(playingBox)
  game.skipWord()
}

const nextToPlay = () => {
  if (game.endOfRound && !game.endOfGame) {
    game.startNextRound()
  }
  // TODO: consider not switching if round switch and last team had less than 20 seconds to work
  game.switchTeams()
  updateGameUI()
  hide(timesUpDialog)
  show(getReadyDialog)
}

const playSound = () => {
    var audio = new Audio('audio.wav');
    audio.play();
}

const updateTimer = () => {
  if (timer > 0) {
    timer -= 1
  } else {
    timerFinished()
  }
  updateGameUI()
}

const startTimer = () => {
  updateNotif("Acabou o Tempo!")
  timerId = setInterval(updateTimer, 1000)
  updateGameUI()
  hide(timesUpDialog)
  hide(getReadyDialog)
  show(playingBox)
}

const skipWord = () => {
  game.skipWord()
  updateGameUI()
}

const gotItRight = () => {
  game.gotItRight()
  updateGameUI()
}

const startGame = () => {
  console.log("starting game...")
  const howMany = document.getElementById("how-many-teams").value
  game = new Game(howMany)
  hide(startGameDialog)
  updateGameUI()
  show(gameBox)
}
