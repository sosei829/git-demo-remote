const game_state = {
  firstcardawait: 'firstcardawait',
  Secondcardawait: 'Secondcardawait',
  cardmatchfailed: 'cardmatchfailed',
  cardmatched: 'cardmatched',
  Gamefinish: 'Gamefinish',
}

const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const view = {
  getCardcontent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    // 當 class 超過兩個的連結需加雙引號
    return `<p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>`
  },
  getCardElement(index) {

    return `<div data-index="${index}" class= "card back"> 
    </div>`
  },

  // 特殊情形切換
  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  // 請試著理解 Array.from(Array(52).keys()).map(index => this.getCardElement(index)).join("")，Array是甚麼，map又是甚麼，join又是甚麼

  displayCards(indexs) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexs.map(index => this.getCardElement(index)).join("");
  }, // 逗點很重要阿// 加入三個點後，就可以丟進 n 個參數
  flipcards(...cards) {
    //如果是正面
    cards.map(card => {
      if (card.classList.contains('back')) {
        console.log('back')
        card.classList.remove('back')
        card.innerHTML = this.getCardcontent(Number(card.dataset.index))
        return
      }
      //回傳反面
      card.classList.add('back')
      card.innerHTML = null
    })


  },
  paircard(...card) {
    card.map(card => {
      card.classList.add('paired')
    })
  },
  renderScore(score) {
    //textcontent = innerText
    document.querySelector('.score').textContent = `score: ${score}`
    // innerText 的引號要用這個 ``
  },
  renderTriedTime(times) {
    document.querySelector('.tried').textContent = `You've tried: ${times} times`
  },
  appendwrong(...cards) {
    cards.map(card => {
      card.classList.add('wrong') //以add來加入屬性
      card.addEventListener('animationend', e => { //animationend 只能是小寫
        card.classList.remove('wrong')
      },
        {
          once: true
        }
      )
    })
  },
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${modal.score}</p>
      <p>You've tried: ${modal.tried} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }
}

const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const controller = {
  currentstate: game_state.firstcardawait,

  generateCard() {
    view.displayCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentstate) {
      case game_state.firstcardawait:
        view.flipcards(card)
        modal.revealcard.push(card)
        this.currentstate = game_state.Secondcardawait
        break
      case game_state.Secondcardawait:
        view.renderTriedTime(modal.tried += 1)
        view.flipcards(card)
        modal.revealcard.push(card)

        if (modal.IsrevealCardMatched()) {
          //配對正確
          view.renderScore(modal.score += 10)
          this.currentstate = game_state.cardmatched
          console.log(this.currentstate)
          view.paircard(...modal.revealcard)
          if (modal.score === 260) {
            console.log('showGameFinished')
            this.currentState = game_state.Gamefinish
            view.showGameFinished()  // 加在這裡
            return
          }
          this.currentstate = game_state.firstcardawait
          modal.revealcard = []

        } else {
          //配對失敗
          this.currentstate = game_state.cardmatchfailed
          console.log(this.currentstate)
          // 短暫的記憶時間
          view.appendwrong(...modal.revealcard)
          setTimeout(this.resetcard, 1000)

        }
        break
    }
    console.log('current state:', this.currentstate)
    console.log('revealed cards:', modal.revealcard)
    // console.log('revealed cards:', ...modal.revealcard.dataset.index)
  },
  resetcard() {
    view.flipcards(...modal.revealcard)
    modal.revealcard = []
    controller.currentstate = game_state.firstcardawait
    console.log(controller.currentstate)
  }

}

const modal = {
  revealcard: [],
  IsrevealCardMatched() {
    return this.revealcard[0].dataset.index % 13 == this.revealcard[1].dataset.index % 13
  },
  score: 0,
  tried: 0,
}

controller.generateCard()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    // console.log(card)
    // view.appendwrong(card)
    controller.dispatchCardAction(card)
  })
})