class Calculator {
  constructor(previousOperandTextElement, currentOperandTextElement) {
    this.previousOperandTextElement = previousOperandTextElement
    this.currentOperandTextElement = currentOperandTextElement
    this.isOn = false;
    this.clear()
  }

  clear() {
    this.currentOperand = ''
    this.previousOperand = ''
    this.operation = undefined
    this.error = false;
    this.parenthesesCount = 0; // Track open parentheses
  }

  delete() {
    if (this.error) return;
    const lastChar = this.currentOperand.toString().slice(-1);
    if (lastChar === '(') this.parenthesesCount--;
    if (lastChar === ')') this.parenthesesCount++;
    this.currentOperand = this.currentOperand.toString().slice(0, -1);
  }

  appendNumber(number) {
    if (this.error) return;
    if (number === '(' || number === ')') {
      this.handleParentheses(number);
      return;
    }
    if(number === 'π'){
      number = Math.PI.toString();
    }
    if (number === '.' && this.currentOperand.includes('.')) return;
    if (number === '.' && this.currentOperand === '') {
      this.currentOperand = '0.';
    } else {
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
  }

  handleParentheses(parenthesis) {
    if (parenthesis === '(') {
      // Add multiplication operator if needed
      if (this.currentOperand !== '' && 
          !isNaN(this.currentOperand.slice(-1)) && 
          !this.currentOperand.endsWith('(') && 
          !this.currentOperand.endsWith('+') && 
          !this.currentOperand.endsWith('-') && 
          !this.currentOperand.endsWith('*') && 
          !this.currentOperand.endsWith('÷')) {
        this.currentOperand += '*';
      }
      this.parenthesesCount++;
      this.currentOperand += '(';
    } else if (parenthesis === ')') {
      // Only add closing parenthesis if there are open ones
      if (this.parenthesesCount > 0) {
        this.parenthesesCount--;
        this.currentOperand += ')';
      }
    }
  }

  chooseOperation(operation) {
    if (this.error) return;
    if (this.currentOperand === '') return;
    if (this.previousOperand !== '') {
      this.compute();
    }
    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
  }

  compute() {
    try {
      // Add missing closing parentheses
      let expression = this.currentOperand;
      while (this.parenthesesCount > 0) {
        expression += ')';
        this.parenthesesCount--;
      }

      // Replace ÷ with / for evaluation
      expression = expression.replace(/÷/g, '/');
      
      // Validate expression
      if (!this.validateExpression(expression)) {
        throw new Error('Invalid expression');
      }

      // Evaluate the expression
      const result = Function('return ' + expression)();
      
      if (!isFinite(result)) {
        throw new Error('Invalid calculation');
      }

      this.currentOperand = this.roundResult(result).toString();
      this.operation = undefined;
      this.previousOperand = '';
      this.parenthesesCount = 0;
    } catch (error) {
      this.error = true;
      this.currentOperand = 'Error';
    }
  }

  validateExpression(expr) {
    // Basic validation to check for valid mathematical expression
    const validChars = /^[0-9+\-*\/().π\s]*$/;
    if (!validChars.test(expr)) return false;
    
    // Check for balanced parentheses
    let count = 0;
    for (let char of expr) {
      if (char === '(') count++;
      if (char === ')') count--;
      if (count < 0) return false;
    }
    return true;
  }

  computeScientific(operation) {
    const current = parseFloat(this.currentOperand)
    if (isNaN(current)) return
    let result;

    switch (operation) {
      case 'sin':
        result = Math.sin(this.degreesToRadians(current));
        break;
      case 'cos':
        result = Math.cos(this.degreesToRadians(current));
        break;
      case 'tan':
        result = Math.tan(this.degreesToRadians(current));
        break;
      case 'log':
        result = Math.log10(current);
        break;
      case 'sqrt':
        result = Math.sqrt(current);
        break;
      case 'x²':
        result = Math.pow(current, 2);
        break;
      case 'x³':
        result = Math.pow(current, 3);
        break;
      case 'ln':
        result = Math.log(current);
        break;
      case 'n!':
        result = this.factorial(current);
        break;
      case 'x^y':
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.operation = '^';
        return;
      default:
        return;
    }
    if(this.error){
      this.currentOperand = 'Error'
    } else {
      this.currentOperand = this.roundResult(result).toString();
    }
  }

  computePercentage() {
    if (this.currentOperand === "") return;
    this.currentOperand = (parseFloat(this.currentOperand) / 100).toString();
  }

  getDisplayNumber(number) {
    const stringNumber = number.toString()
    const integerDigits = parseFloat(stringNumber.split('.')[0])
    const decimalDigits = stringNumber.split('.')[1]
    let integerDisplay
    if (isNaN(integerDigits)) {
      integerDisplay = ''
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 })
    }
    if (decimalDigits != null) {
      return `${integerDisplay}.${decimalDigits}`
    } else {
      return integerDisplay
    }
  }

  degreesToRadians(degree){
    return degree * (Math.PI / 180);
  }

roundResult(value) {
  return Math.round(value * 1e10) / 1e10;
}

  factorial(n) {
    if (n < 0) {this.error=true};
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  updateDisplay() {

    if (this.error) {
      this.currentOperandTextElement.innerText = 'Error';
      this.previousOperandTextElement.innerText = '';
      return;}

      this.currentOperandTextElement.innerText =
      this.getDisplayNumber(this.currentOperand)

      if (this.operation != null) {
      this.previousOperandTextElement.innerText =
        `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`
    } else {
      this.previousOperandTextElement.innerText = ''
    }
   
  }
}

const percentageButton = document.querySelector('[percentageButton]');
const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const allClearButton = document.querySelector('[data-all-clear]');
const previousOperandTextElement = document.querySelector('[data-previous-operand]');
const currentOperandTextElement = document.querySelector('[data-current-operand]');
const scientificButtons = document.querySelectorAll('[data-scientific]');

const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement)

scientificButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.computeScientific(button.innerText)
    calculator.updateDisplay()
  })
})

percentageButton.addEventListener("click", function() {
  calculator.computePercentage();
  calculator.updateDisplay();
})

numberButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.appendNumber(button.innerText)
    calculator.updateDisplay()
  })
})

operationButtons.forEach(button => {
  button.addEventListener('click', () => {
    calculator.chooseOperation(button.innerText)
    calculator.updateDisplay()
  })
})

equalsButton.addEventListener('click', () => {
  calculator.compute()
  calculator.updateDisplay()
})

allClearButton.addEventListener('click', () => {
  calculator.clear()
  calculator.updateDisplay()
})

deleteButton.addEventListener('click', () => {
  calculator.delete()
  calculator.updateDisplay()
})
