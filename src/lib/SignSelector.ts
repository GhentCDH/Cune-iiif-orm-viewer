export interface Sign {
  side: 'obverse' | 'reverse' | 'top' | 'bottom'
  lineIndex: number
  wordIndex: number|null,
  charIndex: number
  text: string
}

export class SignSelector {
  side: 'obverse' | 'reverse' | 'top' | 'bottom'
  lineIndex: number|null
  charIndex: number|null
  wordIndex: number|null

  constructor(side: 'obverse' | 'reverse' | 'top' | 'bottom', lineIndex: number|null, wordIndex: number|null, charIndex: number|null) {
    this.side = side
    this.lineIndex = lineIndex
    this.wordIndex = wordIndex
    this.charIndex = charIndex
  }

  toString(): string {
    return `${this.side}-${this.lineIndex}-${this.wordIndex}-${this.charIndex}`
  }

  isEqual(other: SignSelector): boolean {
    return this.toString() === other.toString()
  }

  matches(sign: Sign): boolean {
    return (
      (this.side ? this.side == sign.side : true) &&
      (this.lineIndex ? this.lineIndex == sign.lineIndex : true) &&
      (this.wordIndex ? this.wordIndex == sign.wordIndex : true) &&
      (this.charIndex ? this.charIndex == sign.charIndex : true)
    )
  }
}
